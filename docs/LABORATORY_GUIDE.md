# Guia operacional do laboratório

Atualizado em 8 de agosto de 2026.

## 1. Escopo

Este diretório é o único ambiente autorizado para novas alterações do catálogo. Produção não é uma área de sincronização automática e nunca deve ser usada como destino de testes.

Laboratório:

`C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alyne-crisostomo-laboratorio`

Worker permitido para testes autorizados:

`alyne-crisostomo-laboratorio`

Publicação atual do laboratório:

- URL: `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev`
- Version ID: `befde55a-0f5b-4900-9398-f0367c814dac`
- QA público: HTTP 200, 17 cards e 82/82 WebP acessíveis; desktop/mobile/recomendador/status sem exceções ou overflow.
- Produção permaneceu com o fingerprint baseline intacto.

Produção congelada:

`C:\Users\ALYNE_CRISOSTOMO\.copilot\repos\copilot-worktrees\catalogo-imobiliario-redencao\alynecrisostomo02-cautious-spoon`

Worker que não deve ser tocado:

`alyne-crisostomo-imoveis`

## 2. Bloqueio de Git

O `.git` do laboratório aponta para metadados do worktree de produção. Não execute qualquer comando Git nesta pasta. Não troque branch, não crie commit e não tente reparar o vínculo durante uma tarefa de catálogo.

O snapshot de retorno seguro é:

`C:\Users\ALYNE_CRISOSTOMO\OneDrive\Documentos\Site catalogo\backups\laboratorio-snapshot-20260808-203244`

Esse snapshot não deve ser usado como fonte ativa nem copiado por cima do laboratório sem uma missão de restauração explícita.

## 3. Estrutura ativa

- `src/properties.js`: dados públicos dos anúncios.
- `src/propertyMedia.js`: capas e galerias.
- `src/propertyStatus.js`: regras de disponibilidade e CTA.
- `public/imoveis/`: WebP otimizados e liberados para o laboratório.
- `public/branding/logo-alyne-padrao.jpg`: logo padrão oficial.
- `assets/review-only/`: originais, legado e material fora do bundle público.
- `legacy/`: código/dados antigos preservados, nunca importados pela aplicação ativa.
- `scripts/verify-catalog.mjs`: verificador obrigatório.
- `wrangler.jsonc`: configuração do Worker de laboratório.

## 4. Identidade e mídia

A marca ativa é a logo padrão AC “Alyne Crisóstomo — Corretora de Imóveis”. Não restaurar monograma botânico, releitura, símbolo improvisado ou logo antiga no cabeçalho, rodapé ou recomendador.

Para imóveis:

- publique apenas fotos seguramente associadas ao anúncio;
- mantenha a logo da Alyne visível;
- preserve arquivos originais fora de `public/`;
- não use placeholder, print, documento ou imagem de outro imóvel;
- ajuste capa e galeria sem distorcer arquitetura ou inventar elementos;
- mantenha UTF-8 e nomes públicos com acentuação correta.

## 5. Dados públicos

Não exponha no JavaScript público:

- caminhos locais do Windows;
- links internos de Drive;
- nome de proprietário;
- Pix, documentos ou contatos particulares;
- notas de auditoria e pendências administrativas;
- campos privados como `sourceFolderUrl` ou URLs internas de mídia.

Ausência de dado não autoriza dedução. Omita o campo ou use linguagem pública de confirmação quando a fonte permitir.

## 6. Fluxo seguro de alteração

1. Confirme que a missão autoriza edição no laboratório.
2. Leia `CURRENT_STATE.md`, `AGENT_HANDOFF.md` e o relatório da rodada.
3. Confirme a referência canônica e a associação de mídia antes de editar.
4. Faça mudanças localizadas; não mexa em produção nem em backups.
5. Execute o verificador do catálogo.
6. Gere um build novo; não use `dist` antigo como fonte.
7. Faça smoke test das rotas e dos fluxos alterados em desktop e mobile.
8. Só faça deploy se houver autorização específica e confirme que o nome do Worker é `alyne-crisostomo-laboratorio`.
9. Documente os resultados e pare antes de qualquer promoção para produção.

## 7. Comandos locais

Use Corepack porque `pnpm` global pode não existir:

```powershell
corepack pnpm run verify
corepack pnpm run build
corepack pnpm run dev -- --port 3001
```

O ambiente local usual é `http://localhost:3001/`.

Um deploy, quando expressamente autorizado, deve apontar somente para a configuração do laboratório. Confira `wrangler.jsonc` antes de executar qualquer comando Cloudflare. Nunca altere o nome para o Worker de produção.

## 8. Checklist de encerramento

- [ ] Produção permaneceu intacta.
- [ ] Nenhuma operação Git foi executada.
- [ ] IDs, REFs e slugs continuam únicos.
- [ ] Aliases históricos não viraram anúncios duplicados.
- [ ] Toda mídia pública pertence ao anúncio e contém a logo padrão.
- [ ] Nenhum dado privado entrou no bundle.
- [ ] Status, vitrine, recomendador e CTA são coerentes.
- [ ] Verificador passou.
- [ ] Build passou.
- [ ] Desktop e mobile foram verificados.
- [ ] Worker e URL foram registrados, caso tenha havido deploy.
