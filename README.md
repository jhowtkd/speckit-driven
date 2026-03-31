# spec-driven-kit

Pacote npm com CLI para instalar o **Spec-Driven Coding MVP** (constitutions, templates, prompts e skill Cursor) em qualquer repositório, gerando uma `.cursor/` autossuficiente.

## Requisitos

- Node.js **18+**

## Instalação e uso

Em um projeto alvo (com `.git` ou `package.json` na raiz):

```bash
npx spec-driven-kit init
```

Criar uma feature numerada automaticamente (`001-slug`, `002-slug`, …):

```bash
npx spec-driven-kit new feature login-flow
```

Validar a instalação:

```bash
npx spec-driven-kit doctor
npx spec-driven-kit doctor --strict
```

> **Nota sobre o `doctor`**:
> O comando padrão verifica se todos os arquivos recomendados estão presentes. A flag `--strict` também compara os bytes de cada arquivo com a versão distribuída no kit, identificando se você fez edições nos arquivos ou se eles estão desatualizados.

Atualizar assets do kit:

```bash
npx spec-driven-kit update
npx spec-driven-kit update --force
```

> **Nota sobre o `update`**:
> O comando padrão apenas instala arquivos que estão faltando (missing). Se um arquivo na sua máquina já existe e for diferente do kit, ele será preservado (diverged). Para sobrescrever arquivos divergentes com as versões mais recentes do pacote, utilize `--force`.

### Fora de um repo “clássico”

Se não houver `.git` nem `package.json`, use:

```bash
npx spec-driven-kit init --allow-anywhere
```

## Troubleshooting

- **`Missing .cursor/ — run spec-driven-kit init`**: Você está tentando rodar comandos em um diretório que ainda não foi inicializado com o kit. Rode `npx spec-driven-kit init`.
- **`Maximum feature index 999 reached`**: Você criou mais de 999 features. Arquive algumas removendo da pasta principal ou edite o prefixo numérico manualmente se necessário.
- **Diverged assets no `update`**: Os arquivos do kit na sua máquina foram editados. Se quiser voltar para o formato original distribuído, rode `npx spec-driven-kit update --force`.

## Desenvolvimento deste pacote

```bash
npm install
npm run build
node bin/spec-driven-kit.js --help
```

- **Código:** `src/` (TypeScript → `dist/`)
- **Artefatos instalados no projeto alvo:** `assets/cursor/` (cópia espelhada para `.cursor/`)

Publicar no npm: ajuste `repository` em `package.json`, depois `npm publish`.

## O que é instalado

Após `init`, o projeto recebe (entre outros):

- `constitution.md`, `constitution.en.md`, `runtime-constitution.md`
- `quickstart.md`
- `prompts/*.md`
- `templates/*`
- `skills/spec-driven-mvp/SKILL.md`
- `features/README.md`
- `spec-driven-kit.json` (metadados: versão do kit, datas)

O fluxo operacional (spec → plan → tasks → execução → verification ≥ 90, research quando aplicável, estado em arquivo) permanece o do documento mestre; a CLI só materializa e mantém os arquivos.

## Decisões técnicas

Ver [docs/TECH.md](docs/TECH.md).

## Licença

MIT
