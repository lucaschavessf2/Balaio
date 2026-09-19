# Fake API do Balaio

API local com **json-server 0.17.4** (versão fixada pela API programática de middleware), com dados do catálogo e contratos compatíveis com `src/services/api`.

## Executar

Requer Node.js 22.21+ e npm. A partir de `Frontend`:

```sh
npm ci
npm run dev
```

O comando inicia a API em `http://127.0.0.1:3001/api/v1` e o frontend em `http://localhost:4321`. Ctrl+C encerra os dois processos.

Para iniciar separadamente: `npm run api` e `npm run dev:web`.

Não é necessário configurar variáveis no ambiente padrão. Para outro endereço, copie `.env.example` para `.env.local` e configure `API_URL`. `FAKE_API_PORT` muda a porta local da API; atualize também `API_URL` e reinicie os processos. O frontend usa a URL absoluta no servidor e `/api/v1` no navegador, encaminhado pelo Next.js. O backend Java existente não é iniciado nem modificado.

## Dados e persistência

- `seed.json`: base inicial versionada, com peças, artesãos, coletivos, eventos, vídeos, comentários, pedidos, mensagens, curadoria, mediações, usuário de demonstração, fretes e referências.
- `db.json`: banco de trabalho criado automaticamente no primeiro início e ignorado pelo Git. Ao iniciar, a API completa um `db.json` antigo: adiciona coleções e contas novas do seed, vincula pedidos ao comprador pelo nome e remove peças e itens de curadoria cujo artesão não tem conta de vendedor. POST/PATCH/PUT/DELETE persistem nesse arquivo; reiniciar não apaga alterações.
- `npm run api:seed`: regenera somente `seed.json` a partir de `src/mocks` e referências existentes.
- `npm run api:reset`: **substitui o banco de trabalho pelo seed**, descartando os dados criados. Execute com a API parada.

Os mocks originais permanecem como fonte do seed, tipos, funções de apresentação e exemplos de interfaces ainda simuladas. A camada de serviços HTTP não tem fallback silencioso para dados em memória.

## Contrato

```json
{ "dados": [], "erro": null, "paginacao": { "pagina": 1, "tamanho": 10, "total": 28, "totalPaginas": 3 } }
```

`paginacao` aparece na consulta de peças. Falhas retornam o status HTTP apropriado e `{ "dados": null, "erro": { "codigo": "...", "mensagem": "..." } }`. O cliente trata falhas HTTP, JSON inválido e timeout de 10 segundos.

| Endpoint (prefixo `/api/v1`) | Uso |
| --- | --- |
| `GET /pecas` | Busca `q`, filtros `tecnica`, `territorio`, `categoria`, `tipo`, `disponibilidade`, `desconto=true` (só com desconto), ordenação `recentes`, `preco-asc`, `preco-desc`, `avaliacao`, `pagina` e `tamanho` |
| `GET /pecas/:slug` | Detalhe da peça |
| `GET /pecas/:slug/historico` | Dados da peça para preservar pedidos antigos, inclusive quando inativada |
| `GET /pecas/:slug/relacionadas?limite=3` | Mesma técnica, excluindo a peça atual |
| `GET /artesaos`, `/artesaos/:slug`, `/artesaos/:slug/pecas` | Perfis e coleções |
| `GET /coletivos`, `/coletivos/:slug` | Coletivos |
| `GET /eventos`, `/eventos/:slug` | Agenda; `lat` e `lng` ordenam por proximidade |
| `POST /eventos` | Publicação persistente; slug duplicado retorna 409 |
| `GET /videos`, `/videos/:id`, `/videos/:id/comentarios` | Feed e comentários; `?painel=true` inclui rascunhos |
| `POST /videos`, `/videos/:id/comentarios` | Metadados de vídeos e comentários |
| `GET /pedidos`, `/pedidos/:id`, `/pedidos/:id/conversa` | Pedidos e conversa isolada por pedido |
| `POST /checkout` | Recebe `itens: [{slug, quantidade}]`, `freteId`, `meio` e `endereco`; calcula total na API e gera ID |
| `POST /pedidos/:id/conversa` | Mensagem com autor, texto e hora |
| `POST /pedidos/:id/avaliacao` | Nota 1–5, comentário e aspectos; somente pedido entregue e não avaliado |
| `GET /artesao/conversas`, `/artesao/pedidos-pendentes` | Dados do painel; `?artesao=slug` filtra pelo dono da peça |
| `POST /pecas` | Cadastro com situação `rascunho` ou `curadoria` |
| `PATCH /pecas/:slug` | Edita os dados da peça ou define `inativadoEm` para removê-la do catálogo público |
| `GET /admin/curadoria` | Fila de revisão |
| `POST /admin/curadoria/:id/decisao` | `decisao: aprovada` publica a peça; `ajuste` volta para rascunho |
| `GET/POST /admin/mediacoes` | Consulta e abertura com pedido, assunto, partes, relato e solução |
| `PATCH /admin/mediacoes/:id` | Atualização da análise |
| `GET /referencias`, `/usuario`, `/fretes` | Referências, conta de demonstração e opções de entrega |
| `POST /auth/cadastro` | Cria conta com `nome`, `email`, `senha` (mín. 8) e `papel` (`comprador` ou `artesao`); artesão ganha perfil em `/artesaos`; e-mail repetido retorna 409 `EMAIL_EM_USO` |
| `POST /auth/entrar` | Recebe `email` e `senha`; devolve o usuário sem a senha ou 401 `CREDENCIAIS_INVALIDAS` |
| `PATCH /conta/:id`, `POST /conta/:id/senha` | Atualiza nome, e-mail e telefone; troca a senha conferindo a atual (401 `SENHA_ATUAL_INVALIDA`) |
| `GET /pedidos?compradorId=` | Pedidos de um comprador; o checkout exige `compradorId` válido (401 `NAO_AUTENTICADO`) |

Os recursos do json-server também oferecem CRUD padrão. Nas coleções com slug, o ID é igual ao slug; pedidos e vídeos usam seus próprios IDs.

## Integração e limites da demonstração

Catálogo, busca, perfis, carrinho/favoritos (consulta de peças), agenda, checkout, pedidos, conversa do comprador, avaliações, mediações, curadoria, cadastro de peças e metadados/comentários de vídeos usam HTTP. Formulários preservam os dados quando a API falha; checkout só esvazia a sacola após a confirmação.

O json-server é um simulador local, sem autenticação, autorização, cobrança, notificações reais ou upload de arquivos. O acesso é por sessão (cookie `balaio-sessao`, gravado no login/cadastro) e o `src/proxy.ts` protege as áreas: `/account`, `/orders`, `/checkout` e `/confirmation` pedem login, `/dashboard` só abre para artesão e `/admin` só para admin. Cada artesão vê as próprias peças, pendências e conversas; cada comprador vê só os próprios pedidos.

Contas de demonstração, todas com a senha `balaio123`: `carlos@exemplo.com` (comprador), `admin@exemplo.com` (curadoria) e uma conta de vendedor por artesão — `nuca@exemplo.com` e `<slug>@exemplo.com` para os demais (ex.: `maria-de-caruaru@exemplo.com`). As senhas ficam em texto puro no `db.json` e a coleção `usuarios` não é exposta pela API. Vídeos salvam metadados e capa de exemplo. Fotos de novas peças usam imagem de exemplo. Recuperação de senha, configurações de conta/ateliê, endereços, perguntas públicas e alguns indicadores/ações ilustrativos do painel continuam simulados. Sacola, favoritos, tema e histórico de busca continuam no navegador conforme os stores existentes.

O Dockerfile existente empacota somente o Next.js. Para usar esse frontend em contêiner, forneça uma API acessível e configure `API_URL` no build (rewrite) e na execução (SSR); a API de desenvolvimento não é incluída na imagem de produção.

## Verificação

```sh
npm run test:api
npx tsc --noEmit
npm run lint
npm run build
```

Os testes usam servidor HTTP real em porta aleatória e banco temporário, sem alterar `db.json`. Cobrem contratos, filtros, paginação, relacionamentos, 404, CRUD, persistência, total do checkout, isolamento de mensagens, curadoria, avaliações e mediações.

Referência da API programática: [documentação do json-server 0.17.4](https://github.com/typicode/json-server/tree/v0.17.4#module).
