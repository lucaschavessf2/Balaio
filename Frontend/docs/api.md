# API do Balaio

O frontend está em migração gradual, com duas origens. A **Fake API**
(`fake-api/server.cjs`, json-server com rotas próprias) continua atendendo as operações
existentes, com dados em `fake-api/db.json` persistidos entre reinícios. As leituras
públicas já disponíveis de `GET /pecas` usam o Catalog Service pelo Gateway quando
`GATEWAY_API_URL` está configurada: Homepage, busca/filtros/ordenação/paginação,
nomes de peças nas sugestões do Cabeçalho e peças por tipo. Detalhes principais,
estado, vídeos, perfis e endpoints ainda ausentes permanecem na Fake API.

- **Origem Fake:** `http://127.0.0.1:3001/api/v1` (configurável por `API_URL`)
- **Origem Gateway no Compose:** `http://api-gateway:8080/api/v1` (por `GATEWAY_API_URL`, somente servidor)
- **Origem Gateway com Next.js direto no WSL:** `http://127.0.0.1:8080/api/v1`
- **Formato:** JSON
- **Acesso no frontend:** todas as chamadas passam por `src/services/api/`

---

## Formato das respostas

As respostas do contrato da aplicação seguem o mesmo envelope. Erros de conversão
de parâmetros gerados pelo Spring podem retornar HTTP 400 sem esse envelope,
tratados pelo cliente como `HTTP_400`:

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

- `POST /auth/login` confere a senha (hash `scrypt`) e grava o cookie **`balaio_sessao`**
  (`HttpOnly`, válido por 7 dias).
- As rotas protegidas leem o cookie ou o header `Authorization: Bearer <token>`.
- **Papéis:** `comprador`, `artesao` e `admin`. O cadastro público só cria comprador ou
  artesão.
- No frontend, `/account`, `/orders` e `/checkout` exigem login; `/dashboard` exige
  artesão; `/admin` exige administrador.

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

## Seleção de origem durante a migração

`API_URL` continua na Fake API, usada no servidor e pelo rewrite `/api/v1` do
navegador. `GATEWAY_API_URL` é privada e lida em runtime pelo servidor; não use
`NEXT_PUBLIC` nem substitua a origem Fake. O cliente mantém `buscar(caminho,
{ origem: 'gateway' })`, o quarto argumento opcional de `enviar` e timeout de 10 s.

`listarPecasPublicas(filtros)`, no service de peças, seleciona Gateway para leituras
públicas no servidor quando configurado e Fake explicitamente quando ausente. Seus
consumidores são Homepage, `/search` com busca/filtros/ordenação/paginação, nomes de
peças nas sugestões do Cabeçalho e `pecasPorTipo`, que reutiliza a listagem existente.
Páginas não conhecem URLs nem a configuração de ambiente.

`listarPecas(filtros, origem = 'fake')` mantém a origem padrão anterior. `usePecas`
continua Fake no navegador para sacola, checkout e favoritos; `/videos` também mantém
seu enriquecimento de peças na Fake API. Detalhe principal, histórico, relacionadas,
peças por artesão, referências, mutações e demais domínios não foram migrados.

O único endpoint de catálogo disponível no Gateway é `GET /api/v1/pecas`, conforme
o OpenAPI e o comportamento executável; detalhe e demais GETs ausentes retornam
404. A tabela de rotas deste documento descreve as funcionalidades da Fake API e não
indica implementação de todas elas no backend real. Não foram criados endpoints de
backend, route handlers do Next.js, proxies ou rewrites para ampliar o contrato.

Homepage e sugestões de nomes de peças no Cabeçalho solicitam a primeira página de
até 100 registros, cobrindo os 24 atuais. Acima disso, suas seleções e contagens ficam
limitadas à página carregada. A busca solicita 12 registros por página.
`pecasPorTipo` pede `limite + 1` (13 no padrão de 12), remove o slug excluído
localmente e limita a resposta; os demais dados da página da peça continuam Fake.

A busca textual ignora maiúsculas/minúsculas e acentos. Nomes de artesãos constam no
`texto_busca` do seed, sem sincronização com perfis Fake; alterações posteriores nos
nomes não são refletidas automaticamente. `recentes` ordena por `ordem_catalogo DESC`,
sem data de criação. Preços são ordenados pelo valor final com desconto. A interface
normaliza filtros, ordenação e página antes do service; tipos inválidos enviados
diretamente podem receber HTTP 400 do Spring sem envelope, tratado pelo cliente
como `HTTP_400`. Não foi criado outro contrato de erros no backend.

Gateway configurado e indisponível não aciona fallback para a Fake API. Selecioná-lo
explicitamente sem URL retorna `GATEWAY_NAO_CONFIGURADO`; no navegador, retorna
`ORIGEM_INDISPONIVEL` sem requisição. Ambas as origens continuam usando o mesmo
cliente e tratamento de envelope. As bases não são sincronizadas: detalhes, perfis,
sacola, favoritos e vídeos ainda dependem de slugs e dados existentes na Fake API.
