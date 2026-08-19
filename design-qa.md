**Design QA — Captação mobile**

**Posicionamento vigente — 14/08/2026**
- A Captação existe exclusivamente dentro do Admin autenticado, na aba `Captação` de `/admin`.
- As antigas rotas públicas `#/captacao` e `#/captacao/nova` e o link no cabeçalho público foram removidos.
- As capturas abaixo permanecem como evidência visual da interface; a localização pública exibida nelas não representa mais a arquitetura vigente.

**Fonte visual verdadeira**
- `C:\Users\ALYNE_CRISOSTOMO\.codex\codex-remote-attachments\019fb079-17b0-7031-bd81-00a95911f148\4D40EE6C-C16A-4E43-AF7D-F46E30A6E130\1-Foto-1.jpg`
- Dimensões da fonte: 1280 × 960 px. A fonte é uma prancha com três iPhones; esta primeira entrega cobre intencionalmente as duas primeiras telas.

**Evidência renderizada final**
- Dashboard: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-qa-20260814\final-jpg\dashboard-390.png`
- Formulário: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-qa-20260814\final-jpg\form-390.png`
- Publicação validada: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-qa-20260814\live\dashboard-live-390.png` e `form-live-390.png`.
- Comparação conjunta: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-qa-20260814\comparison-final.png`
- Viewport principal: 390 × 844 CSS px, deviceScaleFactor 1, capturas 390 × 844 px.
- Responsividade adicional conferida em 375 × 844, 430 × 844 e 1366 × 900.
- Estados comparados: tela inicial da Captação e primeira etapa de Nova Ficha.

**Findings**
- Nenhuma divergência P0, P1 ou P2 permaneceu na comparação final.
- [P3] O ornamento botânico do título é mais fotográfico do que a ilustração linear da referência.
  - Local: `capture-brand-sprig` e `capture-topbar-leaf`.
  - Evidência: a referência usa pequenos ramos desenhados; a implementação reutiliza uma imagem botânica real com máscara suave.
  - Impacto: diferença discreta, sem alterar hierarquia, leitura ou uso.
  - Decisão: aceitável nesta primeira versão; não foi criada ilustração artificial para substituir um asset ausente.

**Superfícies de fidelidade**
- Tipografia: títulos editoriais em Georgia/serif, textos de interface em fonte de sistema, pesos e quebras coerentes com a referência.
- Espaçamento e ritmo: composição vertical, card principal, cards recentes, progresso, campos e barra de ações reproduzem a densidade e os raios do modelo sem overflow.
- Cores e tokens: creme/off-white, verde botânico profundo, dourado discreto e estados pastel mapeados para a identidade existente.
- Imagens: três miniaturas realistas 4:3 e imagem botânica própria; crops, nitidez e compressão adequados ao mobile. O hero ativo foi otimizado de 1.986.799 B para 163.853 B.
- Conteúdo: textos, fichas mockadas, campos e ações solicitados estão presentes; a terceira tela de resumo foi implementada com os dados realmente preenchidos. PDF, mídia, documentação e persistência permanecem fora desta etapa.

**Comparação focada**
- Não foi necessária uma segunda montagem de recortes: as duas capturas individuais em resolução original deixam legíveis títulos, inputs, botões, status, miniaturas e navegação. A comparação conjunta foi usada para composição e hierarquia; as capturas individuais foram usadas para detalhes.

**Histórico da iteração**
1. Primeiro passe: havia um cabeçalho do site acima da tela mobile, acrescentando uma faixa que não existe no modelo (P2), e o asset botânico ativo tinha cerca de 1,99 MB (P2 de desempenho mobile).
2. Correções visuais: o hero foi convertido para JPEG de 163.853 B e o PNG-fonte foi preservado fora do bundle público ativo.
3. Correção de arquitetura: a interface foi incorporada ao Admin autenticado; cabeçalho, rotas e navegação pública de Captação foram removidos.
4. Evidência pós-correção visual: `comparison-final.png`, mais capturas finais em 375, 390 e 430 px. Não há overflow horizontal ou controle persistente cortado.

**Interações e validações**
- Dentro do Admin, `+ Nova Ficha` abre o formulário; `Continuar` gera o resumo; `Editar` volta ao formulário preservando os dados; o botão voltar do formulário retorna ao dashboard.
- Seleções, inputs, chips Sim/Não, contador de observações e avisos locais de Salvar/Continuar usam estado local.
- Dashboard, formulário, Home e Imóveis renderizaram; Home e Imóveis responderam HTTP 200.
- Console da tela de formulário: nenhum erro de aplicação encontrado.
- Worker do laboratório validado em HTTP 200, versão `8161c0d5-267e-481d-8f4c-8bf302f095a0`; `/admin` está acessível e protegido pela autenticação existente.

**QA da tela Resumo — 14/08/2026**
- Fonte visual verdadeira: `C:\Users\ALYNE_CRISOSTOMO\.codex\codex-remote-attachments\019fb079-17b0-7031-bd81-00a95911f148\4D40EE6C-C16A-4E43-AF7D-F46E30A6E130\1-Foto-1.jpg` (1280 × 960 px; terceira tela da prancha).
- Implementação renderizada: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-summary-final.png` (375 × 812 px, captura do conteúdo do navegador integrado).
- Comparação conjunta normalizada: `C:\Users\ALYNE_CRISOSTOMO\AppData\Local\Temp\captacao-summary-comparison.png` (780 × 844 px; referência recortada e implementação lado a lado).
- Viewport solicitado: 390 × 844 CSS px; `devicePixelRatio: 1`. O navegador integrado reservou 15 px para a barra de rolagem e 32 px para sua moldura, resultando na captura de conteúdo 375 × 812 px; a comparação normalizou ambos os lados para 390 × 844.
- Estado comparado: resumo preenchido de uma casa para venda, com dados principais, características e comodidades.
- Evidência de tela completa: hierarquia, fundo creme, verde botânico, dourado discreto, cards, divisores, títulos e CTA preservam a direção da referência.
- Comparação focada: não foi necessário outro recorte, porque o comparativo 780 × 844 mantém legíveis títulos, dados, divisores e ações; o DOM acessível confirmou os valores e estados exatos.

**Findings — Resumo**
- Nenhuma divergência P0, P1 ou P2 permaneceu.
- Diferença intencional: o cabeçalho do Admin aparece acima do resumo porque a usuária determinou que Captação exista exclusivamente no site administrativo.
- Diferença intencional: Documentação e Mídia não aparecem como dados fictícios; `Gerar PDF` está visivelmente desabilitado. Essas funções não pertencem a esta etapa.
- Tipografia: títulos serifados e textos de interface mantêm a hierarquia editorial da referência, sem truncamento.
- Espaçamento e ritmo: blocos de 12–14 px, divisores leves, botões de 48 px e conteúdo sem overflow horizontal.
- Cores e tokens: creme/off-white, verde profundo e dourado usam os tokens existentes da Captação.
- Imagem e ornamentos: somente o asset botânico já aprovado foi reutilizado; nenhum placeholder, desenho improvisado ou asset novo foi criado.
- Copy: o resumo comunica claramente que é local e sem persistência, evitando prometer PDF ou cadastro definitivo.

**Histórico da iteração do Resumo**
1. Primeiro passe: após `Continuar`, o resumo herdava a rolagem baixa do formulário e abria no meio da página (P2).
2. Correção: a troca de views da Captação passou a reposicionar a janela no topo.
3. Evidência pós-correção: `scrollY: 0`, título `Resumo da Ficha` visível, `Editar` habilitado, PDF desabilitado e screenshot final iniciando no cabeçalho correto.
4. Interações verificadas: preenchimento, seleções, chips, geração do resumo, retorno por `Editar`, preservação de `Casa` e `João da Silva`, novo avanço ao resumo e CTA demonstrativo.
5. Console do navegador: zero erros e zero avisos.

**Open Questions**
- Nenhuma questão bloqueante. Importação real, PDF, mídia, documentação e persistência continuam explicitamente fora desta etapa.

**Implementation Checklist**
- [x] Tela inicial mobile-first.
- [x] Formulário local funcional.
- [x] Resumo local com dados preenchidos e edição preservada.
- [x] Navegação exclusiva dentro do Admin autenticado.
- [x] Responsividade 375/390/430 e desktop.
- [x] Build e verificador.
- [x] Comparação visual final.

**Follow-up Polish**
- Em uma fase futura, uma ilustração botânica oficial em PNG/WebP transparente pode aproximar ainda mais os pequenos ornamentos do mockup.

final result: passed
