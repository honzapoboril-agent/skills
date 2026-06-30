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
