# Execute Prompt

Você vai executar a feature com base na spec, plan e tasks já aprovados.

## Objetivo
Implementar a feature sem sair do escopo definido e sem quebrar a disciplina do fluxo.

## Arquivos de referência
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/plan.md`
- `.cursor/features/{{FEATURE_ID}}/tasks.md`
- `.cursor/features/{{FEATURE_ID}}/state.json`

## Instruções
1. Execute seguindo a ordem das tasks
2. Atualize status conforme avança
3. Respeite dependências
4. Registre bloqueios se surgirem
5. Mantenha aderência à spec e ao plan
6. Se surgir desvio estrutural, não improvise: registre e proponha ajuste

## Regras
1. Não expanda escopo por conta própria
2. Não introduza complexidade sem justificativa
3. Não marque task como done sem output verificável
4. Preserve reviewability
5. Se uma decisão importante surgir, registre em `decision-log.md` se necessário

## Resultado esperado
Implementação realizada com rastreabilidade, checkpoints e aderência ao fluxo.
