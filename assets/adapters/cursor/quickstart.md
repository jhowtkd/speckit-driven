# Quickstart - Adapter Cursor do ELF

**Referência:** adapter Cursor para o runtime ELF, com autoridade em
`.elf/`.

## Uso rápido

1. Rode `elf init` para criar o runtime.
2. Inicie uma fase real com `elf phase start --title "<feature>"`.
3. Use os comandos `spec-start`, `spec-research`, `spec-plan`,
   `spec-execute`, `spec-verify` e `spec-close` como wrappers da cadeia.
4. Use `elf phase status`, `elf review` e `elf mcp serve` para inspecionar o
   progresso real.

## Resumo do fluxo

Start → Research → Plan → Execute → Verify → Close

## Lembrete

Os arquivos em `.cursor/` orientam o Cursor; o estado vivo do workflow mora em
`.elf/phases/<phase-id>/`.
