# Estado atual do projeto

Atualizado em 8 de agosto de 2026.

## Resumo executivo

O site público existente permanece congelado e deve ser tratado como somente leitura. A frente ativa de trabalho é exclusivamente o laboratório. Nesta rodada, o catálogo do laboratório passou a conter 17 anúncios, sustentados por 82 imagens WebP com a logo padrão da Alyne.

A auditoria considerou 47 conjuntos de material: 39 grupos canônicos com REF e oito conjuntos sem REF. Quinze grupos canônicos atingiram os critérios da rodada e resultaram em 17 anúncios porque o grupo Soberano foi publicado como três unidades independentes (103, 201 e 203). Trinta e dois conjuntos permanecem pendentes.

O relatório completo da rodada está em `docs/CATALOG_IMPORT_ROUND_2026-08-08.md`.

## Limites obrigatórios

### Produção congelada

- Pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alynecrisostomo02-cautious-spoon`
- Worker: `alyne-crisostomo-imoveis`
- Site: `https://alyne-crisostomo-imoveis.grand-crab.workers.dev`
- Regra: não editar, reorganizar, sincronizar, corrigir ou fazer deploy.

### Laboratório ativo

- Pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alyne-crisostomo-laboratorio`
- Worker: `alyne-crisostomo-laboratorio`
- URL publicada: `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev`
- Version ID: `befde55a-0f5b-4900-9398-f0367c814dac`
- Ambiente local adotado: `http://localhost:3001/`
- Regra: toda evolução nova ocorre somente aqui.

## Alerta crítico de Git

O arquivo `.git` do laboratório aponta para a área interna do worktree de produção:

`C:/Users/ALYNE_CRISOSTOMO/.copilot/repos/catalogo-imobiliario-redencao/.git/worktrees/alynecrisostomo02-cautious-spoon`

Enquanto esse vínculo não for corrigido por uma missão específica e segura, **não execute qualquer comando Git dentro do laboratório**. Isso inclui comandos aparentemente somente de consulta, pois podem atualizar metadados internos. São expressamente proibidos `git checkout`, `git switch`, `git add`, `git commit`, `git reset`, `git clean`, `git rebase` e equivalentes.

## Fotografia de segurança

- Snapshot: `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\backups\laboratorio-snapshot-20260808-203244`
- O snapshot foi criado fora do caminho ativo do projeto antes da rodada de importação.

## Catálogo e mídias

- 17 anúncios ativos no arquivo de dados.
- 82 imagens públicas em WebP.
- Todas as imagens da rodada estão marcadas como verificadas e usam arquivos `*-logo.webp`.
- Logo oficial ativa: `public/branding/logo-alyne-padrao.jpg`.
- A antiga releitura botânica não é a marca ativa; os arquivos anteriores foram preservados em `assets/review-only/branding-legacy-20260808/`.
- As cópias originais das mídias tratadas foram preservadas em `assets/review-only/media-originals-round-20260808/`.
- Não há placeholder nem mídia sem logo na rodada pública atual.

## Arquivos ativos principais

- `src/properties.js`: dados editoriais públicos dos 17 anúncios.
- `src/propertyMedia.js`: associação segura entre anúncios e as 82 imagens.
- `src/propertyStatus.js`: regras de visibilidade, recomendação e chamadas para ação por status.
- `scripts/verify-catalog.mjs`: validação estática do catálogo e das mídias.
- `src/components/Catalog.jsx`: vitrine, filtros e ordenação.
- `src/components/Recommender.jsx`: busca guiada.
- `src/components/PropertyDetail.jsx`: galeria, dados e CTA do anúncio.
- `app/globals.css`: apresentação responsiva.
- `wrangler.jsonc`: aponta exclusivamente para `alyne-crisostomo-laboratorio`.

## Status públicos

- `Disponível`: pode aparecer na vitrine, nos destaques e no recomendador; CTA de contato/visita permitido.
- `Disponibilidade sob consulta`: pode aparecer, mas a interface deve declarar a necessidade de confirmação; não equivale a disponibilidade confirmada.
- `Em preparação`: não deve parecer pronto, não entra no recomendador e não deve oferecer visita como se estivesse disponível.
- `Indisponível`: pode permanecer como histórico/portfólio, sem promoção ativa, recomendação ou CTA enganoso.
- `Arquivado`: fica fora da vitrine.

## Validação desta fotografia

- Verificador do catálogo: aprovado para 17 anúncios e 82 mídias.
- Build: aprovado.
- Smoke test em navegador desktop e mobile: aprovado, sem exceções e sem overflow horizontal.
- Recomendador: retornou dois resultados no cenário testado.
- Filtros mobile: acessíveis e operáveis.
- Deploy do laboratório: aprovado; URL pública respondeu HTTP 200.
- QA público: 17 cards e 82/82 mídias com HTTP 200 e `image/webp`; desktop, mobile, recomendador e status sem exceções ou overflow.
- Produção: fingerprint baseline intacto após a publicação do laboratório.

## Pendências

Há 32 conjuntos fora da rodada: REF `001`, `002`, `003`, `004`, `005`, `006`, `007`, `008`, `009`, `010`, `021`, `022`, `024`, `030`, `031`, `032`, `039`, `040`, `041`, `042`, `043`, `044`, `046`, `047` e oito conjuntos sem REF. Eles não devem ser publicados até que identidade, dados, associação de mídia e pelo menos uma foto adequada com logo estejam simultaneamente confirmados.

## Hospedagem

O fluxo antigo de ChatGPT Sites não é parte da arquitetura ativa. Seus artefatos foram preservados em `legacy/sites/`. O laboratório está publicado no Worker `alyne-crisostomo-laboratorio`; qualquer atualização futura deve continuar isolada nesse Worker, após autorização e validação, sem tocar o Worker de produção.
