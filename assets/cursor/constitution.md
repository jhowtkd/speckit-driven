# Constitution — Spec-Driven Coding MVP

**Versão:** 1.0  
**Status:** Ativa  
**Data de referência:** 2026-03-31 (UTC−03:00)

Este arquivo é a constitution **canônica em português** do MVP. Para execução rápida, use `runtime-constitution.md`. Para texto formal ampliado em inglês, use `constitution.en.md`.

---

## 1. Propósito

Definir princípios, restrições, critérios de qualidade, regras de progressão e invariantes operacionais do Spec-Driven Coding MVP no Cursor (uso individual, v1).

Previne improviso como modo principal de produção, reduz retrabalho e preserva continuidade entre ciclos de execução.

---

## 2. Princípios de projeto

- Spec antes de código
- Qualidade antes de velocidade aparente
- Clareza antes de complexidade
- Testes proporcionais ao risco
- Revisão obrigatória antes de concluir
- Continuidade operacional acima de improviso
- Documentação mínima viável, não ornamental
- Sem “vibe coding” como fluxo principal de entrega

---

## 3. Papel dos artefatos

| Artefato | Papel |
|----------|--------|
| **Constitution** | Princípios e travas; orienta spec, plan e verification |
| **Spec** | O *what* e o *why*; escopo e critérios verificáveis |
| **Plan** | O *how* operacional; ordem, riscos, testes |
| **Verification** | Portão de saída; rubrica e evidências |
| **state.json** | Verdade operacional mínima da feature (não só memória do chat) |

---

## 4. Fluxo oficial (linear)

Constitution → Spec → Clarify (se necessário) → Research (se necessário) → Plan → Tasks → Execute → Verification → Revisão final

**Compressão permitida:** menor profundidade em cada fase.  
**Não permitido:** suprimir spec, plan, tasks ou a etapa de verification.

---

## 5. Regras de progressão (gates)

Execução só inicia quando:

- Constitution definida (este repositório/projeto)
- Spec clara
- Plan consistente
- Task breakdown sequenciado

Clarify torna-se obrigatória quando houver subespecificação relevante.

---

## 6. Research

**Obrigatório** quando: integração nova, nova linguagem, nova tecnologia, dependência externa relevante, incerteza técnica material.

**Opcional** para features pequenas compreendidas, refatorações leves, correções localizadas.

**Controle:** research não pode bloquear tarefa simples já suficientemente clara.

---

## 7. Overhead documental (orientação)

- Ajuste rápido: até ~5 minutos  
- Feature pequena: até ~15 minutos  
- Feature média / refatoração leve sensível: até ~30 minutos  

Se ultrapassar sem ganho claro em clareza, qualidade ou redução de risco, simplificar o processo.

---

## 8. Verification (rubrica oficial)

| Dimensão | Peso |
|----------|------|
| Aderência à spec | 25 |
| Aderência ao plan | 20 |
| Qualidade do output | 20 |
| Testes e evidências | 20 |
| Reviewability e clareza | 15 |

**Faixas:** 0–59 reprovado · 60–79 incompleto · 80–89 aceitável, não concluído · **90–100 concluído**

Nenhuma feature fecha com score menor que 90 sem replanejamento explícito e novo ciclo de verification.

---

## 9. Testes

Toda task declara testes esperados ou justificativa formal da ausência. Proporcional ao risco. “Parece que funciona” não é evidência.

---

## 10. Padrão de revisão e anti-overengineering

- Toda mudança relevante deve ser revisável por um revisor técnico competente  
- Complexidade só entra com justificativa frente a critérios de aceite, segurança da mudança ou manutenibilidade real  

---

## 11. Anti-padrões proibidos

- Código antes de spec  
- Execução sem plan/tasks  
- Escopo que cresce sem atualizar spec/plan/tasks  
- Tasks vagas  
- Verification cerimonial  
- Estado só na memória do operador (sem `state.json` coerente)  
- Marcar progresso que não ocorreu  

---

## 12. Autoridade

Em conflito com atalhos ad hoc ou prompts improvisados, prevalece esta constitution. Exceções devem ser explícitas, justificadas e limitadas ao caso.

---

## 13. Escopo da v1

**Dentro:** features pequenas/médias, refatorações leves.  
**Fora do foco inicial:** épicos longos, brownfield amplo, multiagente avançado, governança de equipe, métricas sofisticadas, memória multi-projeto avançada.
