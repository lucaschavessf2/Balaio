# Arquitetura do frontend

## Tecnologias

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** com CSS organizado em camadas (`src/styles/`)
- **React Context** para estado global
- **Fake API** com json-server (`fake-api/`), persistida em `db.json`
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
           └─ API   /api/v1/...                Fake API hoje, backend real depois
```

- As páginas são renderizadas no servidor e buscam os dados antes de montar o HTML.
- Os componentes interativos (sacola, favoritos, formulários) chamam os mesmos services
  no navegador.
- O cliente HTTP aplica timeout de 10 s e devolve sempre `{ dados, erro }`. As telas
  nunca fazem `fetch` direto.
- Para trocar a Fake API pelo backend real, basta mudar a variável `API_URL`.

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
