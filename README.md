# Balaio: Projeto Origem

> Marketplace da economia criativa e do artesanato de Pernambuco.
> Projeto Integrador **Origem**, disciplina de Desenvolvimento Web, CESAR School, 2026.2.

| | |
|---|---|
| **Deploy** | https://balaio.torreszx.space |
| **Vídeo de demonstração** | `PREENCHER: link do vídeo` |
| **Repositório** | https://github.com/lucaschavessf2/marketplace-artesanato |
| **Branch principal** | Hoje o desenvolvimento acontece em `develop`, por pull request, e `main` é a branch padrão |
| **Entrega atual** | Avaliação 1: frontend responsivo + Fake API estruturada |
| **Contas de teste** | `carlos@exemplo.com` (comprador), `nuca@exemplo.com` (artesão), `admin@exemplo.com` (admin). Senha: `balaio123` |

## 👥 Membros da Equipe

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/GabrielHen-dev">
        <img src="https://avatars.githubusercontent.com/u/113862540?v=4" width="100" style="border-radius:50%;" alt="Foto de Gabriel Henrique"/>
        <br />
        <sub><b>Gabriel Henrique</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/dgcavalcante">
        <img src="https://avatars.githubusercontent.com/u/210120655?v=4" width="100" style="border-radius:50%;" alt="Foto de Diogo Cavalcante"/>
        <br />
        <sub><b>Diogo Cavalcante</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/lucaschavessf">
        <img src="https://avatars.githubusercontent.com/u/153633041?v=4" width="100" style="border-radius:50%;" alt="Foto de Lucas Chaves"/>
        <br />
        <sub><b>Lucas Chaves</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/allyssonifx">
        <img src="https://avatars.githubusercontent.com/u/68469620?v=4" width="100" style="border-radius:50%;" alt="Foto de Allysson Fellype"/>
        <br />
        <sub><b>Allysson Fellype</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Fernando2732">
        <img src="https://avatars.githubusercontent.com/u/209713382?v=4" width="100" style="border-radius:50%;" alt="Foto de Fernando Marinho"/>
        <br />
        <sub><b>Fernando Marinho</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/MatheusAS1">
        <img src="https://avatars.githubusercontent.com/u/210196636?v=4" width="100" style="border-radius:50%;" alt="Foto de Matheus Andrade"/>
        <br />
        <sub><b>Matheus Andrade</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## Descrição

O **Balaio** conecta artesãos e coletivos de Pernambuco (Alto do Moura, Tracunhaém,
Pajeú, Cariri e outros polos) a compradores de todo o país. A plataforma dá vitrine e
canal de venda a quem produz, destacando a **técnica, a origem e a história** de cada
peça. Sem ela, esses artesãos dependem de intermediários e têm pouca visibilidade
digital.

A aplicação atende três perfis:

- **Comprador:** descobre peças, filtra por técnica, território e categoria, compra e
  acompanha pedidos.
- **Artesão:** cadastra e gerencia peças, recebe e acompanha pedidos, conversa com
  compradores e publica vídeos do ateliê.
- **Administrador:** concede o selo de artesão verificado e media conflitos entre
  comprador e artesão.

## Objetivos

- Valorizar o artesanato e a cultura pernambucana.
- Aproximar artesãos e consumidores por meio da tecnologia.
- Facilitar a descoberta de produtos artesanais.
- Dar maior visibilidade aos produtores e coletivos.
- Proporcionar uma experiência de compra simples e intuitiva.
- Criar um espaço para divulgação de eventos e conteúdos relacionados ao artesanato.

## Tecnologias

| Área | Tecnologias |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| Estilo | Tailwind CSS v4 (CSS-first, com `@apply`), tokens CSS com `light-dark()` |
| Estado | React Context (`src/store/`) |
| Fake API | json-server 0.17.4 + rotas próprias em Node.js, persistência em JSON |
| Mapa e gráficos | Leaflet + OpenStreetMap, Recharts |
| Interface | Lucide React (ícones), Sonner (avisos) |
| Qualidade | ESLint, `tsc --noEmit`, testes de integração com `node:test` |
| Deploy | Docker (build `standalone` do Next.js + Fake API na mesma imagem) |

---

## Como executar localmente

Requisitos: **Node.js 22.21+** e npm. A partir da raiz do repositório:

```sh
cd Frontend
npm ci
npm run dev
```

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:4321 |
| Fake API | http://127.0.0.1:3001/api/v1 |

O `npm run dev` sobe a Fake API e o Next.js juntos (`Ctrl+C` encerra os dois). No
primeiro início, a Fake API cria o banco `fake-api/db.json` a partir do
`fake-api/seed.json`. As alterações feitas pela interface **persistem entre reinícios**.

### Contas de demonstração

Todas usam a senha **`balaio123`**:

| Perfil | E-mail | Vai para |
|---|---|---|
| Comprador | `carlos@exemplo.com` | `/account` |
| Artesão | `nuca@exemplo.com` (e outros `*@exemplo.com` do seed) | `/dashboard` |
| Administrador | `admin@exemplo.com` | `/admin` |

Também é possível criar conta de comprador ou de artesão em `/login/register`.

### Scripts

Rodar dentro de `Frontend/`:

| Comando | O que faz |
|---|---|
| `npm run dev` | Fake API + frontend em modo desenvolvimento |
| `npm run dev:web` / `npm run api` | Sobe só o frontend / só a Fake API |
| `npm run build` e `npm start` | Build de produção e servidor na porta 4321 (a API precisa estar no ar) |
| `npm run test:api` | Testes de integração da Fake API (banco temporário, não altera `db.json`) |
| `npm run lint` | ESLint |
| `npm run api:reset` | **Apaga os dados criados** e volta o banco ao seed (rode com a API parada) |
| `npm run api:seed` | Regenera o `seed.json` a partir de `src/mocks/` |

### Com Docker

```sh
cd Frontend
docker build -t balaio-frontend .
docker run -p 7879:7879 balaio-frontend
```

Acesse http://localhost:7879. A imagem sobe o Next.js e a Fake API juntos.

## Variáveis de ambiente

Nenhuma é obrigatória no ambiente local. Para mudar o padrão, copie
`Frontend/.env.example` para `Frontend/.env.local`:

| Variável | Padrão | Para quê |
|---|---|---|
| `API_URL` | `http://127.0.0.1:3001/api/v1` | URL da API usada no servidor (SSR) e no encaminhamento de `/api/v1` do navegador. **Na Avaliação 2, recebe a URL do backend real** |
| `FAKE_API_PORT` | `3001` | Porta da Fake API (se mudar, ajuste `API_URL`) |

O `.env.example` não contém credenciais.

---

## Funcionalidades implementadas

**Comprador e visitante**
- Vitrine com destaques, ofertas, artesãos e eventos
- Busca com histórico e sugestões; filtros por técnica, território, categoria, tipo,
  disponibilidade e desconto; ordenação e paginação
- Página da peça com galeria, história, frete, perguntas públicas e peças relacionadas
- Perfil do artesão, página de coletivo e páginas institucionais
- Favoritos e sacola (guardados na API, inclusive para visitante)
- Checkout com endereço, frete e meio de pagamento (pagamento simulado)
- Pedidos: acompanhamento por etapas, conversa com o artesão, cancelamento antes da
  produção, avaliação após a entrega e abertura de mediação
- Conta: dados pessoais, troca de senha, endereços e recuperação de acesso
- Agenda de eventos com mapa, ordenação por proximidade e criação de evento
- Feed de vídeos dos ateliês, com curtidas, salvos e comentários

**Artesão** (`/dashboard`)
- Resumo com pedidos a aceitar e gráfico de faturamento
- Cadastro e edição de peças com até 5 fotos, rascunho ou publicação, e inativação
- Pedidos: aceitar, recusar com motivo e avançar etapas (produção, envio, entrega)
- Mensagens com compradores, publicação de vídeos
- Perfil do ateliê, configurações de envio e recebimento e pedido do selo de verificado

**Administrador** (`/admin`)
- Curadoria do selo de verificado (aprovar ou pedir ajuste com motivo)
- Mediações entre comprador e artesão

**Experiência e acessibilidade**
- Layout responsivo (mobile a desktop), navegação inferior no celular
- Tema claro e escuro, contraste WCAG AA, foco visível, suporte a leitores de tela e a
  movimento reduzido
- Rotas protegidas por sessão e papel
- Tratamento de carregando, erro e estado vazio nas telas que buscam dados

## Fluxos implementados

**1. Compra (comprador)**
`/` vitrine → `/search?q=…` busca e filtros → `/pieces/[slug]` detalhe →
adicionar à sacola → `/cart` → `/checkout` (pede login se necessário) →
`/confirmation/[id]` → `/orders/[id]` acompanhamento → `/orders/[id]/review` avaliação

**2. Pós-venda (comprador)**
`/orders/[id]` → conversa com o artesão, **cancelar** (enquanto confirmado) ou
`/orders/[id]/mediation` abrir mediação

**3. Venda (artesão)**
`/login` → `/dashboard` → `/dashboard/pieces/new` cadastrar peça →
peça aparece na vitrine → pedido chega em "pedidos a aceitar" → aceitar ou recusar →
avançar para produção, envio e entrega → `/dashboard/messages` conversar

**4. Curadoria (administrador)**
Artesão pede o selo em `/dashboard/settings` → `/admin` aprova ou pede ajuste →
artesão vê a decisão no painel → selo aparece no perfil público

**5. Descoberta**
`/events` agenda com mapa → `/events/[slug]` · `/videos` feed dos ateliês ·
`/artisans/[slug]` e `/collectives/[slug]` perfis

A rota `/screens` traz um índice navegável de todas as telas, útil na apresentação.

---

## Rotas da API

A documentação completa está em **[`docs/api.md`](Frontend/docs/api.md)**: formato das respostas,
autenticação, rotas, exemplos e rotas planejadas para o backend real. Detalhes de
execução da Fake API: [`fake-api/README.md`](Frontend/fake-api/README.md).

Resumo dos recursos (prefixo `/api/v1`):

| Recurso | Principais rotas |
|---|---|
| Autenticação | `POST /auth/cadastro`, `/auth/login`, `/auth/logout`, `/auth/recuperacao` |
| Catálogo | `GET /pecas` (busca, filtros, paginação), `GET /pecas/:slug`, `/pecas/:slug/relacionadas` |
| Artesãos e coletivos | `GET /artesaos`, `/artesaos/:slug`, `/artesaos/:slug/pecas`, `/coletivos` |
| Sacola e favoritos | `GET /estado`, `PUT /estado/sacola`, `PUT /estado/favoritos` |
| Pedidos | `POST /checkout`, `GET /pedidos`, `PATCH /pedidos/:id/cancelar`, `POST /pedidos/:id/avaliacao` |
| Painel do artesão | `POST/PATCH/DELETE /pecas`, `GET /artesao/pedidos-pendentes`, `/artesao/selo` |
| Administração | `GET /admin/curadoria`, `POST /admin/curadoria/:id/decisao`, `/admin/mediacoes` |
| Apoio | `GET /referencias`, `/fretes`, `/eventos`, `/videos` |

## Integração futura com o backend real (Avaliação 2)

O frontend já está preparado para trocar a Fake API pelo backend real **sem reescrever
telas**:

1. **Toda chamada passa por `src/services/api/`.** As telas usam funções como
   `listarPecas()` e `finalizarCompra()`, nunca `fetch` direto nem dados fixos. O único
   ponto que sabe a URL da API é `src/services/api/cliente.ts`.
2. **O contrato já é o de uma API real:** HTTP, prefixo versionado `/api/v1`, envelope
   `{ dados, erro, paginacao }`, status HTTP corretos, sessão por cookie `HttpOnly` e
   regras de negócio no servidor (total do checkout, permissões, estados do pedido).
3. **A troca é de configuração:** o backend implementa as rotas documentadas e a
   variável `API_URL` passa a apontar para ele. O rewrite do Next.js e o SSR seguem a
   nova URL automaticamente.
4. **O que entra de novo:** services para recomendação (módulo de IA), indicadores do
   admin e vendas do artesão. A Fake API sai do deploy, mas continua útil para
   desenvolvimento e testes.

## Arquitetura

Tecnologias, pastas, fluxo dos dados, autenticação e tratamento de erros:
**[`docs/arquitetura.md`](Frontend/docs/arquitetura.md)**.

```
Frontend/
├── src/app/         páginas (montam a tela)
├── src/components/  componentes por domínio
├── src/services/    única porta para a API + sessão
├── src/store/       estado global (sessão, sacola, favoritos)
├── src/hooks/       lógica reutilizável
├── src/types/       tipos do domínio
├── fake-api/        API da Avaliação 1
└── docs/            documentação
```

## Deploy

| Ambiente | URL |
|---|---|
| Produção | https://balaio.torreszx.space |

A aplicação é publicada com o `Frontend/Dockerfile`. A imagem sobe o frontend
(porta `7879`) e a Fake API no mesmo contêiner, com healthcheck em `/healthz`.

## Evidências

- **Vídeo:** `PREENCHER: link` (principais fluxos: compra, painel do artesão, curadoria)
- **Commits:** histórico por pull request em `develop`, com commits de todos os integrantes
- **Testes:** `npm run test:api` (contratos, filtros, paginação, CRUD, persistência,
  total do checkout, permissões, curadoria, avaliações e mediações)

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/api.md`](Frontend/docs/api.md) | Contrato da API, endpoints e exemplos |
| [`docs/arquitetura.md`](Frontend/docs/arquitetura.md) | Organização do frontend |
| [`docs/uso-de-ia.md`](Frontend/docs/uso-de-ia.md) | Declaração de uso de IA |
| [`fake-api/README.md`](Frontend/fake-api/README.md) | Execução, persistência e limites da Fake API |
