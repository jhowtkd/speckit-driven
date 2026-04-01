# Quickstart - Adapter Cursor do ELF

**Referência:** adapter Cursor para o runtime ELF, com autoridade em
`.elf/`.

## Uso rápido

1. Rode `elf init` para criar o runtime.
2. Defina `FEATURE_ID` e crie `.cursor/features/<FEATURE_ID>/` se necessário.
3. Use os comandos `spec-start`, `spec-plan`, `spec-research`, `spec-execute`,
   `spec-verify` e `spec-close` dentro de `.cursor/commands/`.
4. Use `elf run`, `elf resume`, `elf review`, `elf verify` e `elf mcp serve`
   para a execução real.

## Resumo do fluxo

Spec → Clarify → Research → Plan → Tasks → Execute → Verify → Final Review

## Lembrete

Os arquivos em `.cursor/` orientam o Cursor; o estado vivo do workflow mora em
`.elf/`.
