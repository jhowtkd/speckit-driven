# Constituição - Adapter Cursor do ELF

**Versão:** 1.0  
**Status:** Ativa  
**Data de referência:** 2026-04-01

Este documento define as regras do adapter Cursor que aponta para o runtime
ELF. A autoridade operacional fica em `.elf/`; os arquivos `.cursor/` servem
como guia e camada de ergonomia para o Cursor.

## Princípios

- Spec antes de código
- Plan antes de execução
- Tasks explícitas antes de implementar
- Testes proporcionais ao risco
- Verificação antes de concluir
- Sem semântica de workflow fora do ELF
- Adapter fino, runtime autoritativo

## Fluxo

ELF init → Spec → Clarify (se necessário) → Research (se necessário) → Plan →
Tasks → Execute → Verify → Final Review

## Artefatos

- `.cursor/features/<FEATURE_ID>/spec.md`
- `.cursor/features/<FEATURE_ID>/plan.md`
- `.cursor/features/<FEATURE_ID>/tasks.md`
- `.cursor/features/<FEATURE_ID>/state.json`
- `.cursor/features/<FEATURE_ID>/research.md` quando necessário
- `.cursor/features/<FEATURE_ID>/verification.md` quando pronto para fechar

## Regras de uso

1. Use `elf init` para inicializar o runtime.
2. Use `elf run`, `elf resume`, `elf review`, `elf verify` e `elf mcp serve`
   para a execução real.
3. Use `.cursor/rules` e `.cursor/templates` apenas para orientar escrita e
   revisão no Cursor.
4. Não improvise workflow fora do ELF.
