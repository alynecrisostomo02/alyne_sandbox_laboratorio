# Referência Visual Oficial — Jardim Botânico

> **A direção “Jardim Botânico — Refinamento Visual de Imagens” foi aprovada pelo IMOB 00 e é a única referência visual oficial desta implementação. A estrutura, os dados, o conteúdo, as rotas e as funcionalidades existentes permanecem preservados.**

## Finalidade deste documento

Este documento registra a aparência implementada e os critérios do refinamento aprovado. O objetivo foi harmonizar as imagens com o Jardim Botânico/Botânico Minimalista por meio de tratamento natural e discreto, sem redesenhar componentes nem inventar uma nova direção.

Referências de autoridade:

- `refinamento-visual-imagens-jardim-botanico.pdf`;
- `IMOB02_REFINAMENTO_VISUAL_IMAGENS.md`;
- decisão formal do IMOB 00 de 30 de julho de 2026.

## Refinamento de imagens implementado

- fotografias com `saturate(.91) contrast(.97) brightness(.99)`;
- véu verde inferior suave, de transparente até `rgba(13, 45, 38, .14)`;
- filete interno off-white de `1px solid rgba(251, 250, 247, .22)`;
- imagens de cards em `cover`;
- imagens da galeria detalhada e miniaturas em `contain`, centralizadas sobre fundo creme uniforme;
- nenhuma alteração nos arquivos fotográficos originais;
- sem `blend-mode`, desfoque, granulação, sépia ou vinheta pesada;
- sem novas legendas sobre artes promocionais;
- identificação visível `Demonstração · A confirmar` nos cards e detalhes.

Não foram adicionados retratos da Alyne nem uma marca gráfica externa porque esses ativos oficiais, com proveniência/liberação adequada, não existem nesta pasta-fonte.

## Aparência atual

O site possui estética imobiliária premium, natural e discreta:

- fundos off-white e creme;
- verde profundo como cor institucional;
- grafite para texto;
- dourado suave em detalhes;
- bastante espaço em branco;
- cantos moderadamente arredondados;
- sombras leves;
- fotografia ou bloco visual como foco dos cards;
- comunicação direta e local.

Não há brilho intenso, transparência excessiva, fontes externas ou animações chamativas.

## Tokens principais

Os tokens atuais estão no início de `app/globals.css`.

| Papel | Valor atual |
| --- | --- |
| Verde mais escuro | `#0d2d26` |
| Verde institucional | `#12392f` / `#19493d` |
| Verde de apoio | `#225e4e` |
| Dourado | `#c6a15b` |
| Dourado escuro | `#9f7a38` |
| Creme | `#f7f4ed` |
| Off-white | `#fbfaf7` |
| Grafite | `#27312e` |
| Texto secundário | `#65716d` |
| Branco | `#ffffff` |

Os raios atuais variam aproximadamente entre 10, 16 e 24 pixels.

## Tipografia

- texto: pilha de fontes do sistema, com `Inter` como primeira preferência caso esteja instalada;
- títulos: `Georgia` e `Times New Roman`;
- títulos com peso médio, entrelinha curta e espaçamento levemente negativo;
- labels e pequenos destaques com peso forte e espaçamento em caixa alta.

Não há Google Fonts nem fonte carregada por CDN.

## Estrutura visual

### Cabeçalho

- fixo durante a rolagem;
- fundo off-white quase opaco;
- logotipo padrão oficial AC + “Alyne Crisóstomo — Corretora de Imóveis”,
  sem monograma botânico, releitura ou símbolo improvisado;
- menu recolhível no celular;
- navegação horizontal no desktop;
- botão principal de WhatsApp.

### Página inicial

- hero verde escuro;
- título grande;
- dois botões de ação;
- composição arquitetônica abstrata;
- barra de busca clara sobreposta ao final do hero;
- três imóveis em destaque;
- seção de serviços;
- chamada para busca guiada;
- chamada final para WhatsApp.

### Catálogo

- banner escuro;
- filtros em painel móvel ou coluna fixa no desktop;
- contagem e ordenação;
- grade de cards;
- estado vazio com ação para limpar ou conversar.

### Cards

- imagem ou bloco visual;
- selos de finalidade e status;
- favorito em botão circular;
- localização, título, preço e fatos principais;
- botão “Ver detalhes”;
- borda clara, sombra suave e elevação discreta ao passar o mouse.

### Detalhes

- galeria principal e miniaturas;
- informações centrais com hierarquia clara;
- diferenciais em lista;
- card lateral de interesse no desktop;
- ações de WhatsApp, visita, favorito e compartilhamento.

### Busca guiada

- painel institucional verde;
- progresso em seis passos;
- uma pergunta por vez;
- botões de resposta;
- resumo e cards recomendados ao final.

### Rodapé

- fundo verde muito escuro;
- marca, navegação e contato;
- informações comerciais sem métricas ou depoimentos inventados.

## Botões e campos

Variantes atuais:

- primário verde;
- dourado;
- claro;
- contorno;
- discreto/ghost.

Todos têm tamanho de toque confortável, foco visível e transições curtas. Campos possuem label, borda clara e foco verde.

## Responsividade

O CSS segue abordagem mobile-first.

Breakpoints principais:

- `520px`: grades de duas colunas e ajustes intermediários;
- `768px`: seções mais amplas e layouts em múltiplas colunas;
- `960px`: menu desktop, três cards na home, filtros fixos e galeria detalhada;
- `1180px`: refinamentos para telas amplas.

No celular:

- menu é recolhível;
- filtros abrem em painel;
- cards preservam leitura;
- WhatsApp flutua sem depender de texto;
- galerias usam rolagem horizontal;
- botões mantêm área de toque confortável.

O CSS respeita `prefers-reduced-motion`.

## Acessibilidade visual

- contraste alto entre verde, branco e grafite;
- foco visível;
- link para pular ao conteúdo;
- labels em campos;
- estados selecionados combinam cor e forma;
- mensagens dinâmicas usam regiões apropriadas;
- animações são curtas e podem ser reduzidas pelo sistema.

## Capturas

As capturas documentais, quando geradas, ficam em:

- `docs/screenshots/current-home.png`
- `docs/screenshots/current-catalog.png`

Elas representam apenas o estado visual deste pacote, não uma aprovação definitiva.

## Limites da direção aprovada

Mudanças visuais futuras exigem nova decisão do IMOB 00 e especificação aprovada do IMOB 02. Até lá, não devem ser retomadas propostas exploratórias anteriores nem criada outra direção.

Qualquer evolução posterior deve preservar:

- o esquema dos imóveis;
- as rotas compartilháveis;
- filtros e ordenação;
- busca guiada;
- favoritos locais;
- mensagens de WhatsApp;
- compartilhamento;
- acessibilidade e responsividade;
- centralização da configuração comercial;
- ausência de autenticação obrigatória.
