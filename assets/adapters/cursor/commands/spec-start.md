# Spec start

Abra a cadeia real da fase no runtime ELF.

## Quando usar

No início do trabalho em uma feature do Cursor, ou quando a pasta da feature
não tiver os arquivos mínimos.

## Instruções

1. Rode `elf init` se `.elf/` ainda não existir.
2. Inicie a fase com `elf phase start --title "<feature>"`.
3. Capture o `run-id` e o `phase-id` retornados pelo runtime.
4. Preencha `.elf/phases/<phase-id>/spec.md`.
5. Use `elf phase status <run-id>` para confirmar que o próximo passo é `research`.

## Runtime ELF

- Use `elf phase start` como gatilho real da cadeia.
- O estado vivo mora em `.elf/phases/<phase-id>/state.json`.
- Use `elf mcp serve` para conectar o Cursor ao bridge local.

## Observação

Este comando não é mais só preparação textual. Ele deve abrir a fase real no
ELF antes da escrita.
