# Lux API Worker - Versão 5 (interactions-v5-smart-catalog)

Este diretório contém a implementação-fonte isolada do backend Cloudflare Worker da **Lux — Assistente Virtual da Alyne Crisóstomo Imóveis**.

---

## 📐 1. Arquitetura V5

O backend adota o princípio de **pré-filtragem determinística do catálogo em JavaScript** antes de enviar qualquer imóvel para o modelo de linguagem:

```text
Mensagem Atual + Contexto Anterior (userPreferences)
                         │
                         ▼
        Atualização e Sobreposição de Preferências
                         │
                         ▼
           Filtragem Determinística no Catálogo
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   exactMatches                      alternatives
 (Critérios Exatos)              (Mesmo propósito/tipo,
                                  divergência pontual)
        └────────────────┬────────────────┘
                         ▼
   Candidatos Elegíveis + Prompt de Sistema Rígido
                         │
                         ▼
          Gemini 3.5 Flash Interactions API
                         │
                         ▼
         Resposta Estruturada + Quick Replies
```

---

## 📡 2. Contrato da API

### `GET /`
Endpoint de diagnóstico de saúde do serviço:
```json
{
  "ok": true,
  "service": "lux-api",
  "version": "interactions-v5-smart-catalog",
  "message": "Lux API funcionando com busca inteligente no catálogo."
}
```

### `POST /`
Payload recebido do frontend:
```json
{
  "messages": [
    { "role": "user", "text": "Quero comprar uma casa até R$ 500 mil." }
  ],
  "catalog": [...],
  "context": {
    "userPreferences": {}
  }
}
```

Resposta retornada pelo Worker:
```json
{
  "reply": "Encontrei opções para você...",
  "quickReplies": ["Ver detalhes dos imóveis", "Refinar minha busca", "Falar com Alyne"],
  "context": {
    "flow": "gemini",
    "userPreferences": {
      "purpose": "venda",
      "type": "casa",
      "maxPrice": 500000,
      "minDormitories": null,
      "minSuites": null,
      "neighborhood": null,
      "condominiumPreference": null,
      "requiredFeatures": [],
      "desiredFeatures": [],
      "specificRef": null
    }
  },
  "search": {
    "criteria": {...},
    "exactMatches": [...],
    "alternatives": [...]
  },
  "whatsappMessage": "Olá, Alyne. Conversei com a Lux no site. Busco um imóvel para compra de casa até R$ 500.000.",
  "catalogItemsReceived": 17,
  "catalogItemsSentToAI": 3,
  "model": "gemini-3.5-flash",
  "id": "lux-1770736000000"
}
```

---

## 🔑 3. Configuração do Gemini e Autenticação

- **Endpoint upstream:** `https://generativelanguage.googleapis.com/v1beta/interactions`
- **Modelo:** `gemini-3.5-flash`
- **Autenticação:** Exclusivamente via variável de ambiente Secret `env.GEMINI_API_KEY` injetada no cabeçalho `x-goog-api-key`.
- **Configuração:** `store: false` no corpo da requisição upstream.
- **Segurança:** A chave de API nunca é gravada no código, nos logs ou exposta em respostas JSON.

---

## 🎯 4. Estrutura de `userPreferences`

```json
{
  "purpose": "venda | locacao | null",
  "type": "casa | apartamento | terreno | sala comercial | null",
  "maxPrice": 500000,
  "minDormitories": 3,
  "minSuites": null,
  "neighborhood": null,
  "condominiumPreference": true,
  "requiredFeatures": ["piscina"],
  "desiredFeatures": [],
  "specificRef": "REF-029"
}
```

- **Sobreposição Dinâmica:** A mensagem mais recente do cliente atualiza as preferências anteriores.
- **Exemplo de correção:** Se o contexto anterior possui `maxPrice: 500000` e a nova mensagem é *"Pensando melhor pode ser até 650 mil"*, o `maxPrice` é atualizado para `650000` e o valor antigo é descartado.
- **Remoção de exigências:** Frases como *"não precisa de piscina"* ou *"tanto faz o bairro"* limpam a preferência correspondente.

---

## ⚖️ 5. Regras de `exactMatch` e Interpretação de `null`

- **REGRA ABSOLUTA:** `null`, `undefined` ou dados ausentes significam **NÃO CONFIRMADO**.
- Se um imóvel possui `price: null` ou `priceOnRequest: true`, ele **NÃO satisfaz um orçamento máximo exato** e jamais será classificado como `exactMatch`.
- Um imóvel entra em `exactMatches` **SOMENTE se todos os critérios solicitados forem confirmados e atendidos**.

---

## 🔄 6. Regras para Imóveis Alternativos (`alternatives`)

- **Filtro Rígido:** `purpose` (Venda/Locação) e `type` (Casa/Apartamento) explicitamente solicitados **NUNCA mudam em alternativas**. Uma solicitação de compra de casa jamais retornará locações ou apartamentos como alternativa.
- Imóveis com status `"Indisponível"` são desqualificados de exatos e alternativas.
- Cada alternativa recebe uma lista estruturada de divergências `differences`, explicando exatamente a razão do desvio (ex: *"Valor de R$ 550.000, acima do orçamento inicial de R$ 500.000"* ou *"Sem confirmação de piscina"*).

---

## 🔒 7. CORS, Rate Limiting e Privacidade

- **CORS Pendência para Produção:** O header `Access-Control-Allow-Origin: *` permite testes no laboratório. Para produção oficial, deve ser restrito exclusivamente aos domínios autorizados da Alyne Crisóstomo Imóveis.
- **Rate Limiting:** Registra-se que o Worker em produção deve possuir seu próprio binding de Rate Limit (`env.LUX_RATE_LIMITER`).
- **Privacidade:** Nenhuma mensagem ou prompt solicita CPF, RG, dados bancários, documentos pessoais ou endereço residencial completo.

---

## 🧪 8. Como Executar os Testes Automáticos

Os testes rodam localmente sem depender da API real do Gemini:

```bash
node lux-worker/tests/worker.test.js
```

---

## 🚀 9. Publicação no Cloudflare Worker

Para publicar este Worker no Cloudflare no futuro:

```bash
wrangler deploy --name lux-api lux-worker/worker.js
wrangler secret put GEMINI_API_KEY
```
