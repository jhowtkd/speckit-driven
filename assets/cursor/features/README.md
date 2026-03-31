# Features (Spec-Driven MVP)

Cada feature vive em uma pasta:

```text
.cursor/features/<FEATURE_ID>/
  spec.md
  plan.md
  tasks.md
  state.json
  research.md          # opcional
  verification.md      # opcional
  decision-log.md      # opcional
```

## Convenção de ID

Use prefixo numérico e nome curto, por exemplo: `001-login-email`, `002-export-csv`.

## Como começar

1. Leia `.cursor/constitution.md` (ou `runtime-constitution.md` para execução rápida).
2. Rode o fluxo pelos prompts em `.cursor/prompts/`, começando por `00-bootstrap.md`.
3. Preencha artefatos a partir dos templates em `.cursor/templates/`.

Não commite pastas de feature vazias sem necessidade; o bootstrap cria os arquivos mínimos quando você inicia trabalho real.
