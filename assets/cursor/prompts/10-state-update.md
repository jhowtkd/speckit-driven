# State Update Prompt

Você vai atualizar o `state.json` da feature para refletir o estado operacional real.

## Objetivo
Manter a representação de estado consistente com a fase atual da feature.

## Arquivo-alvo
- `.cursor/features/{{FEATURE_ID}}/state.json`

## Instruções
Atualize, no mínimo:
- status atual
- current_checkpoint
- blocked
- verification_score
- last_updated
- artifacts
- progress

## Regras
1. O estado precisa refletir a situação real
2. Não marque progresso que ainda não aconteceu
3. Se houver bloqueio, registre `blocked: true`
4. Se a verificação não terminou, `done` deve continuar `false`

## Resultado esperado
`state.json` coerente, atual e utilizável para continuidade operacional.
