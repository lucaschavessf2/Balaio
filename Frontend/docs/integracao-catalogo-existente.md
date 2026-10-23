# Integração dos endpoints existentes do catálogo

Validação em 22/10/2026. Este é o estado atual após o ajuste de escopo; o relatório `integracao-homepage.md` registra a primeira etapa histórica.

## Resultado e limites do escopo

Foi integrado exclusivamente o endpoint de negócio que já existe no catálogo: **GET /api/v1/pecas**. Nenhum endpoint, controller, rota Next, proxy, regra de backend, entidade, tabela ou migration foi criado ou alterado. Gateway e bancos permaneceram intactos. O frontend acessa o catálogo somente pelo API Gateway.

A auditoria integral do catálogo percorreu controllers, service/use case, portas, DTOs, domínio, entidade JPA, specifications, adapter, repository, configuração, migrations existentes, testes e README. `PecasController` expõe apenas a listagem; `ListarPecasService` mantém as regras e paginação; `PecasPersistenceAdapter`, `PecaSpecifications` e `SpringDataPecaRepository` consultam o PostgreSQL. O OpenAPI executável confirmou uma única operação de negócio: `GET /api/v1/pecas`.

A listagem existente aceita `q`, `tecnica`, `territorio`, `categoria`, `tipo`, `disponibilidade`, `desconto`, `ordenar`, `pagina` e `tamanho`. Somente peças publicadas e não inativadas são expostas. A página máxima é de 100. Essas regras foram apenas inspecionadas e testadas, sem alterações.

## Matriz de integração solicitada

Todos os caminhos de frontend nesta tabela são relativos a `Balaio/Frontend/`. A coluna final também identifica os fluxos preservados na Fake API.

| Endpoint existente no catalog-service | Funcionalidade correspondente | Status da integração | Arquivos modificados nesta rodada | Testes e resultados | Funcionalidades Fake e justificativa |
| --- | --- | --- | --- | --- | --- |
| GET /api/v1/pecas | Vitrine da Homepage | Integrado pelo Gateway; seleção agora centralizada no service | src/services/api/pecas.servico.ts; src/app/page.tsx; src/services/api/cliente.test.ts | HTTP 200; 24 registros reais; 19 cards renderizados; URLs registradas apontam ao Gateway | Artesãos, eventos e vídeos da Home continuam Fake: pertencem a domínios não integrados |
| GET /api/v1/pecas com q e filtros | Busca textual e filtros de /search | Integrado pelo Gateway | src/services/api/pecas.servico.ts; src/app/search/page.tsx; src/services/api/cliente.test.ts | 15 casos de busca SSR aprovados; filtros individuais e combinados, nomes de artesãos e vazio validados | Referências dos seletores permanecem Fake; GET /referencias não existe no catálogo |
| GET /api/v1/pecas com ordenar, pagina e tamanho | Ordenação e paginação de /search | Integrado; 12 peças por página | Os mesmos arquivos da busca | Quatro ordenações HTTP 200; páginas 1/2 e parâmetros sanitizados aprovados; limite máximo validado | Nenhuma mudança no contrato ou ordenação do backend; desempate de preço não é garantido |
| GET /api/v1/pecas | Sugestões de nomes de peças do Cabeçalho | Integrado; primeira página de até 100 | src/components/layout/Cabecalho.tsx; src/services/api/pecas.servico.ts | Trace SSR comprovou consultas ao Gateway e ausência de listagem Fake na Home/Search | Sugestões de artesãos e referências continuam nas respectivas operações Fake |
| GET /api/v1/pecas com tipo e tamanho | Prateleira auxiliar de peças do mesmo tipo, no detalhe | Integrado pelo Gateway; exclusão e limite locais preservados | src/services/api/pecas.servico.ts; src/services/api/cliente.test.ts | Query real tipo=Esculturas & Bonecos/tamanho=11 retornou 200; testes de exclusão, limite e erro aprovados | Dados principais do detalhe e relacionadas continuam Fake: seus endpoints não foram implementados |
| GET /api/v1/pecas existe, mas estes consumidores permanecem Fake | usePecas no navegador: sacola, favoritos e checkout; enriquecimento de peças em /videos | Preservados deliberadamente na Fake API | Nenhuma mudança nesses consumidores; regressões em src/services/api/cliente.test.ts | Seleção padrão Fake e rewrite preservados; /cart, /favorites e /videos retornaram 200; trace de /videos confirmou peças Fake | Estado/checkout/vídeos ainda usam a mesma base Fake; migrá-los parcialmente criaria divergência de preços/slugs. A leitura pública migrada é SSR e não criou encaminhamento novo no navegador |
| Não implementados: GET /pecas/:slug, /historico e /relacionadas | Detalhe, histórico e relacionadas | Mantidos na Fake API | Nenhum service correspondente alterado | GETs reais das três rotas retornaram 404; detalhe Fake retornou 200; trace comprovou a origem | Ausência de endpoint real; não foi implementada alternativa no backend |
| Não implementados: GET /artesaos/:slug/pecas e /referencias | Peças por artesão e referências de filtros | Mantidos na Fake API | Nenhum service correspondente alterado | Ambas as rotas retornaram 404 pelo Gateway; referências Fake retornaram 200 | Operações ainda sem suporte no catálogo real |
| Nenhuma operação POST/PATCH/DELETE no OpenAPI do catálogo | Cadastro, edição, exclusão e inativação de peças | Mantidos na Fake API | Nenhum wrapper de mutação alterado | Inventário de controllers/OpenAPI e testes de origem confirmaram preservação; testes Fake aprovados em banco temporário | Não há endpoint de escrita real; nenhum foi criado ou chamado contra PostgreSQL |
| Fora do catálogo | Contas, perfis, autenticação, pedidos, checkout, conversas, perguntas, eventos e vídeos | Permanecem Fake | Nenhum service desses domínios alterado | Testes Fake existentes 3/3; regressões HTTP em login, sacola, favoritos, eventos e vídeos aprovadas | profile-service, commerce-service, community-service e events-service não foram integrados |

## Implementação mínima no frontend

`listarPecas(filtros, origem = 'fake')` mantém seu comportamento padrão. O novo helper de comunicação `listarPecasPublicas(filtros)` centraliza a seleção das leituras públicas já existentes: no servidor, escolhe Gateway quando `GATEWAY_API_URL` está preenchida; sem essa configuração, escolhe Fake explicitamente para compatibilidade. No navegador, o cliente devolve `ORIGEM_INDISPONIVEL` antes de fetch. Nenhuma nova API foi criada para isso.

Home, Search e Cabeçalho chamam o helper sem conhecer variáveis ou URLs. `pecasPorTipo` reutiliza o mesmo GET com `tipo` e `tamanho=limite+1`, remove o slug atual e limita os resultados localmente. O detalhe principal continua sendo obtido da Fake API.

O cliente HTTP compartilhado existente foi preservado nesta rodada: timeout de 10 segundos, envelope, headers, sinal e tratamento de erros. Falha do Gateway configurado não dispara fallback. API_URL e o rewrite global /api/v1 continuam Fake; GATEWAY_API_URL permanece privada e usada em runtime pelo servidor. Compose, Dockerfile e next.config.ts não precisaram de novos ajustes.

## Arquivos alterados nesta rodada

1. `src/services/api/pecas.servico.ts`: helper público e seleção da listagem por tipo.
2. `src/app/page.tsx`: passa a usar o helper; remove a escolha de variável de ambiente da página.
3. `src/app/search/page.tsx`: busca/filtros/ordenação/paginação passam ao helper.
4. `src/components/layout/Cabecalho.tsx`: apenas a consulta de nomes de peças passa ao helper, limitada a 100.
5. `src/services/api/cliente.test.ts`: oito testes adicionados e regressão Fake ajustada; agora 24 testes de serviços.
6. `.env.example`: comentários passam a descrever as leituras públicas migradas; valores não foram substituídos por URLs de microsserviços.
7. `README.md`: execução, escopo atual, testes, limitações e referência a este relatório.
8. `docs/api.md`: compatibilidade da listagem e endpoints ainda Fake.
9. `docs/arquitetura.md`: seleção no service, SSR e coexistência das origens.
10. `fake-api/README.md`: responsabilidades preservadas durante a transição.
11. `platform/README.md`: estado atual de integração; arquivo Compose mantido.
12. `docs/integracao-homepage.md`: aviso de relatório histórico, preservando seu conteúdo.
13. `docs/integracao-catalogo-existente.md`: este relatório e a matriz de aceite.

Estrutura visual, estilização e tipos de domínio permaneceram iguais nesta rodada. Nenhuma dependência ou script npm novo foi necessário. As alterações locais anteriores, inclusive CRLF e a exclusão de Balaio/Backend, foram preservadas. Snapshots desta rodada estão em `/tmp/balaio-scope-audit/frontend-before-1792719831050571358`.

## Documentação consultada

Além dos READMEs e contratos locais do Frontend, catálogo, Gateway e platform, as quatro páginas autorizadas do Confluence foram consultadas novamente, sem edição:

- [Índice de Engenharia e Arquitetura](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/28639233).
- [Contratos de API e integração](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/28999681).
- [Guia de execução local](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/29556737).
- [Autenticação e autorização local](https://projeto-integrador.atlassian.net/wiki/spaces/DDS/pages/26279937).

A documentação de contratos inclui rotas de detalhe e relacionadas como fatia planejada, mas o executável atual só implementa a listagem. Essas rotas foram mantidas Fake. O guia local já descrevia /search no Gateway antes da migração efetiva; agora essa leitura está integrada. A proposta antiga de substituir API_URL globalmente não foi aplicada: a coexistência de origens é necessária enquanto os demais endpoints faltam.

## Validação executada e evidências

Os testes usaram Node 22 em Docker, sem instalar Node, Java, Maven ou PostgreSQL no host:

- `npm run lint`: aprovado.
- `npx tsc --noEmit`: aprovado.
- `npm run test:api`: 3/3, com banco temporário.
- `npm run test:services`: 27/27, sendo 24 testes de serviço e três testes existentes de renderização do card. Total das duas suítes: 30 testes aprovados.
- `npm run build`: aprovado no Dockerfile, somente imagem frontend construída.
- `docker compose config --quiet`: aprovado.
- Auditoria HTTP do catálogo: 71 GETs registrados, com 61 respostas 200, quatro 400 esperadas para tipos inválidos e seis 404 esperadas para rotas ausentes. OpenAPI confirmou somente GET /api/v1/pecas.
- PostgreSQL: 24 peças públicas/ativas, conexões JDBC confirmadas e igualdade integral dos registros antes/depois da aplicação.
- Imagem final em contêiner temporário da mesma rede: 23 verificações de páginas, incluindo 15 casos de busca, filtros individuais/combinados, quatro ordenações, paginação, vazio e sanitização. Os slugs dos cards foram comparados com a resposta real da consulta. Dezoito imagens responderam 200.
- Instrumentação temporária registrou consultas de Home/Search/Cabeçalho/tipo ao Gateway e detalhe/relacionadas/peças de vídeos à Fake API. Não foi usada apenas semelhança visual para inferir a origem.
- Gateway ausente: Home e Search usaram Fake explicitamente. Gateway configurado e indisponível: Home e Search exibiram o erro existente sem fallback; dados principais de detalhe, vídeos e eventos continuaram disponíveis pela Fake API.
- No ambiente ativo da porta 4321, 13 URLs retornaram 200: Home, seis URLs de busca, detalhe, vídeos, sacola, favoritos, login e eventos. As URLs exatas estão em live-validation.json.
- Bundle do navegador sem http://api-gateway:8080; NODE_OPTIONS de instrumentação ausente; logs sem ERROR, Unhandled ou ECONNREFUSED inesperados.

Exemplos registrados na prova de origem:

```text
Home/Cabeçalho -> http://api-gateway:8080/api/v1/pecas?pagina=1&tamanho=100 -> 200,24 peças
Search -> http://api-gateway:8080/api/v1/pecas?q=barro&ordenar=preco-asc&pagina=1&tamanho=12 -> 200,12 peças
Search artesão -> http://api-gateway:8080/api/v1/pecas?q=Mestre+Nuca&ordenar=recentes&pagina=1&tamanho=12 -> 200,4 peças
Tipo auxiliar -> http://api-gateway:8080/api/v1/pecas?tipo=Esculturas+%26+Bonecos&tamanho=11 -> 200
Detalhe -> http://127.0.0.1:3001/api/v1/pecas/leao-imperial-de-tracunhaem -> 200
Vídeos/enriquecimento -> http://127.0.0.1:3001/api/v1/videos e /pecas -> 200
```

A instrumentação e os contêineres temporários foram removidos. Evidências mantidas somente em `/tmp/balaio-scope-audit/`: `frontend-origin-proof.json`, `live-validation.json`, `runtime-validation.json`, `backend-final-proof.json` e `catalog-readonly-proof-1792719745691885531.json`.

## Persistência e integridade do backend

Somente o frontend foi recriado. O db.json e eventuais uploads Fake foram copiados para backup protegido em `/tmp/balaio-catalog-runtime-backup-42hi0k8n`, restaurados no novo contêiner antes do start e comparados integralmente após a inicialização. O usuário do arquivo permaneceu UID 1001. Gateway, catálogo e banco conservaram seus IDs; os quatro serviços estão healthy.

As montagens e o volume PostgreSQL são os mesmos, e todos os registros do catálogo foram comparados antes/depois. A comparação de montagens foi feita por destino, pois a ordem do array retornado pelo Docker não é estável. Nenhum volume foi removido, nenhum dado PostgreSQL foi escrito, nenhum schema ou migration foi alterado.

Hashes e inventário dos 108 arquivos dos seis repositórios de backend/Gateway permaneceram idênticos, sem adições ou exclusões. Nenhum commit ou push foi realizado.

## Limitações registradas

- Nomes humanos de artesãos no texto_busca são os incorporados ao seed e não acompanham alterações de perfil na Fake API. Não foi adicionada sincronização entre serviços.
- recentes significa ordem_catalogo descendente. Empates de preço não têm critério secundário garantido; foi observada troca entre duas peças de R$350, mantendo ordenação numérica correta. Nenhuma ordenação de backend foi modificada.
- Parâmetros de tipo inválido enviados diretamente ao catálogo retornam HTTP 400 padrão Spring, sem envelope. O cliente preservado traduz esse caso em HTTP_400; a UI normaliza seus parâmetros antes da chamada. Nenhum contrato paralelo foi criado.
- Home e sugestões têm limite de 100 peças; a busca usa 12 por página. Um catálogo maior exige estratégia própria para contagens globais da vitrine.
- Slugs e dados entre catálogo e Fake não são sincronizados. Uma peça existente apenas no PostgreSQL pode não ter detalhe, favorito ou compra resolvidos na Fake. As 24 atuais são compatíveis.
- A validação foi HTTP/SSR e por testes automatizados; não havia navegador conectado para verificar hidratação, cliques e responsividade interativamente. Não houve compra ou alteração de dados de usuário no ambiente ativo.
- Permanecem as vulnerabilidades de dependências já registradas na primeira etapa; esta rodada não adicionou ou atualizou pacotes.

A integração fica limitada às leituras compatíveis do endpoint existente. As rotas ausentes foram documentadas e permaneceram na Fake API.
