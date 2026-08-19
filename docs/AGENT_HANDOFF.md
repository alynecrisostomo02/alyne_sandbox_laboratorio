# Continuidade para agentes

Atualizado em 8 de agosto de 2026.

## Leitura obrigatória

Antes de agir, leia nesta ordem:

1. `docs/CURRENT_STATE.md`
2. `docs/LABORATORY_GUIDE.md`
3. `docs/CATALOG_IMPORT_ROUND_2026-08-08.md`
4. A instrução específica da missão atual

Não recupere decisões antigas apenas por parecerem mais completas. O relatório mestre de 7 de agosto e o estado registrado nestes documentos prevalecem sobre versões antigas do código e rascunhos.

## Regra de segurança mais importante

Produção está congelada e é somente leitura:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alynecrisostomo02-cautious-spoon`
- worker: `alyne-crisostomo-imoveis`
- URL: `https://alyne-crisostomo-imoveis.grand-crab.workers.dev`

Toda alteração autorizada ocorre somente no laboratório:

- pasta: `C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alyne-crisostomo-laboratorio`
- worker: `alyne-crisostomo-laboratorio`
- URL: `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev`
- Version ID atual: `befde55a-0f5b-4900-9398-f0367c814dac`
- servidor local usual: `http://localhost:3001/`

## Git está proibido neste laboratório

O `.git` do laboratório ainda referencia internamente o worktree de produção. Não rode Git, não troque branch e não tente “normalizar” o repositório. Uma correção dessa arquitetura só poderá ocorrer em tarefa própria, com plano de recuperação e autorização explícita.

Snapshot anterior às alterações:

`C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\backups\laboratorio-snapshot-20260808-203244`

## Estado funcional a preservar

- SPA React/Vinext com navegação por hash.
- Home, catálogo, detalhe, busca guiada, Sobre e Contato.
- Filtros, ordenação, favoritos locais, compartilhamento e WhatsApp.
- 17 anúncios e 82 WebP com logo padrão.
- Logo ativa: `public/branding/logo-alyne-padrao.jpg`.
- Marca botânica anterior preservada apenas como legado em `assets/review-only/branding-legacy-20260808/`.
- Originais das imagens preservados em `assets/review-only/media-originals-round-20260808/`.
- Sem ChatGPT Sites no fluxo ativo; referência antiga em `legacy/sites/`.

## Fontes editoriais desta rodada

- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\RELATORIO_MESTRE_CATALOGO_SITE_JARDIM_BOTANICO_V2.pdf`
- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\imoveis\imoveis_fotos_com_logo_resumo_site.pdf`
- `C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\assets\imoveis\`

## Consolidações canônicas

- `045 → 036`
- `020 → 021`
- `011 + 018 + 019 → 011`
- `012 + 016 → 017` (três unidades públicas: 103, 201 e 203)
- `013 + 014 → 013`
- `027 → 028`

Não recrie anúncios históricos separados para os aliases.

## Arquivos que controlam o catálogo

- `src/properties.js`: conteúdo público e referências estáveis.
- `src/propertyMedia.js`: capa e galeria; a primeira mídia de cada grupo é a capa.
- `src/propertyStatus.js`: regras de status, elegibilidade e CTA.
- `scripts/verify-catalog.mjs`: barreiras de consistência, duplicidade, privacidade e mídia.

Não introduza no bundle público caminhos do Windows, links internos do Drive, contatos particulares, nomes de proprietários, notas administrativas ou chaves privadas de auditoria.

## Regras de mídia

- Somente imagens confirmadas do próprio imóvel.
- Somente mídia com a logo padrão da Alyne.
- Não usar placeholder, print, documento, arte de story ou associação provável.
- Preservar originais fora de `public/`; não substituir o acervo-fonte.
- Escolher a capa por qualidade comercial e compatibilidade com o card, não pela ordem do arquivo.
- Quando houver dúvida, manter o imóvel fora da publicação e registrar a pendência.

## Regras de status e CTA

- `Disponível`: apto a vitrine, recomendador e contato.
- `Disponibilidade sob consulta`: pode ser mostrado com linguagem explícita de confirmação.
- `Em preparação`: não recomendar nem oferecer visita como pronta.
- `Indisponível`: sem destaque, recomendação ou CTA de oportunidade ativa.
- `Arquivado`: fora da vitrine.

## Validação conhecida

Na fotografia de 8 de agosto de 2026:

- verificador aprovado: 17 anúncios / 82 mídias;
- build aprovado;
- smoke desktop e mobile aprovado, sem overflow horizontal e sem exceções;
- recomendador retornou dois resultados no cenário testado;
- filtros mobile estavam acessíveis;
- deploy do laboratório aprovado, com HTTP 200;
- QA público confirmou 17 cards e 82/82 mídias HTTP 200 `image/webp`;
- desktop, mobile, recomendador e status ficaram sem exceções ou overflow;
- fingerprint baseline da produção permaneceu intacto.

Rode validações novamente após qualquer modificação. Use `corepack pnpm` em vez de depender de `pnpm` global.

## Formato de entrega

Ao concluir uma missão, informe:

- escopo e arquivos alterados;
- verificações executadas e resultados;
- anúncios ou mídias afetados;
- riscos e pendências remanescentes;
- confirmação de que produção não foi alterada;
- confirmação de que nenhum Git perigoso foi executado;
- se houve deploy, nome exato do Worker e URL validada.
