import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

// Node 24+, no dependencies. Credentials stay in-process; never passed to shell commands.
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: Object.fromEntries([
    'model', 'prompt', 'image', 'aspect', 'quality', 'resolution', 'transport',
    'out', 'budget', 'data-dir',
  ].map(name => [name, { type: 'string' as const }])),
})
const command = positionals[0] ?? 'help'
const base = 'https://api.ppq.ai/v1'
const output = resolve(values.out ?? `/tmp/ppq-image/${Date.now()}`)
const budget = Number(values.budget ?? '1')
type RecordValue = Record<string, unknown>
type Model = { id: string; name: string; category: string; tags: string[]; capabilities: RecordValue; pricing: RecordValue }
type Attempt = {
  model: string; transport: string; aspect: string; prompt: string; source?: string
  status: string; reservedUsd: number; costUsd?: number; seconds?: number
  file?: string; dimensions?: string; error?: string
}
const attempts: Attempt[] = []
function record(value: unknown): RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as RecordValue : {}
}

async function credentials() {
  if (process.env.PPQ_API_KEY) return { key: process.env.PPQ_API_KEY, source: 'PPQ_API_KEY' }
  const directory = values['data-dir'] ?? join(
    process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), 'opencode',
  )
  const database = join(directory, 'opencode.db')
  if (existsSync(database)) {
    const { DatabaseSync } = await import('node:sqlite')
    const db = new DatabaseSync(database, { readOnly: true })
    try {
      const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='credential'").get()
      if (table) {
        const columns = db.prepare('PRAGMA table_info(credential)').all().map(row => row.name)
        const order = columns.includes('active') ? 'active DESC, time_created DESC, id DESC' : 'time_created DESC, id DESC'
        // Select exactly the credential OpenCode selects, including OAuth; never resurrect an inactive key.
        const row = db.prepare(`SELECT value FROM credential WHERE integration_id = ? ORDER BY ${order} LIMIT 1`).get('ppq')
        if (row) {
          const entry = record(JSON.parse(String(row.value)))
          if (entry.type === 'key' && typeof entry.key === 'string' && entry.key)
            return { key: entry.key, source: 'OpenCode v2 SQLite credential (read-only)' }
          throw new Error('Selected PPQ v2 credential is not an API key; set PPQ_API_KEY explicitly.')
        }
      }
    } finally { db.close() }
  }
  const file = join(directory, 'auth.json')
  if (existsSync(file)) {
    const entry = record(record(JSON.parse(await readFile(file, 'utf8'))).ppq)
    if ((entry.type === 'api' || entry.type === 'key') && typeof entry.key === 'string' && entry.key)
      return { key: entry.key, source: 'OpenCode auth.json' }
  }
  throw new Error('No PPQ API key: connect PPQ in OpenCode or set PPQ_API_KEY.')
}

async function catalog(): Promise<Model[]> {
  const response = await fetch(`${base}/models?type=image`, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`)
  const json = record(await response.json())
  if (!Array.isArray(json.data)) throw new Error('Invalid model catalog')
  return json.data.map(value => {
    const item = record(value)
    return {
      id: String(item.id), name: typeof item.name === 'string' ? item.name : '',
      category: typeof item.category === 'string' ? item.category : '',
      tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      capabilities: record(item.capabilities), pricing: record(item.pricing),
    }
  })
}

function estimate(model: Model, quality?: string, resolution?: string): number {
  const variants = Array.isArray(model.pricing.variants) ? model.pricing.variants.map(record) : []
  const variant = variants.find(item => item.quality === quality)
    ?? variants.find(item => item.quality === (resolution === '4K' ? '4k' : 'standard'))
  const options = Array.isArray(variant?.options) ? variant.options.map(record) : []
  const price = options.find(item => item.size === resolution) ?? options.find(item => item.size === 'default')
  if (typeof price?.price === 'number') return price.price
  if (!resolution && !quality && typeof model.pricing.base_price === 'number') return model.pricing.base_price
  throw new Error(`Cannot estimate ${model.id}; specify a priced quality/resolution`)
}

async function run(models: Model[], key: string, options: {
  model: string; prompt?: string; image?: string; aspect?: string
  quality?: string; resolution?: string; transport?: string
}) {
  const model = models.find(item => item.id === options.model)
  if (!model) throw new Error(`Model not in live catalog: ${options.model}`)
  const cap = model.capabilities
  if (cap.requires_prompt && !options.prompt) throw new Error(`${model.id} requires a prompt`)
  if (options.prompt && !cap.accepts_prompt) throw new Error(`${model.id} does not accept a prompt; omit --prompt`)
  const transport = options.transport ?? 'json'
  if (!['json', 'multipart'].includes(transport)) throw new Error('Transport must be json or multipart')
  if (transport === 'multipart' && !options.image) throw new Error('Multipart requires a local image')
  if (options.image && !cap.accepts_image_url) throw new Error(`${model.id} does not accept image input`)
  if (!options.image && cap.requires_image_url) throw new Error(`${model.id} requires image input`)
  if (options.quality && (!Array.isArray(cap.quality_options) || !cap.quality_options.includes(options.quality)))
    throw new Error(`Unsupported quality for ${model.id}: ${options.quality}`)
  if (options.resolution && !cap.accepts_resolution) throw new Error(`${model.id} does not accept resolution`)
  if (options.resolution && Array.isArray(cap.resolution_options) && !cap.resolution_options.includes(options.resolution))
    throw new Error(`Unsupported resolution for ${model.id}: ${options.resolution}`)
  const reservedUsd = estimate(model, options.quality, options.resolution)
  const spent = attempts.reduce((sum, item) => sum + Math.max(item.reservedUsd, item.costUsd ?? 0), 0)
  if (spent + reservedUsd > budget) throw new Error(`Budget would exceed $${budget}; reserved so far $${spent.toFixed(4)}`)
  const aspect = options.aspect ?? (cap.accepts_aspect_ratio ? '16:9' : 'source')
  if (options.aspect && !cap.accepts_aspect_ratio) throw new Error(`${model.id} does not accept an aspect ratio; omit --aspect`)
  const fields: RecordValue = { model: model.id }
  if (options.prompt) fields.prompt = options.prompt
  if (cap.accepts_aspect_ratio) fields.size = aspect
  if (options.quality) fields.quality = options.quality
  if (options.resolution) fields.resolution = options.resolution
  if (cap.accepts_output_format) fields.output_format = 'png'
  const headers = new Headers({ Authorization: `Bearer ${key}` })
  let body: string | FormData
  if (transport === 'multipart') {
    if (/^https?:/.test(options.image!)) throw new Error('Multipart requires a local file, not a URL')
    const form = new FormData()
    for (const [name, value] of Object.entries(fields)) form.set(name, String(value))
    const bytes = await readFile(options.image!)
    form.set('image', new Blob([bytes], { type: mime(options.image!) }), basename(options.image!))
    body = form
  } else {
    if (options.image) fields.image_url = /^https?:/.test(options.image)
      ? options.image : `data:${mime(options.image)};base64,${(await readFile(options.image)).toString('base64')}`
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(fields)
  }
  const attempt: Attempt = {
    model: model.id, transport, aspect, prompt: options.prompt ?? '', source: options.image,
    status: 'started', reservedUsd,
  }
  attempts.push(attempt)
  await save()
  const start = performance.now()
  console.log(`Calling ${model.id} (${transport}, ${aspect}), reserve $${reservedUsd}`)
  try {
    // No automatic retries: an interrupted generation might still be billed.
    const response = await fetch(`${base}/images/${transport === 'multipart' ? 'edits' : 'generations'}`, {
      method: 'POST', headers, body, signal: AbortSignal.timeout(240_000),
    })
    const json = record(await response.json())
    if (typeof json.cost === 'number') attempt.costUsd = json.cost
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(json).slice(0, 600)}`)
    const image = record(Array.isArray(json.data) ? json.data[0] : undefined)
    let bytes: Buffer
    if (typeof image.b64_json === 'string') bytes = Buffer.from(image.b64_json, 'base64')
    else if (typeof image.url === 'string' && new URL(image.url).protocol === 'https:') {
      // Signed media URLs do not need credentials. Never forward the PPQ key here.
      const download = await fetch(image.url, { signal: AbortSignal.timeout(60_000) })
      if (!download.ok) throw new Error(`Download HTTP ${download.status}`)
      bytes = Buffer.from(await download.arrayBuffer())
    } else throw new Error('No downloadable image in response')
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    const jpeg = bytes[0] === 255 && bytes[1] === 216
    const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
    if (!png && !jpeg && !webp) throw new Error('Response is not PNG/JPEG/WebP')
    const file = join(output, `${attempts.length}-${model.id.replace(/[^a-z\d-]/gi, '-')}-${transport}.${png ? 'png' : jpeg ? 'jpg' : 'webp'}`)
    await writeFile(file, bytes)
    attempt.file = file
    try { attempt.dimensions = execFileSync('identify', ['-format', '%wx%h', file], { encoding: 'utf8', timeout: 10_000 }) }
    catch { attempt.dimensions = 'unverified (identify unavailable or failed)' }
    attempt.status = 'ok'
  } catch (error) {
    attempt.status = 'failed'
    attempt.error = (error instanceof Error ? error.message : String(error)).split(key).join('[redacted]').replace(/data:image\/[^\s"]+/g, '[image-data]')
  } finally {
    attempt.seconds = Math.round((performance.now() - start) / 100) / 10
    await save()
    console.log(JSON.stringify(attempt))
  }
  return attempt.file
}
function mime(file: string) {
  if (/\.png$/i.test(file)) return 'image/png'
  if (/\.webp$/i.test(file)) return 'image/webp'
  if (/\.jpe?g$/i.test(file)) return 'image/jpeg'
  throw new Error('Image must be PNG, JPEG or WebP')
}
async function save() {
  await mkdir(output, { recursive: true })
  await writeFile(join(output, 'report.json'), JSON.stringify({
    budgetUsd: budget, reservedUsd: attempts.reduce((sum, item) => sum + Math.max(item.reservedUsd, item.costUsd ?? 0), 0),
    reportedCostUsd: attempts.reduce((sum, item) => sum + (item.costUsd ?? 0), 0), attempts,
  }, null, 2))
}
async function main() {
  if (!['check', 'generate', 'edit', 'process', 'experiment'].includes(command)) {
    console.log('Node 24+: ppq-image.ts check | generate | edit | process | experiment\nOptions: --model --prompt --image --aspect --quality --resolution --transport json|multipart --out --budget (default 1 USD) --data-dir\nprocess: source-image models (upscalers/background removal); prompt only if supported/required.\nexperiment: GPT/Nano Banana generation, unmasked editing and prompt-based canvas expansion. No retries. Budget covers this invocation only; use a fresh output directory.')
    return
  }
  if (!Number.isFinite(budget) || budget <= 0) throw new Error('Budget must be a positive USD amount')
  if (command !== 'check' && existsSync(join(output, 'report.json'))) throw new Error('Output already has a report; choose a fresh directory')
  const auth = await credentials()
  console.log(`Credential source: ${auth.source} (key never logged)`)
  const models = await catalog()
  if (command === 'check') {
    console.log(JSON.stringify(models.filter(item =>
      /gpt-image|nano-banana|upscal|aura-sr|rembg|birefnet|background|segment|cutout/i
        .test([item.id, item.name, item.category, ...item.tags].join(' ')),
    ), null, 2))
    return
  }
  if (command !== 'experiment') {
    if (!values.model) throw new Error('--model is required')
    if (command !== 'process' && !values.prompt) throw new Error('--prompt is required')
    if (['edit', 'process'].includes(command) && !values.image) throw new Error(`${command} requires --image`)
    const file = await run(models, auth.key, {
      model: values.model, prompt: values.prompt, image: values.image, aspect: values.aspect,
      quality: values.quality, resolution: values.resolution, transport: values.transport,
    })
    if (!file) process.exitCode = 1
    return
  }
  const prompt = 'Authentic ordinary photograph of a worn wooden desk in a Czech workshop. One small orange notebook at center-right and a plain grey ceramic mug immediately to its left. No people, no text, no logos. Natural window light, deep enough focus, real wood grain, graphite #111827 shadows with texture, subtle warm cream highlights, restrained saturation, no cinematic effects. Keep the top-left and bottom-left visually calm.'
  let source: string | undefined
  for (const id of ['gpt-image-2.5-flare', 'gpt-image-2', 'nano-banana-2', 'nano-banana-pro']) {
    const file = await run(models, auth.key, { model: id, prompt, quality: id.startsWith('gpt') ? 'low' : undefined })
    source ??= file
  }
  if (!source) throw new Error('No generation succeeded; stopping edits')
  for (const id of ['gpt-image-2.5-sunburst', 'nano-banana-2-edit']) {
    const quality = id.startsWith('gpt') ? 'low' : undefined
    const editPrompt = 'Change only the grey mug to a dark blue mug. Preserve its position, shape, lighting, the orange notebook and every other part of the photograph. No text or logos.'
    for (const transport of ['json', 'multipart'])
      await run(models, auth.key, { model: id, prompt: editPrompt, image: source, quality, transport })
    await run(models, auth.key, {
      model: id, image: source, quality, aspect: '9:16', transport: 'multipart',
      prompt: 'Expand this landscape photograph into a vertical 9:16 canvas by adding continuation of the workshop wall above and desk below. Retain the entire original photograph centered, with original geometry, objects, lighting and colors unchanged. Do not crop, zoom or stretch the source. Generate only the new surrounding background. No text or logos.',
    })
  }
}
await main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Unexpected failure')
  process.exitCode = 1
})
