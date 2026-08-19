# Mapa da base de código

Atualizado em 8 de agosto de 2026.

## Visão rápida

```text
app/page.jsx
└── SiteApp
    ├── Header
    ├── Home → PropertyCard
    ├── Catalog → PropertyCard
    ├── PropertyDetail → PropertyVisual
    ├── Recommender → PropertyCard
    ├── About / Contact
    ├── Footer
    └── WhatsApp e toast
```

## Entradas e configuração

| Arquivo | Responsabilidade |
| --- | --- |
| `app/layout.jsx` | HTML raiz, idioma, metadados, robots do laboratório e Open Graph com a logo padrão. |
| `app/page.jsx` | Entrada que renderiza `SiteApp`. |
| `app/globals.css` | Tokens, layout, componentes, responsividade e acessibilidade visual. |
| `src/config.js` | Marca, cidade, WhatsApp, Instagram e textos comerciais centrais. |
| `package.json` | Scripts e dependências. |
| `wrangler.jsonc` | Worker `alyne-crisostomo-laboratorio` e assets do build. |

Não existe `.openai/hosting.json` ativo. A configuração anterior do ChatGPT Sites está preservada em `legacy/sites/`.

## Dados e regras do catálogo

| Arquivo | Responsabilidade |
| --- | --- |
| `src/properties.js` | Fonte pública dos 17 anúncios, IDs, REFs, slugs, preços, descrições e características. |
| `src/propertyMedia.js` | Capa e galeria dos anúncios; reúne 82 WebP com logo verificada. |
| `src/propertyStatus.js` | Regras de exibição, recomendação, preços e CTA por status. |
| `src/utils.js` | Formatação pt-BR, WhatsApp, áreas e navegação hash. |
| `scripts/verify-catalog.mjs` | Verifica unicidade, referências históricas, privacidade, status, imagens e órfãos. |

Dados de rascunho ou anteriores não ficam em `src/`. Eles foram preservados em `legacy/data/` e não podem ser reimportados automaticamente.

## Componentes

| Arquivo | Função |
| --- | --- |
| `src/components/SiteApp.jsx` | Rota hash, favoritos, toast e composição global. |
| `src/components/Header.jsx` | Logo padrão, navegação, menu mobile e WhatsApp. |
| `src/components/Footer.jsx` | Logo padrão, navegação secundária e contato. |
| `src/components/Home.jsx` | Hero, busca rápida, destaques e chamadas. |
| `src/components/Catalog.jsx` | Filtros, ordenação, visibilidade por status e estado vazio. |
| `src/components/PropertyCard.jsx` | Capa, selos, preço, características e favorito. |
| `src/components/PropertyDetail.jsx` | Galeria, descrição, diferenciais, status, CTA e compartilhamento. |
| `src/components/PropertyVisual.jsx` | Renderização de imagens com `fit` e `position`. |
| `src/components/Recommender.jsx` | Questionário, pontuação e resultados elegíveis por status. |
| `src/components/InfoPages.jsx` | Sobre e Contato. |
| `src/components/Icons.jsx` | Ícones SVG locais. |

## Ativos e legado

| Caminho | Uso |
| --- | --- |
| `public/imoveis/` | 82 WebP públicos, separados por REF. |
| `public/branding/logo-alyne-padrao.jpg` | Logo oficial ativa e imagem Open Graph. |
| `assets/review-only/media-originals-round-20260808/` | Originais preservados, fora do bundle. |
| `assets/review-only/branding-legacy-20260808/` | Logos antigas e `og-botanico-legado.png`, sem uso ativo. |
| `assets/review-only/imoveis/` | Materiais antigos ainda em revisão. |
| `legacy/data/` | Dados e rascunhos anteriores. |
| `legacy/sites/` | Configuração e script do antigo fluxo ChatGPT Sites. |
| `legacy/seo/sitemap-production-reference.xml` | Sitemap de produção somente como referência. |
| `docs/screenshots/` | Capturas documentais, não usadas pela interface. |

Para alterar uma capa ou galeria:

1. confirme que a mídia pertence ao mesmo imóvel e possui a logo padrão;
2. preserve o original fora de `public/`;
3. coloque o WebP na pasta da REF em `public/imoveis/`;
4. atualize somente `src/propertyMedia.js`;
5. mantenha a capa como primeira entrada;
6. execute o verificador e o build.

## Fluxos principais

- Busca rápida: `Home` → parâmetros na hash → `Catalog`.
- Catálogo: `properties.js` + `propertyStatus.js` → filtros → `PropertyCard`.
- Detalhe: slug na hash → registro correspondente → `PropertyDetail`.
- Recomendador: respostas → pontuação local → somente anúncios elegíveis por status.
- Favorito: ação no card/detalhe → estado em `SiteApp` → `localStorage`.
- Compartilhamento: API nativa → fallback de cópia → toast.

## Regras de alteração

- Produção é somente leitura.
- O `.git` do laboratório está vinculado ao worktree de produção; não execute Git.
- Não exponha caminhos do Windows, links internos do Drive, proprietários, documentos, Pix ou notas administrativas.
- Não invente campos ausentes.
- Não crie anúncio separado para alias histórico consolidado.
- Preserve UTF-8.
- Não use `dist` antigo como fonte.

## Validação

```powershell
corepack pnpm run verify
corepack pnpm run build
corepack pnpm run dev -- --port 3001
```

Depois de mudanças, teste Home, Catálogo, Detalhe, Recomendador, filtros, favoritos e status em desktop e mobile. Qualquer deploy autorizado deve usar somente o Worker `alyne-crisostomo-laboratorio`.
