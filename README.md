# Jednadvacet skills

Vlastní [skills](https://github.com/vercel-labs/skills) pro projekty komunity
Jednadvacet.org. Skill se publikuje do tohoto GitHub repozitáře a do jednotlivých
projektů se přidává přes CLI `npx skills`. Pro použití se můžeš inspirovat v projektu [website](https://github.com/jednadvacetorg/website).

## `jednadvacet-copywriter`

Skill pro psaní a korektury v češtině pro bitcoinovou komunitu Jednadvacet -
pozvánky na akce, vzdělávací posty, web copy, příspěvky na sociální sítě a e-maily.
Definuje tón, cílovou skupinu, zakázaný slovník (Bitcoin klišé) a strukturu textů
podle typu. Snaží se eliminovat konstrukce, které lidi vnímají jako AI slop.

```bash
npx skills add jednadvacetorg/skills --skill jednadvacet-copywriter
```

Zvaž také přidání instrukcí do svého `AGENTS.md`/`CLAUDE.md`:

```
# Copywriting

- Before writing or editing Czech texts, load the `jednadvacet-copywriter` skill and follow it.
- For best results use Claude Opus model. If you are not Opus, recommend switch to Opus for copywriting job.
```

## `jednadvacet-image-style`

Skill pro přípravu fotografií a obrázků pro Jednadvacet — náhledy článků a podcastů,
portréty, obrázky pro sdílení a YouTube. Popisuje ořez, změnu velikosti, barevné
úpravy, odstranění pozadí i generování a úpravy pomocí AI.

Sjednocuje vizuální styl: přirozené fotografie, grafitové stíny, teplé světlé tóny
a střídmé oranžové akcenty. Hlídá zachování tváří, textů a log i použitelnost jedné
fotografie v různých ořezech s titulkem a logem.

Pro lokální úpravy používá ImageMagick. Součástí je CLI pro obrazové modely přes
PPQ, které vyžaduje Node.js 24+ a API klíč v `PPQ_API_KEY` nebo uložený v OpenCode.
Před úpravou si s tebou agent vybere nástroj; u placených modelů ověří aktuální
možnosti a cenu a počká na schválení rozsahu.

```bash
npx skills add jednadvacetorg/skills --skill jednadvacet-image-style
```

Zvaž také přidání instrukce do svého `AGENTS.md`/`CLAUDE.md`:

```text
# Images

- Before inspecting, editing, preparing or generating photographs or raster image assets, load the `jednadvacet-image-style` skill and follow it.
```

Podrobný postup najdeš v [SKILL.md](skills/jednadvacet-image-style/SKILL.md)
a vizuální pravidla v [průvodci stylem](skills/jednadvacet-image-style/references/style-guide.md).
