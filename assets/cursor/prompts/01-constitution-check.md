# Constitution Check Prompt

Antes de avançar, valide a feature contra a constitution do sistema.

## Objetivo
Checar se a feature está aderente aos princípios do Spec-Driven Coding MVP antes de aprofundar a especificação.

## Arquivos de referência
- `.cursor/constitution.md`
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/state.json`

## Instruções
1. Leia a constitution
2. Verifique se a feature proposta respeita:
   - spec antes de código
   - complexidade proporcional
   - testes compatíveis com risco
   - reviewability
   - ausência de improviso estrutural
3. Liste desalinhamentos, se houver
4. Não implemente nada
5. Se houver conflito com a constitution, proponha ajustes objetivos na spec

## Saída esperada
- Validação de aderência à constitution
- Lista de inconsistências
- Ajustes recomendados antes de seguir
