# Features - Adapter Cursor do ELF

Cada feature vive em:

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

Use prefixo numérico e nome curto, por exemplo: `001-login-email`,
`002-export-csv`.

## Como começar

1. Rode `elf init` se o runtime ainda não existir.
2. Crie ou refine a pasta da feature em `.cursor/features/<FEATURE_ID>/`.
3. Use os templates em `.cursor/templates/` para preencher os artefatos.

## Lembrete

Não deixe o workflow viver só no chat. O estado do runtime fica em `.elf/`.
