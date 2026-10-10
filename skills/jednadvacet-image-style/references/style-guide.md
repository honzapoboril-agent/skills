# Jednadvacet authentic graphite image style

## 1. Visual intent

Make ordinary, spontaneous photography feel coherent and editorial without making it look staged, cinematic, or advertising-led. The photograph should still look like a credible moment captured on a good phone or everyday camera.

Core palette:

- graphite shadows: `#111827`;
- orange accent: `#f68b09`;
- highlights: warm cream, never a yellow wash;
- skin: natural and independently protected.

Orange is optional. Graphite structure and controlled color are sufficient brand signals.

## 2. Default color recipe

Use these values as starting points, not rigid output requirements:

| Control | Starting value |
|---|---:|
| Global saturation | -15% |
| Green saturation | -60% |
| Cyan saturation | -50% |
| Blue saturation | -45% |
| Purple saturation | -50% |
| Yellow saturation | -30% |
| Orange saturation | +10% to +20% |
| Orange luminance | +5% |

Also:

- deepen shadows toward `#111827` while retaining texture;
- keep medium natural contrast;
- warm highlights slightly toward cream;
- preserve realistic mixed available light;
- add only extremely subtle grain;
- avoid HDR halos, crushed blacks, neon color, and teal-and-orange grading.

## 3. Graphite neutralization

Use this as the default response to large distracting colors.

1. Protect skin and other invariant content with masks.
2. Reduce the saturation of a dominant green, blue, cyan, purple, or yellow region by roughly 50–70%.
3. Move the remaining hue toward graphite, warm grey, brown, or restrained olive while preserving luminance and material texture.
4. Let existing wood, amber light, orange displays, or small warm objects supply any orange accent.
5. If no natural orange exists, leave the photograph without orange.

Global desaturation alone is insufficient when one bright region occupies a large area or has high luminance.

## 4. Controlled orange remapping

Use only when the user requests a stronger brand intervention or when the target is visually safe.

Usually safe:

- privacy graphics and other added overlays;
- generic tags, paper, stationery, or small decorations;
- generated props whose original color has no factual meaning;
- small reflected lights or practical lights;
- non-branded generic objects.

Usually unsafe:

- skin and hair;
- third-party logos, branded products, or uniforms;
- traffic, safety, or navigation signals;
- food;
- objects whose color communicates state or identity;
- large garments in documentary photographs unless the user explicitly accepts a campaign-like result.

Keep orange around 3–10% of the image. Large orange surfaces often turn an editorial photograph into advertising.

## 5. Authentic photography language

For generated scenes, prefer:

- a 24–26 mm equivalent phone lens;
- normal standing or seated human viewpoint;
- deep or moderate depth of field, not portrait-mode blur;
- sharp high-resolution detail;
- restrained, realistic Smart HDR;
- mixed available light;
- slightly imperfect tilt, crop, or edge intrusion;
- people caught between gestures rather than posing;
- ordinary Central European environments with signs of use;
- believable skin, hands, materials, and object counts.

Avoid cinematic fog, dramatic rim lights, shallow bokeh, advertisement symmetry, glossy retouching, fake phone defects, deliberate blur, and artificial film spectacle.

## 6. Shared photographic base for article and OG/social use

The same photograph backs the article page and all generated OG/social images. The site template overlays the title (top-left) and the Jednadvacet logo (bottom-left) deterministically; never bake them into the photograph. Do not add text, logos, frames, or watermark-like graphics when preparing the base.

### Geometry

- Format: landscape **16:9**, ideally **1920 × 1080 px** or larger.
- Protected subject region: ideally **x 70–95%, y 40–60%**. Keep the essential face or key object in the right-hand region, with breathing room at the right edge.
  - Rationale: the article page overlays a 64 px header at the top and a ~40 px card overlap at the bottom, centers the crop, and caps the image height at 60 vh — so top and bottom strips can be covered or cut on some viewports.
- Overlay zones to keep visually calm:
  - **top-left**: the title goes here; avoid busy detail or bright hotspots behind it;
  - **bottom-left**: the logo goes here; keep it free of critical content.
- OG backgrounds use `cover` with **right center** alignment. For a 16:9 base, square crops retain x 44–100%, 4:5 retains x 55–100%, and 9:16 retains x 68–100%. The left side is expendable photographic reserve; even the surviving crop's top-left and bottom-left must leave room for overlays.

### Composition

- The subject may extend beyond the protected region if losing the overflow is acceptable, but anything that must be seen whole must fit inside the narrowest intended right-aligned crop.
- For a single host: place the face in the right-hand region, ideally x 70–95%; keep the title area to their left clear. Do not push the face against the right edge.
- Leave enough breathing room around the subject so landscape, square (1:1), portrait (4:5), and vertical (9:16) crops can each be re-composed without cutting the face or the calm overlay areas.
- A crop that cannot keep the subject and both overlay zones intact is a failure of the base — fix the base's crop or composition.

### Planned output variants

The template renders at least: OG landscape 1200 × 630, LinkedIn 1200 × 627, X card 1200 × 600, square preview 800 × 800, social square 1080 × 1080, social portrait 1080 × 1350, social vertical 1080 × 1920, YouTube 1920 × 1080, YouTube 4K 3840 × 2160. Judge whether the base supports the relevant aspect families (landscape, 1:1, 4:5, 9:16) rather than memorizing pixel sizes.

## 7. Verifying rendered variants

When a debug page (e.g. `/debug/blog/<slug>`) or equivalent rendered output exists, verify actual renders instead of guides alone:

1. Article view: simulate or view the mobile and desktop article header crop; the essential subject must stay visible despite the centered vertical crop and header/card overlays.
2. Each social variant: check at full size and reduced to thumbnail scale.
   - Title legible, correct Czech diacritics, not clipped.
   - Logo undistorted, bottom-left.
   - Subject not hidden by title, logo, duration badge (YouTube), or the crop itself.
   - Square/vertical outputs are re-composed crops of the same base, not stretched or letterboxed.
3. The base photograph is unchanged apart from the intended crop; the overlay adds no other alterations.

Verdicts: **fits** (all variants pass), **needs adjustment** (name the failing variants and the reason), **cannot verify** (no rendered output available — composition check only). For failures, adjust the base first; only question the overlay template if the base demonstrably supports the crop and the render still fails.

## 8. Edit prompt template

This is a visual brief for a color-only treatment. Follow the skill's mandatory tool-selection question before editing: offer local ImageMagick/available sharp and masks, suitable remote AI editors individually, and all suitable options + comparison. Recommend local processing when pixel preservation is essential; use PPQ grading only when selected by the user. Exact-preservation instructions in a prompt do not guarantee exact AI output.

```text
Use case: style-transfer
Asset type: editorial web image
Input image: edit target; preserve its documentary content and composition.

Primary request: Apply the Jednadvacet authentic graphite color grade.
Preserve [IDENTITIES, EXPRESSIONS, HANDS, TEXT, LOGOS, PRIVACY MASKS,
OBJECTS, FRAMING, PERSPECTIVE, ASPECT RATIO] exactly.

Color treatment:
- reduce global saturation moderately;
- reduce distracting green, cyan, blue, purple, and yellow selectively;
- protect natural skin tones;
- deepen detailed shadows toward graphite #111827;
- warm highlights subtly toward cream;
- retain or emphasize only an existing safe orange accent near #f68b09;
- if no safe orange exists, do not invent one;
- use medium natural contrast and extremely subtle grain.

Constraints: color and tone only unless a specific safe recoloring was requested.
Avoid: orange skin, full-image orange cast, teal-and-orange cinema look,
HDR halos, crushed blacks, beauty retouching, cleanup, crop, content changes,
added text, logos, or watermarks.
```

For strong neutralization, add:

```text
Reduce the dominant [COLOR] region by 50–70% saturation and move it toward
graphite, warm grey, or restrained olive while preserving its luminance,
texture, edges, printed details, and meaning.
```

## 9. Generation prompt template

```text
Use case: photorealistic-natural
Asset type: editorial web image
Primary request: Create an authentic ordinary photograph of [SCENE].

Photographic language: spontaneous high-quality phone or everyday-camera
photography, 24–26 mm equivalent viewpoint, deep-enough focus, sharp detail,
restrained Smart HDR, mixed available light, slightly imperfect framing,
real materials, candid gestures, and a believable Central European setting.

Color treatment: controlled saturation, restrained green/cyan/blue/purple,
natural protected skin, detailed graphite shadows inspired by #111827,
warm cream highlights, medium natural contrast, and subtle grain.

Orange: include [PHYSICAL ORANGE OBJECT] near #f68b09 only if plausible.
Otherwise omit orange. Keep it local, approximately 3–10% of the image.

Constraints: [SUBJECT-SPECIFIC INVARIANTS, EXACT TEXT, COUNTS].
Avoid: cinematic lighting, shallow bokeh, advertising symmetry, orange veil,
neon color, HDR halos, fake phone defects, logos, and watermarks.
```

When the scene is the shared article/OG base, add:

```text
Composition: 16:9 landscape, at least 1920x1080. Keep the essential subject
in the right-hand protected region (ideally x 70-95%, y 40-60%), with breathing
room at the right edge. OG images crop from the right: square retains x 44-100%,
4:5 retains x 55-100%, and 9:16 retains x 68-100%. Keep the top-left quadrant
visually calm for an overlaid title and the bottom-left free of critical
content for an overlaid logo. Leave breathing room for usable square, 4:5,
and 9:16 crops. No text, logos, or frames in the photograph itself.
```

## 10. Review checklist

Compare the output with the source or request at useful resolution.

- Are identities, expressions, hands, and anatomy correct?
- Are text, logos, signs, and product details unchanged and legible?
- Are privacy masks complete and still covering the same faces?
- Are object counts and requested exact quantities correct?
- Is framing, perspective, orientation, and aspect ratio preserved?
- Does skin remain natural rather than orange or grey?
- Are large competing colors visibly neutralized?
- Are graphite shadows detailed rather than crushed?
- Is orange optional, local, plausible, and below visual domination?
- Does the image still look like an authentic photograph rather than an ad?

For a shared article/OG base additionally:

- Is it 16:9 landscape at sufficient resolution?
- Does the essential face or key object fit the right-hand protected region (ideally x 70–95%, y 40–60%) and the narrowest intended right-aligned crop?
- Are the top-left (title) and bottom-left (logo) zones visually calm and free of critical content?
- Do landscape, square, portrait, and vertical crops each keep the subject and overlay zones usable?
- If rendered variants were checked: does every variant keep the subject visible and the title and logo legible?

If any protected content changed, restore it locally from the source where alignment permits. Any further paid correction must fit the selected workflow and agreed budget; ask before switching methods or expanding the paid scope. Do not repeatedly re-render a photograph to solve a color-only grading failure; report it and ask whether to finish with a local masked correction.

## 11. Executing the local + PPQ workflow

Run from the repository root; elsewhere resolve `scripts/ppq-image.ts` relative to this skill's directory. These are execution examples, not automatic tool choices: ask the user to select tools before any modification or generation, including local ImageMagick operations. Read-only inspection and catalog discovery may precede the question. Replace example prompts with the full photographic brief from section 9. Each paid invocation has its own budget reservation, so track the total task spend across invocations separately. An earlier experiment's approval does not automatically fund future tasks.

```bash
# Discover credentials, capabilities and prices; no image generation.
node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts check

# New photographic base: use the complete style and composition prompt.
node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts generate \
  --model gpt-image-2.5-flare --quality low --aspect 16:9 \
  --prompt "[COMPLETE SCENE, STYLE AND COMPOSITION BRIEF]" \
  --budget 0.10 --out /tmp/jednadvacet-base

# Generative change to an existing photograph, not routine grading.
node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts edit \
  --model nano-banana-2-edit --image /tmp/source.png --transport multipart \
  --aspect 16:9 --prompt "[SPECIFIC CONTENT CHANGE AND PROTECTED FEATURES]" \
  --budget 0.20 --out /tmp/jednadvacet-edit

# Inspect and safely upscale locally, without invented AI details.
magick identify /tmp/source.png
magick /tmp/source.png -filter Lanczos -resize 1920x1080 /tmp/resized.png
```

The resize example preserves aspect ratio and fits within the requested bounds; it does not guarantee an exact 1920x1080 canvas. Choose a crop based on the subject/overlay zones and inspect it before exporting. Do not use forced stretching (`!`). Global saturation adjustments alone do not implement selective graphite grading; protect skin and semantic colors and apply the recipe with local masks.

### Extension prompt for `edit`

```text
Extend the supplied photograph to [TARGET ASPECT RATIO] by adding plausible
continuation of [SURROUNDINGS] at [EDGES]. Keep the complete original scene
at [POSITION], preserving its geometry, identities, objects, text, lighting
and perspective. Do not crop, stretch or redesign the existing photograph.
Create only the missing photographic surroundings, matching the available
light and graphite palette. [FULL STYLE RECIPE AND SCENE INVARIANTS]
Leave [TITLE/LOGO AREAS] calm. No added text, branding or watermarks.
```

This produces a proposal, not a pixel-preserving operation. Use deterministic compositing with the original when exact preservation is needed, and report failed alignment or visible seams. Keep a lossless PNG working result for pixel checks; a final JPEG can change decoded pixels throughout the image due to compression.

### Optional processing models (not part of the verified generation experiment)

```bash
# AI upscale: reconstructed details require comparison with the source.
node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts process \
  --model aura-sr --image /tmp/source.png \
  --budget 0.10 --out /tmp/jednadvacet-ai-upscale

# Background segmentation: inspect alpha and alignment before local application.
node .agents/skills/jednadvacet-image-style/scripts/ppq-image.ts process \
  --model birefnet-v2 --image /tmp/source.png \
  --budget 0.10 --out /tmp/jednadvacet-cutout

# Only for a same-size, aligned RGBA cutout with a verified useful alpha channel:
magick /tmp/cutout.png -alpha extract /tmp/subject-alpha.png
magick /tmp/source.png /tmp/subject-alpha.png \
  -alpha off -compose CopyOpacity -composite /tmp/subject.png
```

The cutout path above refers to the downloaded processing result. Applying its alpha retains original subject RGB without using the provider's reconstructed colors. Keep the working color space/depth consistent when checking pixels. A correct composite cannot repair an incorrect segmentation: inspect subject boundaries and transparency separately. For local segmentation or AI upscaling, use an existing backend only; discover its real command/API rather than assume a binary named after the model exists.
