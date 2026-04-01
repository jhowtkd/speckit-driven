# Spec start

Bootstrap da feature antes das outras fases.

## Quando usar

No início do trabalho em uma feature do Cursor, ou quando a pasta da feature
não tiver os arquivos mínimos.

## Instruções

1. Defina `FEATURE_ID`.
2. Crie `.cursor/features/<FEATURE_ID>/` se ainda não existir.
3. Copie os templates faltantes de `.cursor/templates/` para `spec.md`,
   `plan.md`, `tasks.md` e `state.json`.
4. Substitua os placeholders dos templates.
5. Não escreva código nesta etapa.

## Runtime ELF

- Rode `elf init` para inicializar o runtime quando ele ainda não existir.
- Use `elf run` para criar um run do workflow.
- Use `elf mcp serve` para conectar o Cursor ao bridge local.

## Observação

Este comando só prepara a escrita da feature. A autoridade do workflow vive no
ELF, não nos rules do Cursor.
