# Arquitetura do frontend

## Tecnologias

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** com CSS organizado em camadas (`src/styles/`)
- **React Context** para estado global
- **Fake API** com json-server (`fake-api/`), persistida em `db.json`, coexistindo com o API Gateway na migração gradual
- Leaflet + OpenStreetMap (mapa de eventos) e Recharts (gráfico do painel)

## Estrutura de pastas

```
Frontend/
├── src/
│   ├── app/          páginas e rotas
│   ├── components/   componentes separados por domínio
│   ├── services/     comunicação com a API e sessão
│   ├── store/        estado global
│   ├── hooks/        lógica reutilizável
│   ├── types/        tipos do domínio
│   ├── constants/    valores fixos
│   ├── utils/        funções auxiliares
│   ├── mocks/        dados sintéticos que geram o seed da Fake API
│   ├── styles/       estilos
│   └── proxy.ts      proteção de rotas
├── fake-api/         Fake API (servidor, seed e testes)
├── public/           imagens estáticas
└── Dockerfile
```

| Pasta | Responsabilidade |
|---|---|
| `app/` | Monta cada tela: busca os dados pelos services e compõe os componentes |
| `components/` | Componentes por domínio: `produto`, `carrinho`, `pedido`, `painel`, `admin`, `eventos`, `forms`, `layout`, `ui` e `feedback` (carregando, erro e estado vazio) |
| `services/api/` | Único ponto de acesso à API: um cliente HTTP (`cliente.ts`) e um arquivo por recurso (`pecas.servico.ts`, `pedidos.servico.ts`...) |
| `store/` | Sessão, sacola, favoritos e dados compartilhados |
| `hooks/` | Lógica reutilizável dos componentes (`usePecas`, `useReferencias`...) |
| `types/` | Tipos das entidades (`Peca`, `Artesao`, `Pedido`, `Evento`, `Usuario`...) |
| `constants/` | Valores fixos: rótulos, departamentos, municípios e tipos de evento, mapa de telas |
| `utils/` | Formatação, validação de formulários, filtros de URL, distância entre pontos e imagem padrão |
| `mocks/` | Só dados sintéticos: servem de fonte para o seed da Fake API e não são importados pelas telas |

## Fluxo dos dados

```
Página ou componente
   └─ service       (ex.: obterPeca)          src/services/api/pecas.servico.ts
       └─ cliente   (buscar / enviar)         src/services/api/cliente.ts
           ├─ Fake API /api/v1/...             origem padrão das operações existentes
           └─ API Gateway GET /api/v1/pecas    leituras públicas disponíveis no servidor
               └─ Catalog Service → PostgreSQL
```

- As páginas são renderizadas no servidor e buscam os dados antes de montar o HTML.
- Os componentes interativos (sacola, favoritos, formulários) chamam os mesmos services
  no navegador.
- O cliente HTTP aplica timeout de 10 s e devolve sempre `{ dados, erro }`. As telas
  nunca fazem `fetch` direto.
- A origem padrão do cliente continua sendo `fake`. O tipo `OrigemApi` permite
  selecionar `gateway` por chamada, reutilizando a lógica HTTP existente.
- `listarPecasPublicas(filtros)` centraliza a seleção das leituras públicas de
  catálogo: Homepage, busca/filtros/ordenação/paginação, nomes de peças sugeridos no
  Cabeçalho e peças por tipo. Escolhe Gateway no servidor quando configurado e Fake
  explicitamente quando ausente, sem variáveis ou URLs nas páginas.
- `listarPecas(filtros, origem = 'fake')` preserva a origem dos consumidores anteriores.
  `usePecas` continua Fake no navegador para sacola, checkout e favoritos; o
  enriquecimento de peças dos vídeos também permanece Fake. Detalhe principal,
  histórico, relacionadas, peças por artesão, referências, mutações e demais domínios
  continuam na Fake API.
- `API_URL` mantém a origem Fake no servidor e no rewrite `/api/v1` do navegador.
  `GATEWAY_API_URL` é privada e lida em tempo de execução pelo servidor: no Compose,
  `http://api-gateway:8080/api/v1`; com Next.js direto no WSL,
  `http://127.0.0.1:8080/api/v1`. Não use `NEXT_PUBLIC` nem variáveis por microsserviço.
- Sem `GATEWAY_API_URL`, o service público escolhe explicitamente a Fake API no
  servidor. Configurada a
  origem real, uma falha é exibida pelo estado de erro existente, sem fallback. Uma
  chamada explícita de Gateway sem configuração retorna `GATEWAY_NAO_CONFIGURADO`.
  Gateway no navegador retorna `ORIGEM_INDISPONIVEL`, sem requisição; esta etapa não
  cria um rewrite para o Gateway nem expõe endereços internos.

A Homepage busca a primeira página de até 100 peças, cobrindo os 24 registros atuais
para montar destaques editoriais, ofertas, as 12 mais avaliadas e contagens de
artesãos. Com mais de 100 registros, essas seleções e contagens ficam limitadas à
primeira página e exigem evolução específica. As sugestões de nomes de peças no
Cabeçalho também são limitadas a 100; a busca usa 12 por página. Peças por tipo usam
`limite + 1` registros (13 no padrão de 12), excluem o slug atual localmente e retornam
até `limite`. Artesãos, referências, eventos e vídeos continuam na Fake API.

O Gateway oferece apenas `GET /api/v1/pecas` do catálogo atual. Não foram criados
endpoints de backend, route handlers do Next.js, proxies ou rewrites adicionais.
Busca por nome de artesão depende do `texto_busca` carregado no seed, sem sincronizar
perfis; `recentes` corresponde a `ordem_catalogo DESC`. Parâmetros da interface são
normalizados antes da consulta; erros de tipo em requisições diretas podem retornar
HTTP 400 do Spring sem envelope, convertido pelo cliente em `HTTP_400`.

A navegação para detalhes, perfis, sacola e favoritos ainda depende da compatibilidade
dos slugs entre as duas bases; não há sincronização de dados nesta etapa.

## Estado global

Montado no `app/layout.tsx`:

- **Sessão:** usuário logado e papel.
- **Sacola** e **favoritos:** carregados da API ao abrir o site e salvos a cada alteração.
- **Dados de apoio:** artesãos, coletivos e opções de frete.
- **Tema claro/escuro:** fica só no navegador.

## Autenticação

- A API grava a sessão em cookie `HttpOnly` após o login.
- O `src/proxy.ts` redireciona antes de a página abrir: quem não está logado vai para
  `/login`, e cada papel só entra na sua área (`/dashboard` para artesão, `/admin` para
  administrador).
- As páginas protegidas confirmam a sessão na API antes de mostrar os dados.

## Carregando, erro e estado vazio

| Situação | Tratamento |
|---|---|
| Carregando | `loading.tsx` nas rotas principais e `EstadoCarregando` |
| Erro | `error.tsx` com botão "Tentar novamente" e `EstadoErro` |
| Não encontrado | `not-found.tsx` |
| Lista vazia | `EstadoVazio` (sacola, favoritos, busca, pedidos, curadoria, mediações) |
| Erro em formulário | Mensagem da API exibida sem apagar o que foi digitado |

## Estilos e responsividade

- Layout mobile-first com pontos de quebra em 560, 700, 900 e 1000 px.
- Cores definidas uma vez com `light-dark()` para os dois temas, com contraste acessível.
- Foco visível, suporte a leitores de tela e a movimento reduzido.

## Execução

- **Desenvolvimento:** `npm run dev` sobe a Fake API (porta 3001) e o frontend (porta 4321).
- **Produção:** o `Dockerfile` gera uma imagem com o frontend (porta 7879) e a Fake API.
  O Compose de `platform/` configura a origem privada do Gateway no frontend em tempo
  de execução. A Fake API e o rewrite `/api/v1` permanecem ativos. Após alterar essa
  configuração, recrie somente o frontend, preservando os volumes existentes.
