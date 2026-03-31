---
name: spec-driven-mvp
description: >-
  Stub de ativação do Spec-Driven Framework para repositórios que instalaram o
  spec-driven-kit. Declara Native Mode e delega ao framework global
  (spec-driven-framework). Não duplica regras — é o ponto de entrada local.
---

# Spec-Driven Kit — Native Mode

Este repositório tem o `spec-driven-kit` instalado. O agente opera em
**Native Mode** conforme definido no framework global `spec-driven-framework`.

## Referências locais

| Artefato | Localização |
|---|---|
| Constituição (PT) | `.cursor/constitution.md` |
| Constituição (EN) | `.cursor/constitution.en.md` |
| Regras de execução | `.cursor/runtime-constitution.md` |
| Prompts de fase | `.cursor/prompts/00-bootstrap.md` … `11-final-review.md` |
| Features ativas | `.cursor/features/<FEATURE_ID>/` |
| Templates | `.cursor/templates/` |
| Guia rápido | `.cursor/quickstart.md` |

## Comportamento especial deste repositório

- A constituição local tem **precedência** sobre os defaults do framework
  global, exceto pelas Universal Rules invioláveis.
- Score de verificação ≥ 90 é exigido para encerrar qualquer feature.
- Tempo de documentação deve ser proporcional: ajuste rápido ~5 min, feature
  pequena ~15 min, feature sensível ~30 min.

## Fonte de verdade

A lógica operacional completa (modos, fases, regras universais, matriz de
conflito) vive em `~/.agents/skills/spec-driven-framework/SKILL.md`.
Não edite as regras aqui — edite lá e essa skill continua sendo válida.
