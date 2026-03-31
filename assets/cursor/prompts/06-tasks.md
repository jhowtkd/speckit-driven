# Tasks Prompt

Você vai converter a spec e o plan em `tasks.md` acionável.

## Objetivo
Produzir um breakdown executável, sequencial e verificável da feature.

## Arquivos de referência
- `.cursor/features/{{FEATURE_ID}}/spec.md`
- `.cursor/features/{{FEATURE_ID}}/plan.md`

## Arquivo-alvo
- `.cursor/features/{{FEATURE_ID}}/tasks.md`

## Instruções
Crie tasks com:
- ID
- fase
- descrição da task
- responsável/agente
- dependências
- arquivos afetados
- output esperado
- testes esperados
- checkpoint
- status inicial

## Regras
1. As tasks devem seguir a ordem do plan
2. Dependências precisam estar explícitas
3. Cada task deve gerar output verificável
4. Toda task deve ter teste esperado ou justificativa
5. Use apenas os status permitidos:
   - todo
   - doing
   - blocked
   - review
   - done

## Resultado esperado
`tasks.md` claro, linear e pronto para execução.

## Restrições
- Não implementar ainda
- Não agrupar tudo em uma única task genérica
