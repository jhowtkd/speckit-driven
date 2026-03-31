# Quickstart — Spec-Driven Coding MVP

**Referência:** documento mestre v1 · constitution em `.cursor/constitution.md` · data de referência 2026-03-31 (UTC−03:00).

## Uso em uma frase

Substitua `FEATURE_ID` (ex.: `001-minha-feature`), abra o prompt da etapa em `.cursor/prompts/` e peça ao agente para seguir esse arquivo contra `.cursor/features/FEATURE_ID/`.

## Sequência mínima

1. `00-bootstrap.md` — cria estrutura e arquivos mínimos.
2. `01-constitution-check.md` — aderência aos princípios.
3. `02-spec.md` — spec completa (what/why).
4. `03-clarify.md` — só se houver lacunas materiais.
5. `04-research.md` — só se research for obrigatório ou desejado.
6. `05-plan.md` — como fazer, ordem, riscos, testes.
7. `06-tasks.md` — breakdown executável.
8. `07-execute.md` — implementação alinhada a tasks.
9. `08-verification.md` — rubrica; **≥ 90** para concluir.
10. `09-decision-log.md` — se houver decisões relevantes.
11. `10-state-update.md` — alinhar `state.json` à realidade.
12. `11-final-review.md` — checklist de encerramento.

## Atalhos de uma linha (copiar/colar)

Ver o documento mestre, seção “Prompt mestre de uso rápido”, ou use os prompts completos em `.cursor/prompts/` (recomendado para não perder restrições).

## Lembrete

O fluxo não pode ser pulado; pode ser **comprimido** (menos profundidade por fase). Estado vivo fica em `state.json`, não só no chat.
