# Contexto do projeto

Atualizado em 8 de agosto de 2026.

## Objetivo

O projeto é um catálogo imobiliário público para Alyne Crisóstomo, com atuação em Redenção, Pará. Ele permite consultar imóveis para venda e locação, combinar filtros, abrir detalhes, salvar favoritos no navegador, usar uma busca guiada local, compartilhar páginas e iniciar atendimento por WhatsApp.

O MVP não possui CRM, banco de dados, autenticação, painel administrativo, pagamentos, formulário com persistência, Google Maps ou API de inteligência artificial.

## Arquitetura funcional

1. `app/layout.jsx` define idioma, metadados e a referência de Open Graph.
2. `app/page.jsx` renderiza `SiteApp`.
3. `SiteApp` interpreta a rota em `window.location.hash`.
4. Os componentes consomem registros locais de `src/properties.js`.
5. `src/propertyMedia.js` associa capa e galeria a cada anúncio.
6. `src/propertyStatus.js` decide visibilidade, recomendação e CTA conforme o status.
7. Favoritos ficam no `localStorage`, apenas como IDs.

Rotas:

- Início: `#/`
- Catálogo: `#/imoveis`
- Detalhe: `#/imovel/{slug}`
- Busca guiada: `#/encontrar`
- Sobre: `#/sobre`
- Contato: `#/contato`

## Ambientes e segurança

Produção está congelada:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alynecrisostomo02-cautious-spoon`
- worker: `alyne-crisostomo-imoveis`
- URL: `https://alyne-crisostomo-imoveis.grand-crab.workers.dev`

O único ambiente ativo para novas alterações é:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alyne-crisostomo-laboratorio`
- worker: `alyne-crisostomo-laboratorio`
- URL pública: `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev`
- Version ID: `befde55a-0f5b-4900-9398-f0367c814dac`
- local: `http://localhost:3001/`

O `.git` do laboratório aponta para a área interna do worktree de produção. Nenhum comando Git deve ser executado até uma correção arquitetural autorizada. O snapshot anterior à rodada está em:

`C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\backups\laboratorio-snapshot-20260808-203244`

## Catálogo atual

- 47 conjuntos analisados: 39 grupos canônicos com REF e oito conjuntos sem REF.
- 15 grupos canônicos aptos.
- 17 anúncios renderizados porque o Edifício Soberano possui três unidades separadas.
- 32 conjuntos pendentes.
- 82 imagens públicas em WebP, todas associadas e com logo padrão.

O detalhamento de cada anúncio e pendência está em `CATALOG_IMPORT_ROUND_2026-08-08.md`.

Consolidações obrigatórias:

- `045 → 036`
- `020 → 021`
- `011 + 018 + 019 → 011`
- `012 + 016 → 017`
- `013 + 014 → 013`
- `027 → 028`

## Fontes editoriais

- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\RELATORIO_MESTRE_CATALOGO_SITE_JARDIM_BOTANICO_V2.pdf`
- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\imoveis\imoveis_fotos_com_logo_resumo_site.pdf`
- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\imoveis\`

O relatório mestre de 7 de agosto prevalece sobre estados antigos do código. Dados ausentes não podem ser inferidos.

## Status públicos

- `Disponível`: elegível para vitrine, destaques, recomendador e contato.
- `Disponibilidade sob consulta`: visível com linguagem explícita de confirmação.
- `Em preparação`: não recomendado e sem CTA de visita como se estivesse pronto.
- `Indisponível`: histórico/portfólio, sem promoção ativa ou CTA enganoso.
- `Arquivado`: fora da vitrine.

## Identidade

A marca ativa é a logo padrão AC “Alyne Crisóstomo - Corretora de Imóveis”:

`public/branding/logo-alyne-padrao.jpg`

Ela é usada no cabeçalho, rodapé, recomendador e metadados Open Graph. O antigo Open Graph botânico (`og-botanico-legado.png`) e as releituras anteriores foram arquivados em `assets/review-only/branding-legacy-20260808/` e não fazem parte da aplicação ativa.

A paleta verde/creme e a apresentação discreta permanecem; a troca de marca não autoriza redesenho geral.

## Mídias

- Capa e galeria ficam em `public/imoveis/`, organizadas por REF.
- A primeira entrada de `propertyMedia` é a capa.
- Toda imagem pública deve pertencer ao anúncio e conter a logo padrão.
- Placeholders, prints, documentos, artes de story e mídias prováveis são proibidos.
- Originais estão preservados em `assets/review-only/media-originals-round-20260808/`.
- Legado não deve ser importado de `assets/review-only/` ou `legacy/` para o bundle ativo sem nova auditoria.

## Integrações e infraestrutura

Ativas no produto:

- WhatsApp por URL `wa.me`;
- Instagram por link externo;
- compartilhamento e área de transferência do navegador;
- favoritos em `localStorage`.

Hospedagem ativa desta frente usa Cloudflare Workers. `wrangler.jsonc` está configurado para `alyne-crisostomo-laboratorio`. O antigo fluxo de ChatGPT Sites foi removido da aplicação ativa e preservado em `legacy/sites/` apenas como histórico.

## Validação conhecida

Na fotografia de 8 de agosto de 2026:

- verificador aprovado para 17 anúncios e 82 mídias;
- build aprovado;
- desktop e mobile aprovados, sem exceções ou overflow horizontal;
- recomendador retornou dois resultados no cenário testado;
- filtros mobile estavam acessíveis;
- deploy do laboratório aprovado com HTTP 200;
- QA público confirmou 17 cards e 82/82 mídias HTTP 200 `image/webp`;
- desktop, mobile, recomendador e status ficaram sem exceções ou overflow;
- produção permaneceu com o fingerprint baseline intacto.

Consulte `CURRENT_STATE.md` e `LABORATORY_GUIDE.md` antes de qualquer alteração.
