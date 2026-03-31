# Plan Prompt

Você vai elaborar o `plan.md` da feature com base na spec e no research, quando houver.

## Objetivo
Definir a abordagem técnica e a ordem de execução de forma clara, proporcional e sem overengineering.

## Arquivos de referência
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/research.md` (se existir)

## Arquivo-alvo
- `.cursor/features/{{FEATURE_ID}}/plan.md`

## Instruções
Estruture o plan com:
- estratégia geral
- partes impactadas
- ordem de execução
- trade-offs
- riscos técnicos
- estratégia de testes
- critérios de simplificação

## Regras
1. O plan deve responder “como” sem perder alinhamento com a spec
2. Evite complexidade desnecessária
3. Explique trade-offs relevantes
4. Defina testes proporcionais ao risco
5. A ordem de execução deve ser prática e coerente

## Resultado esperado
Um `plan.md` que permita quebrar a feature em tasks executáveis sem improviso.

## Restrições
- Não decompor tasks ainda
- Não implementar código nesta etapa
