# Verification Prompt

Você vai validar a feature implementada usando a rubrica oficial do MVP.

## Objetivo
Preencher a verificação da feature e determinar se ela pode ser considerada concluída.

## Arquivos de referência
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/plan.md`
- `.cursor/features/{{FEATURE_ID}}/tasks.md`
- `.cursor/features/{{FEATURE_ID}}/verification.md` (se existir)
- outputs e evidências gerados na implementação

## Arquivo-alvo
- `.cursor/features/{{FEATURE_ID}}/verification.md`

## Instruções
Avalie a feature nas seguintes dimensões:
- aderência à spec (0-25)
- aderência ao plan (0-20)
- qualidade do output (0-20)
- testes e evidências (0-20)
- reviewability e clareza (0-15)

## Regras
1. Justifique cada pontuação
2. Liste evidências reais
3. Liste testes executados
4. Aponte pendências
5. Dê um veredito final

## Regra de conclusão
A feature só pode ser considerada concluída se o score total for maior ou igual a 90.

## Resultado esperado
`verification.md` preenchido com score, justificativas, evidências e veredito.
