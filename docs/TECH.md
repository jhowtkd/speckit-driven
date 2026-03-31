# Decisões técnicas (v1)

## Runtime e build

- **TypeScript compilado para CommonJS** em `dist/`: caminhos estáveis com `__dirname`, compatível com `require()` no shim `bin/spec-driven-kit.js`, sem exigir `"type": "module"` nos consumidores.
- **`prepare` → `build`**: ao instalar o pacote do npm, o `dist/` é gerado localmente (depende de `devDependencies` + TypeScript no momento do `npm install` do pacote publicado — padrão comum; alternativa v1.1 seria commitar `dist/` ou usar `prepublishOnly` apenas).

## CLI

- **Commander** (única dependência de runtime além do Node): parsing de subcomandos (`new feature <nome>`), help e version com baixo custo e manutenção familiar. Alternativa zero-deps (`util.parseArgs`) foi descartada para manter legibilidade dos subcomandos aninhados.

## Instalação e atualização

- **Init**: copia tudo de `assets/cursor/` → `.cursor/`; arquivos existentes são **pulados** salvo `--force` (evita sobrescrever customizações acidentalmente).
- **Update**: arquivos em falta são criados; idênticos ao bundle são ignorados; **divergentes** são listados e só sobrescritos com `--force`. Não há merge semântico nem três-vias na v1.
- **Metadados**: `.cursor/spec-driven-kit.json` guarda `kitVersion`, `installedAt` (preservado) e `lastKitUpdate`.

## Doctor

- Presença de todos os arquivos do bundle sob `.cursor/`.
- `--strict` compara conteúdo binário com o pacote (útil para detectar drift); avisos não falham o comando, erros (paths em falta) falham com exit code 1.

## Nova feature

- Índice **sequencial 001–999** por prefixo numérico em diretórios existentes sob `.cursor/features/`.
- Nome normalizado para **kebab-case**.
- Templates lidos de `.cursor/templates/` no projeto (pós-init); se ausentes, usa os templates do bundle (fallback para repositórios corrompidos parcialmente).

## Caminhos do pacote

- `getPackageRoot()` assume que o código vive em `dist/core/*.js` (dois níveis acima até a raiz do pacote). Qualquer mudança de layout de build exige ajustar `src/core/paths.ts`.

## Fora de escopo na v1

- Telemetria, presets por stack, integração GitHub, instalação global da skill em `~/.cursor/skills/`, motor de merge inteligente.

## v1.1 sugerido

- `prepublishOnly` + artefatos buildados publicados **ou** documentar claramente consumo só via Git com `npm install` no clone.
- Comando `spec-driven-kit doctor --fix` para recriar só arquivos faltantes.
- Opção `init --dry-run`.
- Testes automatizados (Vitest) sobre init/update/doctor em diretório temporário.
