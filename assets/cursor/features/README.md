# Features (spec-driven workflow)

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

1. Leia `.cursor/rules/00-using-spec-driven.mdc`.
2. Use `.cursor/commands/spec-start.md` se os comandos beta estiverem instalados.
3. Preencha os artefatos a partir de `.cursor/templates/`.
4. Consulte `AGENTS.md` no root do repositório para instruções gerais de agente.

Não commite pastas de feature vazias sem necessidade; o bootstrap cria os arquivos mínimos quando você inicia trabalho real.
