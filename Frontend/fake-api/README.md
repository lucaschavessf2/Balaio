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
- `db.json`: banco de trabalho criado automaticamente no primeiro início e ignorado pelo Git. Ao iniciar, a API completa um `db.json` antigo: adiciona coleções e contas novas do seed, vincula pedidos ao comprador pelo nome remove peças e itens de curadoria cujo artesão não tem conta de vendedor, publica peças que estavam na antiga situação `curadoria` e coloca na fila do selo todo artesão que ainda não tem selo nem solicitação. POST/PATCH/PUT/DELETE persistem nesse arquivo; reiniciar não apaga alterações.
- `npm run api:seed`: regenera somente `seed.json` a partir de `src/mocks` e referências existentes.
- `fake-api/arquivos/pecas/`: fotos de peças enviadas pelos artesãos, ignoradas pelo Git e servidas em `/api/v1/arquivos/pecas/:arquivo`. O banco guarda só o caminho.
- `npm run api:reset`: **substitui o banco de trabalho pelo seed e apaga as fotos enviadas**, descartando os dados criados. Execute com a API parada.

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
| `POST /auth/cadastro`, `/auth/login` (ou `/auth/entrar`), `/auth/logout` | Cadastro, entrada e encerramento de sessão local por cookie |
| `GET/PATCH /usuario` | Consulta e atualização do usuário autenticado |
| `POST /checkout` | Exige sessão; recebe `itens: [{slug, quantidade}]`, `freteId`, `meio` e `endereco`; calcula total na API e gera ID |
| `POST /pedidos/:id/conversa` | Mensagem com autor, texto e hora |
| `POST /pedidos/:id/avaliacao` | Nota 1–5, comentário e aspectos; somente pedido entregue e não avaliado |
| `GET /artesao/conversas`, `/artesao/pedidos-pendentes` | Dados do painel; `?artesao=slug` filtra pelo dono da peça |
| `POST /pecas` | Exige sessão de artesão e cria no ateliê da sessão. `situacao: publicada` entra direto na loja; `rascunho` fica só no painel. Até 5 fotos JPG, PNG ou WebP de 5 MB em base64, salvas em arquivo |
| `PATCH /pecas/:slug` | Exige sessão do artesão dono. Edita os dados, publica ou volta para rascunho, ou define `inativadoEm` para removê-la do catálogo público |
| `DELETE /pecas/:slug` | Exige sessão do artesão dono; apaga a peça e as fotos dela |
| `GET/POST /artesao/selo` | Exige sessão de artesão; consulta o selo de verificado e a última solicitação, ou pede o selo (novamente, após ajuste) |
| `GET /admin/curadoria` | Exige admin; solicitações de selo de verificado pendentes |
| `POST /admin/curadoria/:id/decisao` | Exige admin. `decisao: aprovada` concede o selo; `ajuste` exige `motivo`, que o artesão vê no painel. Nenhuma decisão afeta as vendas |
| `GET/POST /admin/mediacoes` | Consulta e abertura com pedido, assunto, partes, relato e solução |
| `PATCH /admin/mediacoes/:id` | Atualização da análise |
| `GET /referencias`, `/usuario`, `/fretes` | Referências, conta de demonstração e opções de entrega |
| `GET/PATCH /artesaos/:slug/configuracoes` | Consulta e salva preferências de envio e recebimento do ateliê |
| `PATCH /conta/:id`, `POST /conta/:id/senha` | Exigem sessão do titular; atualizam dados e senha conferindo a atual |
| `GET /pedidos` | Com sessão de comprador, retorna apenas os pedidos dessa conta; `compradorId` pode restringir a consulta |

Os recursos do json-server também oferecem CRUD padrão. Nas coleções com slug, o ID é igual ao slug; pedidos e vídeos usam seus próprios IDs.

## Integração e limites da demonstração

Catálogo, busca, perfis, carrinho/favoritos (consulta de peças), agenda, checkout, pedidos, conversa do comprador, avaliações, mediações, curadoria, cadastro de peças e metadados/comentários de vídeos usam HTTP. Formulários preservam os dados quando a API falha; checkout só esvazia a sacola após a confirmação.

O json-server é uma API local de desenvolvimento, sem segurança de produção, cobrança, notificações reais ou armazenamento de arquivos binários. Os dados de negócio — contas de comprador e vendedor, sessões, ateliês, peças, vídeos e seus metadados, endereços, sacola, favoritos, histórico de busca, pedidos, conversas, perguntas, avaliações, mediações e recuperação de senha — são persistidos no `db.json`. O cookie de sessão é HTTP-only, mas esta implementação não substitui um provedor de identidade real. O usuário de demonstração é `carlos@exemplo.com`, com senha `balaio123`. Fotos de peças são gravadas em `fake-api/arquivos`, ao lado do `db.json`; capas de vídeos ainda usam uma imagem de exemplo. A curadoria não aprova peças: ela concede o selo de artesão verificado, e o artesão vende desde o cadastro. O tema claro/escuro permanece no navegador por ser uma preferência local da interface.

O Dockerfile empacota o Next.js (build `standalone`) **e a Fake API** na mesma imagem. O `scripts/iniciar-producao.cjs` sobe os dois processos: a API em `127.0.0.1:3001` e o Next.js na porta `7879`. Se um deles cair, o contêiner é encerrado. O healthcheck consulta `/healthz` e `/api/v1/referencias`. O `db.json` não entra na imagem: ele é recriado a partir do `seed.json` no primeiro início. Os dados criados ficam no sistema de arquivos do contêiner e voltam ao seed quando ele é recriado. Para apontar a imagem para o backend real na Avaliação 2, configure `API_URL` no build (rewrite) e na execução (SSR).

## Verificação

```sh
npm run test:api
npx tsc --noEmit
npm run lint
npm run build
```

Os testes usam servidor HTTP real em porta aleatória e banco temporário, sem alterar `db.json`. Cobrem contratos, filtros, paginação, relacionamentos, 404, CRUD, persistência, total do checkout, isolamento de mensagens, curadoria, avaliações e mediações.

Referência da API programática: [documentação do json-server 0.17.4](https://github.com/typicode/json-server/tree/v0.17.4#module).
