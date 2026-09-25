# Declaração de uso de IA

## 1. Declaração geral

A equipe utilizou ferramentas de Inteligência Artificial durante o desenvolvimento do
Projeto Integrador?

- [x] Sim
- [ ] Não

A equipe usou IA como apoio no frontend: pesquisa técnica, organização da arquitetura,
criação e revisão de componentes, estilos, tipagem em TypeScript, correção de bugs,
acessibilidade e documentação. As sugestões foram testadas no navegador e várias foram
rejeitadas ou refeitas pela equipe. Todo conteúdo incorporado foi revisado, adaptado e
compreendido pelos integrantes.

---

## 2. Ferramentas utilizadas

| Ferramenta | Finalidade de uso | Integrantes que utilizaram |
|---|---|---|
| Claude | Estrutura inicial do frontend, sistema de design, responsividade, acessibilidade e documentação | Gabriel Henrique |
| ChatGPT | Dúvidas de TypeScript e React, apoio na criação de componentes e telas, correção de erros e revisão de código | Lucas Chaves, Allysson Fellype, Diogo Felipe, Fernando Marinho, Matheus Andrade |
| Gemini | Pesquisa técnica sobre a Fake API e revisão de rotas e mensagens de erro | Allysson Fellype |

---

## 3. Registro dos principais usos

| Data | Ferramenta | Uso realizado | Parte do projeto impactada | Resultado incorporado? | Revisão feita pela equipe |
|---|---|---|---|---|---|
| ago/2026 | Claude | Estrutura inicial das telas a partir do design no Figma | Rotas e componentes | Sim | Navegação conferida tela a tela |
| ago/2026 | Claude | Sistema de design com tema claro e escuro | `src/styles/tokens/` | Parcialmente | Cores originais da bandeira rejeitadas por baixo contraste e escurecidas |
| ago/2026 | Claude | Validação de formulários com mensagens em português | `src/utils/validacao.ts` | Sim | Testado com teclado e leitor de tela |
| ago/2026 | Claude | Layout responsivo e navegação mobile | Navegação e CSS | Sim | Conferido em 375, 760, 1024 e 1440 px |
| ago/2026 | Claude | Migração do CSS para Tailwind v4 | `src/styles/` | Sim | Visual comparado antes e depois no navegador |
| ago/2026 | Claude | Agenda de eventos com mapa (Leaflet) | `src/components/eventos/` | Sim | Testado em desktop e mobile |
| set/2026 | Claude | Organização do CSS em camadas | `src/styles/` | Sim | Nenhuma diferença visual nas rotas testadas |
| set/2026 | ChatGPT | Dúvidas sobre json-server e sobre como criar rotas próprias com middleware | `fake-api/server.cjs` | Parcialmente | Rotas testadas com `npm run test:api` e pelas telas |
| set/2026 | Gemini | Revisão das mensagens de erro e dos status HTTP da Fake API | `fake-api/server.cjs` | Parcialmente | Mensagens ajustadas ao padrão `{ dados, erro }` do projeto |
| set/2026 | ChatGPT | Apoio no fluxo de cadastro e login com sessão por cookie | Autenticação, `src/services/api/auth.servico.ts` | Parcialmente | Login testado com as três contas de demonstração |
| set/2026 | ChatGPT | Apoio no envio e na exibição das fotos da peça | Galeria e formulário da peça | Sim | Envio conferido com JPG, PNG e WebP |
| set/2026 | ChatGPT | Ideias para o histórico e as sugestões no campo de busca | `BuscaCabecalho.tsx` | Parcialmente | Comportamento testado no desktop e no mobile |
| set/2026 | ChatGPT | Apoio na navegação do painel do artesão | `src/components/painel/` | Sim | Navegação conferida em todas as abas do painel |
| set/2026 | ChatGPT | Apoio na criação da tela e do componente de Favoritos | `/favorites`, `ListaFavoritos.tsx` | Sim | Adicionar e remover favoritos testados com e sem login |
| set/2026 | ChatGPT | Dúvidas pontuais e correção de erros | `PREENCHER` | Parcialmente | `PREENCHER` |
| set/2026 | Claude | Documentação do frontend (README, API, arquitetura) | `README.md`, `docs/` | Sim | Rotas e exemplos conferidos com o código pela equipe |

---

## 4. Prompts ou descrições relevantes

### Exemplo 1: Tema e cores

Prompt ou descrição:

> Solicitamos apoio para montar o sistema de cores a partir da bandeira de Pernambuco,
> com tema claro e escuro e contraste acessível.

Como a resposta foi utilizada:

> A estrutura de tokens foi adotada, mas as cores originais da bandeira foram rejeitadas
> após a medição de contraste. A equipe escureceu as cores até atingir o mínimo exigido.

### Exemplo 2: Mapa de eventos

Prompt ou descrição:

> Solicitamos um mapa com os eventos de artesanato próximos ao usuário.

Como a resposta foi utilizada:

> A implementação com Leaflet foi usada, mas o serviço de mapas sugerido passou a exigir
> chave de API. A equipe trocou para o OpenStreetMap.


---

## 5. Partes do projeto que tiveram apoio de IA

- [x] Entendimento do problema
- [x] Pesquisa técnica
- [x] Prototipação de telas
- [x] Estruturação do frontend
- [x] Componentização
- [x] Tipagem TypeScript
- [x] Consumo de API
- [x] Fake API
- [ ] Backend
- [ ] Banco de dados
- [x] Autenticação
- [x] Carrinho
- [x] Pedidos
- [ ] Recomendação
- [ ] Processamento assíncrono
- [ ] Cache
- [ ] Testes
- [x] Documentação
- [x] README
- [ ] Deploy
- [x] Correção de bugs
- [x] Outro: acessibilidade e responsividade

---

## 6. Validação humana

A equipe declara que:

- [x] Todo código gerado ou sugerido por IA foi revisado pelos integrantes.
- [x] O código incorporado foi testado antes da entrega.
- [x] A equipe compreende as partes implementadas com apoio de IA.
- [x] A equipe está apta a explicar tecnicamente as decisões tomadas.
- [x] Nenhuma parte relevante foi incorporada sem análise, adaptação ou validação.
- [x] As limitações, erros ou sugestões inadequadas da IA foram avaliadas pela equipe.

---

## 7. Limitações e problemas encontrados

- O serviço de mapas sugerido passou a exigir chave de API. Foi trocado pelo
  OpenStreetMap.
- Uma miniatura de mapa feita só com CSS ficou com aparência de erro e foi substituída
  por um mapa real.
- A primeira correção da altura dos títulos não resolveu. Foi preciso medir a fonte e
  ajustar de novo.
- A primeira versão lia os dados direto nas telas. A equipe criou a camada de services
  e passou a consumir a Fake API por HTTP.


## 8. Responsabilidade da equipe

A equipe declara que todo conteúdo entregue no projeto foi revisado, compreendido e
validado pelos integrantes.

A equipe reconhece que o uso de IA não substitui a responsabilidade técnica sobre o
projeto e que todos os integrantes devem ser capazes de explicar as funcionalidades,
decisões técnicas, código, integrações e documentação entregues.

**Integrantes:**

- Allysson Fellype
- Diogo Felipe
- Fernando Marinho
- Gabriel Henrique
- Lucas Chaves
- Matheus Andrade