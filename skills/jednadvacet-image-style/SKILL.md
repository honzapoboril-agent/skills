---
name: jednadvacet-image-style
description: Use when a task requires inspecting, editing, preparing, or generating photographs or raster image assets for Jednadvacet, including article/podcast thumbnails, portraits, OG/social images and YouTube thumbnails. Covers crop, resize, upscale, background removal, color grading, retouching, object edits, outpainting/background extension, and visual verification. Uses local ImageMagick for deterministic operations and the bundled PPQ CLI for GPT Image/Nano Banana generation, edits and optional processing models. Load before manipulating image files or calling an image-generation API. Not needed for merely referencing an unchanged image in code, unrelated image-provider configuration, or icon-only changes.
---

# Jednadvacet Image Style

Create a coherent editorial image system from authentic photographs and believable generated scenes. Default to **graphite neutralization**: natural people and environments, controlled color, deep graphite shadows, warm cream highlights, and optional restrained orange accents.

Read [references/style-guide.md](references/style-guide.md) before editing or generating an image. It contains the color recipe, decision rules, prompt templates, and QA checklist.

## Ask for tool selection before image work

Before any image modification or generation, use `question` to let the user choose the tools. This applies to every operation: crop, resize, upscale, background removal, grading, recoloring, retouching, object edits, outpainting, and new-image generation. Do not start a local edit merely because it is free, deterministic, or recommended below. Read-only inspection of the source, dimensions, installed tools, and the live PPQ catalog may precede the question.

Offer task-specific options in one concise question:

- **Local algorithmic processing** — name the available tool (usually ImageMagick, or existing sharp), explain what it can deliver and its limitations; no API charge.
- **Each suitable remote AI model separately** — use names/IDs and capabilities verified in the live catalog, with current estimated cost per variant and relevant fidelity tradeoffs. For example, offer Aura SR, Topaz and Crystal separately for upscaling; BiRefNet V2 for segmentation; suitable GPT Image/Nano Banana editors for generative edits or grading when requested.
- **Existing local AI backends**, if actually configured and suitable.
- **All suitable options + comparison** — include the local algorithmic variant and every listed suitable AI model, state the combined estimated cost, and compare their results. This is a bounded set of the options presented, not every model in the provider catalog.

Do not offer a tool as capable of an operation it cannot perform: interpolation does not reconstruct detail, a crop does not invent photographic surroundings, and segmentation is not a scene edit. If no local algorithmic method can achieve the outcome, explain that briefly instead of presenting a false equivalent. A recommendation is advisory; wait for the choice and approval of the paid scope/budget. If the user already explicitly selected tools and approved the relevant paid scope, proceed without asking again.

For multi-operation requests, allow one choice of a complete workflow or separate choices per operation. Explain shared steps and charge estimates once; an approved AI workflow may include necessary local mask application, compositing, exact sizing and export without another question. Ask again before adding a new creative operation or an unselected paid model. Preserve the original and produce separate named variants when comparison is selected; never silently fall back from a failed selected method to another.

For comparison, process the same source with the same intended framing and treatment. Inspect full compositions on appropriate backgrounds and aligned detail crops at comparable displayed sizes; also inspect native-resolution details and report differences in output dimensions. Separate technical checks (dimensions, alpha, pixel equality) from subjective visual judgments. Explain the recommendation and visible reconstruction/artifacts without claiming measured fidelity or true recovered detail when no high-resolution reference exists.

## PPQ image CLI (Node 24+)

Use `node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts check` to discover current GPT Image / Nano Banana capabilities and pricing. The CLI reads `PPQ_API_KEY`, or OpenCode's selected v2 SQLite credential / v1 `auth.json` under `$XDG_DATA_HOME/opencode`. `--data-dir` overrides that directory. It never prints keys and does not use ChatGPT OAuth as an Image API key. The installed OpenCode SDK has no image-generation endpoint; this CLI calls PPQ directly without importing internal OpenCode modules.

Run `generate --model <id> --prompt <prompt>` or `edit --model <id> --image <local-file> --prompt <prompt> --transport multipart`. JSON transport accepts a URL or encodes a local file as a data URL; support must be verified per model. `--aspect`, `--quality` and `--resolution` are checked against the live catalog where possible. `--out` selects a fresh output directory (default `/tmp/ppq-image/<timestamp>`); `report.json` records results, timings and reported costs. No automatic retries.

Use `process --model <id> --image <file-or-URL>` for upscaling/background-removal models. Omit prompt, aspect ratio and resolution unless the live model supports them. `check` also discovers processing models by name/category/tags, not just ID: the current background-removal ID is `birefnet-v2` (tagged `rembg`), not `rembg`. Select the actual ID from the live catalog. Default JSON transport uses the same image endpoint; successful generation/edit tests do not establish that every processing model or upload form works. Report these as unverified until individually exercised.

`experiment --budget 1` makes paid calls comparing four generation models and two editing models, including prompt-based 9:16 canvas expansion without masks. Budget reservations use live catalog estimates, include failed calls conservatively, and apply only to that invocation. They are not a provider-side spending cap. Get the user's budget before running paid calls. A successful API response does not prove photographic invariants or outpainting passed; inspect the output. Never promise unchanged pixels from unmasked generative edits.

Verified on 2026-10-10: generation with `gpt-image-2.5-flare`, `gpt-image-2`, `nano-banana-2`, and `nano-banana-pro`; editing with `gpt-image-2.5-sunburst` and `nano-banana-2-edit` using both JSON data URLs and multipart uploads. Both editors produced vertical canvas expansions, but re-rendered the original scene. Use multipart for a simple local-file workflow; JSON data URLs also worked in this test. Recheck catalog capabilities and prices on each run. Actual dimensions were approximate to requested aspect ratios, so inspect dimensions and finish with a deterministic crop/resize if an exact ratio is required. No claim of mask support follows from these tests. V1 credentials were exercised live; v2 SQLite lookup was tested against a schema fixture, not a running v2 installation.

## Choose the workflow

- **Existing image:** inspect the original, identify protected content and competing colors, ask for tools, then apply the selected workflow. Recommend local grading for pixel preservation, but offer suitable remote editors with their re-rendering tradeoffs.
- **New image:** design an authentic ordinary photographic scene, ask for a suitable generation model or a comparison, then generate with the style-guide prompt and composition rules.
- **Content edit / background extension:** ask for tools and distinguish local crop/compositing from inventing new pixels. Follow the generative edit workflow below when an AI editor is selected.
- **Review only:** compare the image against the style guide and report specific deviations without modifying it.
- **Shared base / variant check:** for article thumbnails and OG/social outputs, verify that one photographic base works for all intended crops and overlays, then verify the rendered variants on the project's debug page when available.

### Select tools by responsibility

| Task | Suitable tools to offer | Reason |
|---|---|---|
| Dimensions, format, crop, resize, export, comparison | ImageMagick (`magick identify`, `magick`, `magick compare`) | Deterministic, local, no paid generation |
| Graphite grading, selective neutralization, safe recoloring | ImageMagick with local masks; sharp if already available | Preserve documentary geometry and identity |
| Upscale without invented detail | ImageMagick Lanczos/bicubic interpolation | No AI reconstruction of faces, lettering or textures; adds no genuine source detail |
| AI detail reconstruction / upscale | PPQ CLI `process` with a catalog-listed upscaler, or an already configured local Real-ESRGAN/Upscayl/ComfyUI backend | Optional reconstruction; may change textures, letters and facial details |
| Remove background | Local manually prepared alpha mask, existing local segmentation backend, or PPQ `process` with a discovered background-removal model (currently `birefnet-v2`) | Segmentation is not a scene edit; apply the resulting alpha mask to the original locally for controlled preservation |
| New photographic scene | PPQ CLI `generate` | Requires generative content |
| Scene/object edit or new surrounding background | PPQ CLI `edit`, then local finishing/compositing | AI proposes content; local tools control the final crop and protected regions |
| Logo/title layout | Existing site image template | Exact SVG logo and typography, not AI lettering |
| Rendered-variant QA | `agent-browser` and image inspection | Verify actual outputs at desktop/mobile and thumbnail scale |

The table describes tool suitability, not permission to begin processing before the user's selection. Prefer available ImageMagick over installing another local editor. Use sharp only when already available and useful for the operation. Offer suitable remote editors for grading/recoloring too, explaining that they may re-render protected content. Keep original files intact; work in `/tmp` until the result is verified.

## Upscaling and background removal: choose the fidelity level

For upscaling, ask the user to choose **local interpolation**, individual **AI reconstruction models through PPQ**, **an existing local AI backend** when available, or **all suitable options + comparison**. Recommend interpolation when exact content preservation is essential, but do not select it automatically. Interpolation cannot recover missing detail; AI can infer convincing detail but cannot guarantee its correctness. Check current PPQ capabilities/prices for candidates such as `aura-sr`, `topaz-upscale` and `crystal-upscaler`; avoid automatic face enhancement. The CLI exposes only documented catalog options, not arbitrary vendor-specific controls. Preserve the source and compare identity, text, logos, small textures and edges before accepting AI output.

For background removal, offer **manual/local alpha masking**, **existing local segmentation** (e.g. rembg/ComfyUI if installed), and **PPQ background removal** via `process` (currently `birefnet-v2`). If an expected ID is absent, inspect model names and tags in `check` before declaring the capability unavailable. Do not substitute black-color keying merely because `rembg` is not an ID: it can erase dark subject details; use it only for a demonstrably separable uniform background and inspect the boundaries. Use segmentation rather than a GPT/Nano Banana scene-edit prompt when the goal is simply transparency. Inspect the returned dimensions and alpha channel: if it provides a usable aligned cutout, extract its alpha and apply it locally to the original photograph. Never assume the service preserved original RGB. Reject unexpected rescaling/misalignment for an exact-preservation task; do not stretch the original to match it. Evaluate hair, cables, holes, glass and translucent surfaces on both light and dark backgrounds. If the output is opaque and no documented mask is returned, do not claim successful background removal or invent a mask from arbitrary luminance.

Keep mask application separate from edge cleanup, spill suppression and RGB grading: those can intentionally modify subject pixels and must be reported. Verify retained RGB against the source on lossless working files; alpha changes intentionally remove background, and semi-transparent edges affect displayed colors. No AI upscaler or segmentation mask is universally error-free. Use supported local tools when available, or the PPQ CLI; do not install a local model stack implicitly.

## Edit an existing image

1. Inspect the image at useful resolution before editing.
2. List invariants that must survive: identity, expressions, hands, anatomy, text, logos, privacy masks, object count, framing, perspective, aspect ratio, and documentary imperfections.
3. Ask for tools before processing. Recommend ImageMagick (or existing sharp) for pixel-preserving color and tone adjustments; offer suitable AI editors individually and all suitable options + comparison. With AI, inspect re-rendering and restore protected pixels locally when feasible. Keep geometry and content invariant unless their modification was requested. Change framing/aspect ratio only when composition work was requested, and record the permitted changes separately from protected content.
4. Apply graphite neutralization as the default. Do not force orange into an image that has no safe orange candidate.
5. Handle strong competing colors selectively rather than relying on global desaturation alone.
6. Render non-destructively and compare the result with the original.
7. Correct within the selected workflow if any invariant or style rule fails; use the source rather than repeatedly degrading an intermediate export. Ask before switching methods or adding a paid call outside the approved scope.

If a generative edit repeatedly changes protected content, say so. For production-critical identity, text, logos, or exact framing, recommend deterministic masked grading instead of pretending the edit is exact.

## Generate a new image

1. Preserve the requested subject and editorial meaning.
2. Build a believable, ordinary photographic situation: normal human viewpoint, available light, deep-enough focus, small compositional imperfections, real materials, and candid gestures.
3. Make orange physical and plausible when used: a notebook, display, tag, lamp, tool, or reflected light. Omit it if the scene does not naturally support it.
4. Run the PPQ CLI `check` once for current capabilities/prices and credential availability. Ask the user to select among suitable models individually or all suitable options + comparison. `gpt-image-2.5-flare`, `nano-banana-2` and `nano-banana-pro` are tested candidates if still supported, not automatic selections or a universal quality ranking.
5. Add the full visual recipe and negative constraints from the style guide to the generation prompt. Invoke `generate` with the selected models, intended aspect ratio, supported quality/resolution, fresh output directories and the agreed budget. Generate one image per selected model unless otherwise requested; do not run the unrelated `experiment` scenes as a production comparison.
6. Inspect the returned image and its real dimensions. Finish precise geometry and remaining color corrections locally; do not make a second paid call just to resize or grade.
7. Review realism, anatomy, text, counts, palette, and thumbnail readability before delivery. Make a targeted paid correction only if the task needs it and budget remains; never silently retry a timeout.

## Generative content edits and background extension

1. Name the intended content change and protected features. For extension, offer local crop/reposition when it can satisfy the outcome and AI editing when genuine new photographic surroundings are needed; wait for tool selection before trying either. Keep crop/aspect changes distinct from color-only grading.
2. Check current model capabilities and budget, then ask for individual suitable editors or all suitable options + comparison. `gpt-image-2.5-sunburst` and `nano-banana-2-edit` are tested candidates with local inputs. Use the selected editor(s). Prefer `--transport multipart`; JSON data URLs are an alternative. The CLI has no mask option, and instruction-only edits are not verified masked inpainting.
3. Pass the original file through `edit --image`, with a narrowly targeted prompt describing the change, invariants and target aspect ratio. Include the style recipe when creating new surroundings, without requesting unnecessary changes to the existing scene.
4. Inspect the AI proposal beside the source: identity, geometry, object count, text, privacy masks, lighting and texture continuity. A successful response is not acceptance. Prompt-based outpainting re-rendered original content in the verified tests.
5. If protected content must remain exact, align the proposal and composite only the permitted content locally, copying the original protected pixels back unchanged. Do not stretch the original to fit. Include any feathered seam in the permitted edit area. If alignment or a natural join fails, report the proposal as unsuitable rather than claiming exact preservation.
6. Verify protected regions with pixel comparison on lossless working images before final JPEG export. For changed dimensions, compare aligned matching regions, not unrelated full canvases. Complete crop, grading and resize locally, then run the shared-base/variant checks.

See the style guide's executable examples and extension prompt. If credentials are unavailable, deliver a ready-to-run prompt and say no generation occurred; do not install a backend or ask for a key to be pasted into the conversation.

## Prepare and verify the shared photographic base

One photographic base serves both the article page and the generated OG/social variants. It carries no burned-in title or logo; those are added by the site template as a deterministic overlay. Apply the grading workflow above, then check composition against the shared-base criteria in the style guide:

1. Confirm the base is landscape **16:9**, at least 1920 × 1080 px where possible.
2. Compose for right-aligned OG crops: keep the essential face or key object in the right-hand region, ideally x 70–95%, y 40–60%. Square crops retain x 44–100%, 4:5 retains x 55–100%, and 9:16 retains x 68–100% of a 16:9 base. Preserve breathing room at the right edge and verify the article's centered vertical crop separately.
3. Keep the top-left quadrant visually calm so the overlaid title stays readable, and the bottom-left free of critical content for the logo.
4. Ensure the base also yields usable landscape, square, portrait, and vertical crops; a crop that loses the subject or the calm overlay areas fails.
5. When the project provides a debug page (e.g. `/debug/blog/<slug>`), review the rendered article crop and every social variant from it, at real size and reduced to thumbnail scale, rather than judging only from guides.

## Verify rendered variants

On the debug page or equivalent output, check for each variant:

- the title is legible, correctly spelled with Czech diacritics, and not clipped;
- the logo is undistorted and in the bottom-left;
- the subject is not hidden by the title, logo, duration badge, or the crop;
- the base photograph is unchanged apart from the intended crop;
- square and vertical outputs are re-composed crops, not stretched or letterboxed versions of the landscape.

Report a base as failing when any variant cannot keep the subject and the overlay zones intact; then adjust the base's crop or composition, not the overlay template, unless the user asks otherwise.

## Default behavior

- Ask for tools before every modification/generation unless already explicitly selected. Produce one result for a single selected method, or named variants for the selected comparison.
- For stylistic treatment (separate from tool selection), use these two named options when relevant:
  - **A — Graphite neutralization:** preferred editorial default.
  - **B — Controlled orange remap:** exploratory; recolor only a safe non-semantic element.
- Keep orange to a small accent, normally about 3–10% of the image.
- Prioritize authenticity and information over brand color.
- Never recolor skin, safety information, meaningful product colors, third-party brand colors, food, or identity-bearing objects just to introduce orange.

## Delivery

Show the result and briefly state:

- what was neutralized;
- where orange was retained, introduced, or intentionally omitted;
- whether any generative drift remains;
- whether the result is a concept or production-ready.

When PPQ was used, also state the model, actual output dimensions, reported cost (or that cost was not reported), output/report paths, and which changes were generated versus locally finished. Do not include keys, encoded image payloads or signed media URLs.

For shared-base work additionally state:

- which crops or overlays the base supports (article, landscape OG, square, portrait, vertical);
- which variants passed or failed verification and why;
- if no image tool or debug page was available, say the verification was composition-only and the rendered variants still need a visual check.
