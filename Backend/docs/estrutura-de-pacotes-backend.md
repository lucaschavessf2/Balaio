# Estrutura de pacotes do backend

> **Local no Confluence:** 04. Engenharia e Arquitetura → Backend → Estrutura de pacotes

## Objetivo

O backend será um **monólito modular**: uma única aplicação Java/Spring Boot, organizada por capacidades de negócio. Cada módulo concentra o que pertence ao seu contexto, evitando que código de pedidos, eventos, catálogo e usuários se misture.

Neste momento, o repositório contém apenas a estrutura de pastas e as dependências Maven. Não há funcionalidades, tabelas, migrations, endpoints ou configurações implementadas.

## Visão da estrutura

```text
com.artesanato.marketplace
├── modules/
│   ├── identity/
│   ├── catalog/
│   ├── orders/
│   ├── communication/
│   ├── events/
│   ├── curation/
│   ├── artisan/
│   └── integration/
├── shared/
│   ├── audit/
│   ├── config/
│   ├── error/
│   ├── security/
│   └── util/
└── MarketplaceApplication.java
```

O pacote `modules` é apenas um agrupador: ele deixa explícito que seus filhos são módulos funcionais do marketplace e evita poluir a raiz do pacote principal. Ele não substitui as camadas internas de cada módulo.

Cada módulo de negócio usa as quatro camadas abaixo:

```text
<modulo>/
├── api/
├── application/
├── domain/
└── infrastructure/
```

## Módulos de negócio

| Pacote | Responsabilidade | Exemplos futuros |
| --- | --- | --- |
| `identity` | Identifica usuários, perfis e permissões. | Cadastro, login por sessão, papéis `ARTESAO`, `COMPRADOR`, `ORGANIZADOR_EVENTO` e `ADMIN`, perfil de artesão e associação. |
| `catalog` | Mantém a vitrine de produtos artesanais. | Peça, foto, técnica, categoria, origem, território, preço, prazo e disponibilidade. |
| `orders` | Coordena o fluxo de compra. | Carrinho/pedido, itens com preço histórico, reserva de disponibilidade, pagamento, entrega e acompanhamento. |
| `communication` | Centraliza a comunicação e os mecanismos de confiança. | Conversas, mensagens, perguntas sobre peças, avaliações e disputas. |
| `events` | Cuida da agenda de eventos de Pernambuco. | Organizador aprovado, rascunho, submissão, aprovação, página pública, calendário, endereço e coordenadas para o mapa. |
| `curation` | Reúne as ações administrativas de qualidade e moderação. | Aprovação de artesãos e organizadores, curadoria de peças, moderação de conteúdo e decisões sobre eventos. |
| `artisan` | Suporta a operação e a gestão do artesão. | Precificação, insights de mercado, indicadores do catálogo e acompanhamento comercial. |
| `integration` | Isola fornecedores externos do restante do domínio. | Contratos e adaptadores para Mercado Pago, Melhor Envio e storage S3/MinIO. |
| `shared` | Reúne apenas preocupações técnicas compartilhadas. Não recebe regra de negócio. | Configuração, segurança, tratamento padronizado de erros, auditoria e utilitários. |

## O pacote `shared`

`shared` existe para concentrar código técnico reutilizável por mais de um módulo. Ele reduz duplicação, mas **não é uma pasta genérica para qualquer classe que não tenha destino óbvio**. Se algo descreve uma regra, entidade ou fluxo de negócio, ele deve ficar no módulo responsável.

| Subpacote | Pode conter | Não deve conter |
| --- | --- | --- |
| `shared/config` | Beans técnicos, propriedades da aplicação, configuração de CORS, serialização e clientes HTTP reutilizáveis. | Regras de pedido, de evento ou de qualquer módulo. |
| `shared/security` | Configuração do Spring Security, autenticação por sessão, autorização técnica e acesso ao usuário autenticado. | Perfis de artesão/comprador, regras de aprovação ou decisões de negócio. |
| `shared/error` | `ProblemDetail`, tratador global de exceções, códigos técnicos de erro e exceções transversais. | Mensagens específicas de um caso de uso que pertençam a um módulo. |
| `shared/audit` | Infraestrutura de auditoria: data de criação/alteração, identificador de requisição e registro de ações técnicas. | Ações de curadoria ou histórico comercial do artesão. |
| `shared/util` | Utilitários pequenos, estáveis, sem estado e sem dependência do domínio. | Classes de serviço, regras de cálculo de preço ou helpers específicos de um módulo. |

### Regra prática para decidir onde uma classe fica

1. A classe fala de artesão, peça, pedido, evento, mensagem ou curadoria? Ela pertence ao módulo correspondente em `modules`.
2. A classe é técnica e usada por dois ou mais módulos? Ela pode ir para `shared`.
3. A classe é técnica, mas usada por um único módulo? Ela permanece na `infrastructure` desse módulo.
4. Em dúvida, **não coloque em `shared` ainda**. É mais fácil mover algo comprovadamente comum depois do que desfazer dependências indevidas.

### Regra de dependência do `shared`

```text
modules/* ───────► shared/*
shared/* ────────► nunca depende de modules/*
```

Assim, `shared` não conhece `orders`, `events`, `catalog` nem qualquer outro contexto de negócio. Essa regra impede dependências circulares e preserva a autonomia dos módulos.

## Responsabilidade de cada camada

### `api`

É a porta de entrada HTTP do módulo. Aqui ficarão controllers REST, DTOs de requisição e resposta e validações de formato. A camada `api` não deve conter regra de negócio nem acesso direto ao banco.

Exemplo: `POST /api/v1/events` recebe um DTO, valida os campos obrigatórios e chama o caso de uso apropriado.

### `application`

Contém os casos de uso do sistema e coordena o fluxo entre domínio, banco e integrações. É onde ficarão operações como “criar pedido”, “submeter evento para aprovação” e “publicar peça”. Também é o local usual para delimitar transações.

### `domain`

É o núcleo das regras de negócio. Contém entidades, objetos de valor, enums, políticas e regras que devem continuar válidas mesmo se a API, o banco ou um fornecedor externo mudarem.

Exemplo: um evento só pode ser submetido se o organizador estiver aprovado; uma peça única não pode ser vendida duas vezes.

### `infrastructure`

Implementa detalhes técnicos necessários para o módulo funcionar: entidades/mapeamentos JPA, repositórios PostgreSQL, adaptadores de serviços externos, configuração específica de persistência e clientes HTTP.

Exemplo: uma implementação PostgreSQL de repositório de pedidos ou o adaptador do Melhor Envio.

## Regra de dependências

O fluxo desejado é:

```text
API → Application → Domain
                  ↑
           Infrastructure
```

- `domain` não depende de Spring, PostgreSQL, HTTP, Mercado Pago ou Melhor Envio.
- `application` conhece os casos de uso e contratos necessários, sem depender do fornecedor concreto.
- `infrastructure` implementa detalhes técnicos e depende das camadas internas.
- `api` apenas converte HTTP para chamadas de aplicação e devolve a resposta ao cliente.

Essa separação permite trocar um fornecedor de pagamento, uma biblioteca de mapas ou a forma de persistência sem reescrever as regras principais do marketplace.

## Integrações externas

O módulo `integration` terá contratos de saída usados pela aplicação:

| Integração | Responsabilidade |
| --- | --- |
| Mercado Pago | Criar e consultar pagamentos; receber e validar webhooks. |
| Melhor Envio | Cotar frete, gerar etiqueta/envio e acompanhar rastreamento. |
| S3/MinIO | Armazenar imagens e gerar URLs pré-assinadas, sem expor credenciais ao frontend. |

O OpenFreeMap não pertence ao backend: o Next.js usará MapLibre GL para exibir o mapa. O backend de `events` apenas fornece os dados de endereço, latitude e longitude.

## Convenções iniciais

- Os nomes de pacotes são em inglês e no singular quando representam um contexto (`catalog`, `identity`) e em plural quando o módulo já foi definido assim (`events`, `orders`). A convenção deve ser mantida sem criar duplicatas.
- O pacote correto de eventos é `events`; o diretório antigo `event` é resíduo temporário e não deve receber código novo.
- Segurança técnica fica em `shared/security`; não haverá um módulo de domínio separado chamado `security`.
- Pastas vazias usam `.gitkeep` porque o Git não rastreia diretórios vazios. Elas desaparecem naturalmente quando os primeiros arquivos reais forem adicionados.

## Próxima documentação recomendada

A próxima página útil é **“Convenções de implementação do backend”**: padrão de nomes, formato de DTOs, tratamento de erros com `ProblemDetail`, regras de transação e como um módulo pode acessar outro. Ela deve ser criada antes de implementar o primeiro caso de uso.
