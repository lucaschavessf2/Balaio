# Integração gradual da Homepage com o catálogo real

> Relatório histórico da primeira etapa. O estado atual está em [Integração dos endpoints existentes do catálogo](integracao-catalogo-existente.md).

Data da validação: 22/10/2026. Resultado: integração aplicada ao frontend do Compose em http://localhost:4321, com os quatro contêineres saudáveis.

## A. Diagnóstico da arquitetura

O frontend usa Next.js App Router, React e TypeScript. As páginas chamam funções de `src/services/api/`; `cliente.ts` centraliza `fetch`, timeout de 10 segundos, JSON, envelope e tratamento de erros. Antes desta alteração, todas as operações usavam a mesma origem: `API_URL` no servidor e `/api/v1` no navegador. O rewrite de `next.config.ts` encaminha esse prefixo para a Fake API.

A Homepage executa em paralelo a listagem de peças e as consultas de artesãos, eventos e vídeos. `montarVitrine` seleciona até 12 ofertas e 12 peças mais bem avaliadas; `montarDestaques` procura quatro slugs editoriais. A seção de artesãos conta as peças recebidas por slug. Nove registros não preservariam essas seções: um dos destaques está na posição 12 da coleção atual. As 24 peças atuais resultam em sete ofertas, 12 cards de avaliação, quatro destaques e sete artesãos.

O Cabeçalho também chama `listarPecas()` para sugestões de busca. Essas consultas continuam na Fake API, inclusive ao abrir a Homepage. Não são fallback da vitrine. Stores, hooks, busca, detalhes, sessão, sacola e favoritos preservam seus serviços atuais.

O Dockerfile existente gera Next standalone e mantém a Fake API no mesmo contêiner. O inicializador sobe os dois processos; o healthcheck consulta `/healthz` e `/api/v1/referencias`. Não foi necessário alterar essa execução, os rewrites ou componentes de layout.

O Gateway já encaminha `/api/v1/pecas` ao catálogo. O catálogo implementa a listagem com filtros, ordenação e paginação, restringindo a peças publicadas e não inativadas. A camada de persistência consulta seu PostgreSQL. A página aceita no máximo 100 registros.

Antes das edições foram conferidos status e diffs. Havia alterações locais extensas de quebra de linha e a exclusão intencional de `Balaio/Backend/`. Elas foram preservadas. Os arquivos existentes editados conservaram CRLF; não houve normalização em massa, commit, push ou restauração do backend antigo.

## B. Verificação da documentação

Foram consultados integralmente os documentos locais aplicáveis: `Frontend/README.md`, `Frontend/docs/api.md`, `Frontend/docs/arquitetura.md`, `Frontend/fake-api/README.md`, além dos READMEs de `api-gateway`, `catalog-service` e `platform`. Também foram inspecionados os serviços HTTP, tipos, componentes consumidores, stores/hooks, Fake API executável, configuração Next/Docker, controllers, DTOs, persistência, migrações, configuração do Gateway e Compose.

As quatro páginas solicitadas do Confluence estavam acessíveis e foram lidas:

- [Índice de Engenharia e Arquitetura](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/28639233).
- [Contratos de API e integração](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/28999681).
- [Guia de execução local — Compose, serviços e bancos](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/29556737).
- [Autenticação e autorização local](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/26279937).

Foram preservados: camada de services, Gateway como entrada do backend real, prefixo `/api/v1`, envelope `{ dados, erro, paginacao? }`, responsabilidade de cada serviço por seu banco, contratos e tratamento de erros existentes. Autenticação e autorização não foram migradas nem alteradas.

Divergências identificadas e decisões:

- O guia local do Confluence descreve `/search` como integrado. O código executável ainda usava a Fake API. Esta etapa mantém `/search` na Fake API, conforme o escopo solicitado.
- A documentação anterior propunha trocar `API_URL` para migrar toda a aplicação. Isso não atende à transição parcial solicitada. A documentação local agora descreve duas origens e seleção por operação.
- O Compose fornecia `API_GATEWAY_URL`, mas o cliente HTTP não lia essa variável. Foi substituída por `GATEWAY_API_URL`, nome usado na implementação.
- O catálogo serializa desconto ausente como zero, enquanto dados Fake frequentemente omitem o campo. Isso revelou uma incompatibilidade de renderização corrigida no card.

Nenhuma página do Confluence foi editada. Sugere-se atualizar o guia de execução e a página de contratos para documentar o estado efetivo: somente a vitrine da Homepage usa o Gateway; `API_URL` continua Fake e `GATEWAY_API_URL` habilita a migração por operação.

## C. Alterações implementadas

Caminhos relativos a `/home/monge/Repo`:

- `Balaio/Frontend/src/services/api/cliente.ts`: adiciona `OrigemApi`, opção `origem` em `buscar` e argumento opcional em `enviar`, mantendo Fake como padrão. Reutiliza o mesmo fetch, timeout, sinais, headers e tratamento de erros; remove a opção de origem antes de chamar fetch. Lê a origem Gateway em runtime e bloqueia seu uso no navegador, sem expor o endereço interno.
- `Balaio/Frontend/src/services/api/pecas.servico.ts`: permite `listarPecas(filtros, origem)` com padrão Fake. Detalhe, histórico, relacionadas, listagens auxiliares e mutações continuam na origem anterior.
- `Balaio/Frontend/src/app/page.tsx`: escolhe Gateway somente quando `GATEWAY_API_URL` está preenchida e pede `pagina=1&tamanho=100`. Mantém a composição visual e as outras consultas na Fake API. Uma chamada cobre as 24 peças atuais sem percorrer indefinidamente o catálogo.
- `Balaio/Frontend/src/components/produto/CartaoPeca.tsx`: substitui três condicionais de desconto por uma condição booleana `temDesconto`. Evita zeros soltos que React renderizava com `desconto: 0`, preservando preços, economia, layout e estilos.
- `Balaio/Frontend/src/services/api/cliente.test.ts`: adiciona 16 testes de seleção de origem, SSR/navegador, configuração em runtime, filtros, envelope, erros, ausência de fallback, timeout, sinal e preservação das operações Fake.
- `Balaio/Frontend/src/components/produto/CartaoPeca.test.tsx`: adiciona três testes de renderização SSR para desconto zero, desconto positivo e avaliações ausentes.
- `Balaio/Frontend/package.json`: adiciona `test:services` para executar os dois arquivos. Nenhuma dependência foi adicionada ou atualizada.
- `Balaio/Frontend/.env.example`: documenta a nova variável opcional, vazia por padrão, com exemplos para WSL e Docker, sem credenciais.
- `Balaio/Frontend/README.md`: documenta as duas origens, escopo, execução, novo script de testes, limite da consulta e continuidade das sugestões Fake do Cabeçalho.
- `Balaio/Frontend/docs/api.md`: registra o contrato e a seleção por operação, o escopo migrado e a permanência dos demais endpoints na Fake API.
- `Balaio/Frontend/docs/arquitetura.md`: atualiza o fluxo transitório e as regras de servidor/navegador sem alterar a organização do projeto.
- `Balaio/Frontend/fake-api/README.md`: mantém instruções de execução e explicita que a Fake API continua necessária nesta etapa.
- `platform/docker-compose.yml`: configura `API_URL=http://127.0.0.1:3001/api/v1` e `GATEWAY_API_URL=http://api-gateway:8080/api/v1` no frontend. Rede, bancos, credenciais e dependências existentes foram preservados.
- `platform/README.md`: documenta a integração exclusiva da Homepage, as duas origens, atualização somente do frontend e divergência com o guia do Confluence.
- `Balaio/Frontend/docs/integracao-homepage.md`: este relatório registra diagnóstico, decisões, mudanças, evidências e pendências.

Não houve alterações no código de `api-gateway` ou `catalog-service`, PostgreSQL, tipos de domínio, seeds, servidor da Fake API, estilos, Dockerfile ou rewrite global.

## D. Fluxo final de comunicação

```text
Vitrine da Homepage
  → listarPecas({ pagina: 1, tamanho: 100 }, 'gateway')
  → cliente HTTP compartilhado
  → API Gateway /api/v1/pecas
  → Catalog Service
  → PostgreSQL do catálogo
```

No Compose, a variável privada `GATEWAY_API_URL` usa o hostname interno `api-gateway`. Em Next executado diretamente no WSL, use `http://127.0.0.1:8080/api/v1`. Não use prefixo `NEXT_PUBLIC_`. A configuração é lida em runtime; a imagem foi construída sem a URL do Gateway e validada com ela na execução.

Sem `GATEWAY_API_URL`, a Homepage escolhe explicitamente a Fake API. Com Gateway configurado e indisponível, exibe o `EstadoErro` existente, sem substituir a vitrine por dados Fake. Selecionar Gateway explicitamente sem configuração retorna `GATEWAY_NAO_CONFIGURADO`; selecioná-lo no navegador retorna `ORIGEM_INDISPONIVEL` antes de fetch.

Busca, filtros, sugestões do Cabeçalho, detalhes, perfis, autenticação, eventos, vídeos, sacola, favoritos, pedidos, checkout e demais operações continuam na Fake API. No navegador, continuam usando o rewrite `/api/v1`. Futuras operações de servidor podem selecionar a mesma origem Gateway; migrações de chamadas do navegador exigem encaminhamento adequado no Next antes de serem habilitadas.

## E. Validações executadas

### Qualidade e contratos

Os comandos abaixo foram executados com Node 22 em contêineres Docker, pois o checkout no Ubuntu não tinha Node Linux nem `node_modules`. Não foi instalado Java, Maven, PostgreSQL ou Node no host.

- `npm run lint`: aprovado.
- `npx tsc --noEmit`: aprovado na versão final.
- `npm run test:api`: três de três testes aprovados, com banco temporário, sem reset do banco de trabalho.
- `npm run test:services`: 19 de 19 testes aprovados, incluindo três renderizações de cards.
- `npm run build`: aprovado dentro do estágio de build do Dockerfile, com a Homepage dinâmica.
- `docker compose config --quiet`: aprovado.
- `docker compose build frontend`: imagem final construída com sucesso.
- `git -c core.whitespace=cr-at-eol diff --check`: aprovado nos arquivos alterados dos dois repositórios. CRLF conferido.

Uma verificação intermediária de TypeScript detectou uma fixture de teste sem `bfcacheId`, exigido pela versão instalada do Next. A fixture foi corrigida e os checks finais passaram. Não restaram falhas de compilação ou testes.

### Prova técnica da origem

Foi usado um contêiner temporário da imagem final, na mesma rede do Compose e com as mesmas duas origens. Um preload temporário registrou as URLs e respostas de fetch durante requisições HTTP às páginas. A vitrine da Homepage produziu:

```json
{"url":"http://api-gateway:8080/api/v1/pecas?pagina=1&tamanho=100","status":200,"quantidade":24,"paginacao":{"pagina":1,"tamanho":100,"total":24,"totalPaginas":1}}
```

A busca `/search?q=barro&ordenar=preco-asc` produziu:

```json
{"url":"http://127.0.0.1:3001/api/v1/pecas?q=barro&ordenar=preco-asc&pagina=1&tamanho=12","status":200,"quantidade":12}
```

A renderização da busca não chamou o Gateway. Artesãos, eventos, vídeos e sugestões do Cabeçalho continuaram na Fake API. A primeira asserção temporária supunha ausência de qualquer consulta Fake de peças na Home; foi corrigida após identificar as consultas independentes do Cabeçalho. A prova distingue a query da vitrine dessas consultas, em vez de tratá-las como fallback.

Também foram validados em contêineres temporários: configuração de Gateway ausente, com Homepage Fake explícita; e Gateway indisponível, com erro na vitrine mesmo enquanto o Cabeçalho ainda consultava a Fake API. Os contêineres de teste e scripts de preload foram removidos. A aplicação ativa não contém `NODE_OPTIONS` de instrumentação. A evidência bruta foi preservada apenas em `/tmp/balaio-home-verification/origin-proof.ndjson` e `container.log`.

### Dados reais e regressão

- Gateway no host: `GET http://localhost:8080/api/v1/pecas?pagina=1&tamanho=9` retornou HTTP 200, nove peças e total 24.
- Dentro do frontend ativo: `GET http://api-gateway:8080/api/v1/pecas?pagina=1&tamanho=100` retornou HTTP 200 e 24 peças, comprovando acesso pela rede Docker.
- Consulta SQL somente de leitura confirmou 24 peças publicadas e ativas; `pg_stat_activity` mostrou conexões do PostgreSQL JDBC Driver no banco do catálogo. Controller, serviço e adapter foram conferidos para confirmar o caminho de persistência.
- Todas as 24 slugs e os campos compartilhados foram comparados com o seed Fake. Os slugs de artesãos também são compatíveis. `preco` e `desconto` são números JSON; `historia` é array de strings. `fotos` e `ordemFotos` são opcionais e não são necessários para a vitrine atual. Valores nulos opcionais atuais não exigiram mudança global de tipos.
- As 18 URLs distintas de imagens retornadas pelo catálogo responderam HTTP 200 no frontend. O HTML renderizou 19 cards de peças sem zeros extras nos preços, além das seções de ofertas, avaliações, artesãos e eventos.
- No frontend ativo, responderam HTTP 200: `/`, `/search?q=barro&ordenar=preco-asc`, `/pieces/leao-imperial-de-tracunhaem`, `/login`, `/cart` e `/events`.
- `/api/v1/referencias` continuou respondendo HTTP 200 pela Fake API. O rewrite de peças preservou o DTO Fake com seu campo `id`.
- A imagem do contêiner ativo corresponde à imagem final validada. Suas variáveis são `API_URL` Fake e `GATEWAY_API_URL` Gateway; `NODE_OPTIONS` está ausente. A busca nos arquivos JavaScript de `.next/static` não encontrou `http://api-gateway:8080`.
- Os logs dos últimos dez minutos de frontend, Gateway e catálogo não apresentaram `ERROR`, `Exception`, `Unhandled` ou `ECONNREFUSED` inesperados.

### Aplicação no Compose e preservação dos dados

Foi reconstruído e recriado somente o frontend. Antes da recriação, seu processo foi parado e `db.json` e eventuais arquivos enviados foram copiados para um backup protegido em `/tmp/balaio-runtime-backup-he__jh1x`. O novo contêiner foi criado com `docker compose up --no-start --no-deps frontend`, os dados foram restaurados antes da inicialização e então foi executado `docker compose start frontend`.

A igualdade integral do JSON Fake antes/depois foi verificada. O arquivo permanece pertencente ao UID 1001 do processo Next/Fake. Uma asserção auxiliar inicial esperava também GID 1001; o processo da imagem usa GID 65533 (`nogroup`) e regrava o arquivo com seu grupo padrão. A verificação foi ajustada ao usuário efetivo, sem alterar credenciais ou dados.

Os IDs dos contêineres Gateway, catálogo e PostgreSQL permaneceram iguais aos anteriores. `docker compose ps` confirmou quatro serviços healthy. Nenhum volume foi removido ou banco PostgreSQL alterado.

## F. Riscos e pendências

- A consulta da vitrine é limitada às primeiras 100 peças. Cobre todo o catálogo atual de 24, mas, se ele ultrapassar 100, contagens por artesão e seleção de ofertas/avaliações se referirão à coleção carregada. Uma estratégia específica deve ser definida antes desse crescimento; não há paginação ilimitada oculta.
- Detalhes, favoritos e sacola ainda dependem dos slugs da Fake API. Uma peça existente somente no PostgreSQL pode aparecer na vitrine e não ser resolvida por esses fluxos. As 24 peças atuais têm correspondência. Não foi alterado o banco para forçar essa equivalência.
- Não havia navegador conectado disponível para validação visual interativa, hidratação, cliques e responsividade. Foram realizados testes HTTP/SSR, carregamento das imagens e renderização dos cards. Os fluxos autenticados completos não foram percorridos em navegador; a Fake API foi coberta pelos testes existentes com dados temporários.
- `npm ci` informou 11 vulnerabilidades nas dependências existentes: oito high e três critical. Não foram adicionadas/atualizadas dependências nem executado `npm audit fix`; a triagem dessas dependências permanece separada desta integração.
- A Fake API continua armazenando seu estado no filesystem do contêiner, conforme a arquitetura anterior. Nesta atualização os dados foram preservados explicitamente; futuras recriações também devem considerar essa persistência.
- As divergências do Confluence descritas na seção B permanecem pendentes de atualização autorizada. Nenhuma funcionalidade futura foi registrada como já implementada.

## G. Próximos passos

1. Migrar busca e filtros somente após validar todos os parâmetros, ordenação, paginação, estados vazios e erros contra o contrato executável, usando seleção explícita de origem.
2. Implementar/validar detalhe e relacionadas no catálogo antes de migrar seus services; o controller atual inspecionado entrega apenas a listagem. Cobrir 404, visibilidade e peças inativadas, além das imagens opcionais.
3. Planejar a continuidade de slugs e dados entre catálogo, perfis e commerce antes de migrar favoritos, sacola e compra. Evitar dependência permanente de registros equivalentes nas duas bases.
4. Definir uma estratégia de vitrine para catálogo acima de 100 peças e executar validação visual em navegador conectado.
5. Atualizar o Confluence mediante autorização específica e tratar as vulnerabilidades herdadas em trabalho próprio.

Essas próximas etapas não foram implementadas nesta alteração.
