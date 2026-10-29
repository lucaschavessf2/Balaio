# API do Balaio

Na etapa 6, cadastro, login/alias, logout e `GET /usuario` usam **gateway/profile reais**.
O dispatcher mantém capacidades públicas, estado de visitante e os itens da conta na Fake API (`fake-api/server.cjs`).
`GET /conta/perfil`, `PATCH /usuario`, endereços e consulta de pedidos usam o Fake após validar a sessão real no gateway. Demais recursos privados pendentes retornam 404. Consulte [autenticação real e execução local](auth-local.md).
Os dados simulados ficam em `fake-api/db.json`, separados por UUID em `perfisExternos`; edições não alteram as credenciais ou o perfil do backend real.

- **URL no navegador:** `/api/v1`; autenticação usa `API_GATEWAY_URL` no servidor. `API_URL` mantém o destino Fake.
- **Formato:** JSON
- **Acesso no frontend:** todas as chamadas passam por `src/services/api/`

---

## Formato das respostas

Toda resposta segue o mesmo envelope:

```json
{ "dados": { }, "erro": null, "paginacao": { "pagina": 1, "tamanho": 9, "total": 24, "totalPaginas": 3 } }
```

`paginacao` só aparece em listagens paginadas. Em caso de erro:

```json
{ "dados": null, "erro": { "codigo": "NAO_AUTENTICADO", "mensagem": "Entre na sua conta para continuar." } }
```

| Status | Código | Quando |
|---|---|---|
| 400 | `REQUISICAO_INVALIDA` | Dados inválidos |
| 401 | `NAO_AUTENTICADO` / `CREDENCIAIS_INVALIDAS` | Sem sessão / e-mail ou senha errados |
| 403 | `SEM_PERMISSAO` | Papel ou dono do recurso não confere |
| 404 | `RECURSO_NAO_ENCONTRADO` | Recurso inexistente |
| 409 | `EMAIL_EM_USO` e outros | Conflito de estado |

---

## Autenticação

- `POST /auth/login` e alias `/auth/entrar` usam a senha bcrypt persistida no profile e
  emitem JWT RS256 no cookie **`balaio_sessao`** (HttpOnly, SameSite=Lax, Path=/api/v1,
  60 minutos; Secure em HTTPS). Cadastro também emite o cookie. JWT não vai no JSON.
- O gateway aceita cookie/Bearer e encaminha Bearer validado. `GET /usuario` revalida
  no profile e devolve a conta atual; no navegador a consulta restaura a sessão após reload.
- Não há modo demo, seleção de fixture ou sessão Fake no frontend. Cookies antigos de demonstração são expirados pelo proxy e nunca encaminhados.
- **Papéis:** `comprador`, `artesao` e `admin`. O cadastro público só cria comprador ou
  artesão.
- `/account`, `/account/details`, `/account/addresses` e `/orders` exigem sessão real. O hub e o menu de perfil oferecem os itens anteriores, sem seletor demo ou aviso de integração. Alterar senha mantém o link de recuperação simulado preexistente, que não muda a senha real.
- Para os itens Fake da conta, o proxy consulta `GET /usuario` real a cada requisição. Só depois envia identidade limitada em contexto interno HMAC, vinculado ao método/caminho e válido por até 30 segundos. JWT, cookie de autenticação e senha nunca vão ao Fake. Mutações por cookie exigem Origin permitido; Bearer puro segue a validação do gateway. Pedidos e endereços de outras contas não são expostos.
- Checkout, detalhes/ações de pedidos, publicação e painéis continuam bloqueados e suas páginas redirecionam para `/account` sem avisos. A consulta HTTP de um pedido por ID é limitada ao próprio comprador; não habilita suas ações.

**Acesso** nas tabelas abaixo: 🌐 público · 🔑 logado · 🧑‍🎨 artesão · 🛡️ admin.
Na Fake API, algumas rotas de painel e de mediação ainda não conferem o papel. O backend
real fará essa checagem.

---

## Rotas

Todas com o prefixo `/api/v1`.

### Autenticação e conta

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | 🌐 | Cria a conta `{ nome, email, senha, perfil }` e já faz login |
| POST | `/auth/login` | 🌐 | `{ email, senha }` |
| POST | `/auth/logout` | 🌐 | Encerra a sessão |
| POST | `/auth/recuperacao` | 🌐 | `{ email }`: registra o pedido de recuperação de senha |
| GET / PATCH | `/usuario` | 🔑 | Consulta ou altera o usuário logado |
| POST | `/conta/:id/senha` | 🔑 | `{ senhaAtual, novaSenha }` |
| GET / POST / PATCH / DELETE | `/usuario/enderecos` | 🔑 | Endereços de entrega |

### Catálogo

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/pecas` | 🌐 | Busca e filtros: `q`, `tecnica`, `territorio`, `categoria`, `tipo`, `disponibilidade`, `desconto`, `ordenar`, `pagina`, `tamanho` |
| GET | `/pecas/:slug` | 🌐 | Detalhe da peça |
| GET | `/pecas/:slug/relacionadas` | 🌐 | Peças da mesma técnica (recomendação simples) |
| GET / POST | `/pecas/:slug/perguntas` | 🌐 / 🔑 | Perguntas públicas da peça |
| GET | `/artesaos`, `/artesaos/:slug`, `/artesaos/:slug/pecas` | 🌐 | Artesãos e suas peças |
| GET | `/coletivos`, `/coletivos/:slug` | 🌐 | Coletivos |
| GET | `/referencias` | 🌐 | Técnicas, territórios, categorias e tipos para os filtros |

### Sacola e favoritos

Guardados por usuário (logado) ou por visitante (cookie `balaio_cliente`).

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/estado` | 🌐 | Sacola, favoritos e histórico de busca |
| PUT | `/estado/sacola` | 🌐 | `{ sacola: [{ slug, quantidade }] }` |
| PUT | `/estado/favoritos` | 🌐 | `{ favoritos: ["slug"] }` |

### Pedidos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/fretes` | 🌐 | Opções de entrega |
| POST | `/checkout` | 🔑 | Cria o pedido. O total é calculado na API |
| GET | `/pedidos`, `/pedidos/:id` | 🔑 | Pedidos do usuário logado |
| PATCH | `/pedidos/:id/cancelar` | 🔑 | Cancela enquanto o pedido está `confirmado` |
| GET / POST | `/pedidos/:id/conversa` | 🔑 | Mensagens entre comprador e artesão |
| POST | `/pedidos/:id/avaliacao` | 🔑 | `{ nota, comentario }`, só depois da entrega |

Estados do pedido: `confirmado → producao → enviado → entregue`, ou `recusado` /
`cancelado`.

### Painel do artesão

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET / PATCH | `/artesao/me` | 🧑‍🎨 | Dados do ateliê |
| POST | `/pecas` | 🧑‍🎨 | Cadastra peça (até 5 fotos) |
| PATCH / DELETE | `/pecas/:slug` | 🧑‍🎨 | Edita, publica, inativa ou apaga a própria peça |
| GET | `/artesao/pedidos-pendentes` | 🧑‍🎨 | Pedidos aguardando aceite |
| PATCH | `/pedidos/:id/estado` | 🧑‍🎨 | Avança o pedido (produção, envio, entrega) |
| PATCH | `/pedidos/:id/recusar` | 🧑‍🎨 | `{ motivo }` |
| GET / POST | `/artesao/selo` | 🧑‍🎨 | Consulta ou pede o selo de verificado |

### Administração

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/admin/curadoria` | 🛡️ | Pedidos de selo pendentes |
| POST | `/admin/curadoria/:id/decisao` | 🛡️ | `{ decisao: "aprovada" \| "ajuste", motivo }` |
| POST | `/admin/mediacoes` | 🔑 | Comprador abre mediação de um pedido |
| GET / PATCH | `/admin/mediacoes` | 🛡️ | Lista e analisa as mediações |

### Eventos e vídeos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/eventos?lat=&lng=` | 🌐 | Agenda, ordenada por distância quando há coordenadas |
| POST | `/eventos` | 🌐 | Cria evento |
| GET / POST | `/videos`, `/videos/:id/comentarios` | 🌐 | Vídeos dos ateliês e comentários |

---

## Exemplos

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "carlos@exemplo.com", "senha": "balaio123" }
```

```json
{ "dados": { "id": "…", "nome": "Carlos …", "email": "carlos@exemplo.com", "papel": "comprador" }, "erro": null }
```

### Busca

```http
GET /api/v1/pecas?q=pifano&ordenar=preco-asc&pagina=1&tamanho=9
```

```json
{
  "dados": [
    {
      "slug": "banda-de-pifanos-completa",
      "nome": "Banda de Pífanos Completa",
      "artesao": "dona-bia-do-ipojuca",
      "territorio": "Caruaru",
      "tecnica": "Cerâmica & Barro",
      "preco": 420,
      "desconto": 10,
      "disponibilidade": "encomenda",
      "imagem": "/fotos/banda-pifanos.svg"
    }
  ],
  "erro": null,
  "paginacao": { "pagina": 1, "tamanho": 9, "total": 1, "totalPaginas": 1 }
}
```

### Checkout

```http
POST /api/v1/checkout
Cookie: balaio_sessao=<token>
Content-Type: application/json

{
  "itens": [{ "slug": "banda-de-pifanos-completa", "quantidade": 1 }],
  "freteId": "padrao",
  "meio": "pix",
  "endereco": { "cep": "50000-000", "endereco": "Rua da Aurora, 100", "cidade": "Recife", "estado": "PE" }
}
```

```json
{ "dados": { "id": "PE-1758800000000-1a2b3c4d", "total": 416.9, "estado": "confirmado" }, "erro": null }
```

Sem login, a mesma chamada retorna **401** com `NAO_AUTENTICADO`.

---

## Rotas planejadas para o backend real

| Método | Rota | Para quê |
|---|---|---|
| GET | `/recomendacoes?peca=slug` | Recomendações do módulo de IA na página da peça |
| GET | `/recomendacoes/para-mim` | Recomendações pelo histórico do usuário |
| GET | `/admin/indicadores` | Indicadores do painel administrativo |
| GET | `/artesao/vendas` | Faturamento do gráfico do painel do artesão |

## Troca da Fake API pelo backend real

1. O backend implementa as rotas deste documento com o mesmo prefixo e o mesmo formato
   de resposta.
2. Migre método/caminho específico no dispatcher para `API_GATEWAY_URL`; preserve `API_URL` para capacidades ainda simuladas.
3. Ajuste carregadores/identidade da capacidade e teste os contratos. Não encaminhe JWT real ao validador opaco do Fake.
