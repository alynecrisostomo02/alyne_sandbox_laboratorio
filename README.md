# Catálogo Imobiliário - Alyne Crisóstomo

Catálogo em React/Vinext para imóveis em Redenção, Pará, com Home, filtros, detalhes, favoritos locais, busca guiada e contato por WhatsApp.

## Estado em 8 de agosto de 2026

- Laboratório ativo com **17 anúncios** e **82 imagens WebP com a logo padrão da Alyne**.
- Verificador do catálogo e build aprovados.
- Smoke test desktop/mobile aprovado, sem overflow horizontal ou exceções.
- Produção permanece congelada e somente leitura.
- Laboratório publicado e validado em `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev` (Version ID `befde55a-0f5b-4900-9398-f0367c814dac`).

Consulte primeiro:

- `docs/CURRENT_STATE.md`: estado operacional e limites.
- `docs/LABORATORY_GUIDE.md`: fluxo seguro de trabalho.
- `docs/CATALOG_IMPORT_ROUND_2026-08-08.md`: relatório completo dos anúncios, mídias e pendências.
- `docs/AGENT_HANDOFF.md`: continuidade para agentes.
- `docs/CODEBASE_MAP.md`: mapa dos arquivos ativos.

## Ambientes

Produção congelada:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alynecrisostomo02-cautious-spoon`
- worker: `alyne-crisostomo-imoveis`
- URL: `https://alyne-crisostomo-imoveis.grand-crab.workers.dev`

Laboratório:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alyne-crisostomo-laboratorio`
- worker: `alyne-crisostomo-laboratorio`
- URL: `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev`
- ambiente local usual: `http://localhost:3001/`

## Alerta de Git

O `.git` do laboratório aponta para metadados do worktree de produção. **Não execute qualquer comando Git neste diretório** até que uma missão específica corrija esse vínculo com segurança.

Snapshot anterior à rodada:

`C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\backups\laboratorio-snapshot-20260808-203244`

## Identidade e mídia

- Logo ativa: `public/branding/logo-alyne-padrao.jpg`.
- Open Graph também usa a logo padrão.
- A antiga imagem Open Graph botânica e as releituras anteriores estão preservadas em `assets/review-only/branding-legacy-20260808/`.
- Mídias originais tratadas estão preservadas em `assets/review-only/media-originals-round-20260808/`.
- `public/imoveis/` contém somente os WebP liberados para o laboratório.

## Tecnologias

- React 19
- Vinext 0.2 e Vite 8
- JavaScript/JSX e CSS global
- pnpm via Corepack
- Cloudflare Workers via Wrangler

## Comandos locais

```powershell
corepack pnpm run verify
corepack pnpm run build
corepack pnpm run dev -- --port 3001
```

Qualquer deploy autorizado deve apontar exclusivamente para `alyne-crisostomo-laboratorio`. O fluxo antigo de ChatGPT Sites foi retirado da aplicação ativa e está preservado em `legacy/sites/`.
