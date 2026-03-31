# Final Review Prompt

Você vai revisar a feature como um todo antes do encerramento final.

## Objetivo
Garantir que a feature esteja concluída de forma revisável, coerente e aderente ao sistema.

## Arquivos de referência
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/plan.md`
- `.cursor/features/{{FEATURE_ID}}/tasks.md`
- `.cursor/features/{{FEATURE_ID}}/state.json`
- `.cursor/features/{{FEATURE_ID}}/verification.md`
- `.cursor/features/{{FEATURE_ID}}/decision-log.md` (se existir)

## Instruções
Revise:
- coerência entre spec, plan e tasks
- aderência do output ao objetivo
- qualidade da evidência
- clareza para revisão futura
- presença de pendências ou riscos remanescentes

## Checklist final
- [ ] spec atendida
- [ ] plan respeitado ou desvios justificados
- [ ] tasks concluídas ou pendências registradas
- [ ] testes compatíveis executados
- [ ] verification >= 90
- [ ] estado atualizado
- [ ] output revisável
- [ ] sem bloqueio crítico em aberto

## Resultado esperado
Um veredito final claro:
- concluído
- concluído com ressalvas
- precisa revisão
- não concluído
