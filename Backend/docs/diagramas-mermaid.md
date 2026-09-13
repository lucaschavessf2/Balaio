# Diagramas do Marketplace de Artesanato de Pernambuco

Os diagramas abaixo representam o modelo de domínio da aplicação. O PostgreSQL é
a única base de dados transacional; imagens são mantidas em armazenamento de
objetos. Mercado Pago e Melhor Envio são integrações externas, encapsuladas no
backend por adaptadores.

## Casos de uso

```mermaid
flowchart LR
    classDef actor fill:#f8fafc,stroke:#334155,color:#0f172a,stroke-width:2px
    classDef external fill:#fff7ed,stroke:#c2410c,color:#7c2d12,stroke-width:2px
    classDef usecase fill:#eff6ff,stroke:#2563eb,color:#172554
    classDef dependency fill:#f0fdf4,stroke:#16a34a,color:#14532d

    artesao["Artesão"]:::actor
    comprador["Comprador\n(turista ou lojista)"]:::actor
    admin["Administrador"]:::actor
    associacao["Associação /\nCooperativa"]:::actor
    mercadoPago["Mercado Pago"]:::external
    melhorEnvio["Melhor Envio"]:::external

    subgraph identidade["Identidade e perfis"]
        direction TB
        UC01(["Cadastrar-se e autenticar-se"]):::usecase
        UC02(["Gerir perfil de artesão\n(história, território e técnica)"]):::usecase
        UC03(["Gerir perfil de comprador"]):::usecase
        UC04(["Gerir perfil coletivo"]):::usecase
    end

    subgraph catalogo["Catálogo e descoberta"]
        direction TB
        UC05(["Cadastrar e editar peça\ncom fotos, origem e técnica"]):::usecase
        UC06(["Publicar ou despublicar peça"]):::usecase
        UC07(["Buscar e filtrar peças\npor técnica, categoria, artesão e território"]):::usecase
        UC08(["Visualizar vitrine e\ndetalhes da peça"]):::usecase
    end

    subgraph pedidos["Pedidos e disponibilidade"]
        direction TB
        UC09(["Definir disponibilidade\ne prazo de produção"]):::usecase
        UC10(["Criar e acompanhar pedido"]):::usecase
        UC11(["Validar disponibilidade e\nreservar peça"]):::dependency
        UC12(["Atualizar status do pedido"]):::usecase
    end

    subgraph comunicacao["Comunicação e reputação"]
        direction TB
        UC13(["Conversar sobre o pedido"]):::usecase
        UC14(["Perguntar e responder\npúblicamente sobre peça"]):::usecase
        UC15(["Avaliar peça e artesão"]):::usecase
        UC16(["Abrir e mediar disputa"]):::usecase
    end

    subgraph gestao["Gestão e curadoria"]
        direction TB
        UC17(["Registrar apoio à precificação"]):::usecase
        UC18(["Consultar painel do artesão\n(pedidos, disponibilidade e resumo)"]):::usecase
        UC19(["Consultar insights de mercado"]):::usecase
        UC20(["Curar perfis e peças"]):::usecase
        UC21(["Conceder ou revogar\nselo de autenticidade"]):::usecase
        UC22(["Moderar conteúdo e\nintervir em pedidos"]):::usecase
    end

    subgraph integracoes["Pagamento e logística"]
        direction TB
        UC23(["Criar e acompanhar pagamento"]):::usecase
        UC24(["Receber webhook de pagamento"]):::dependency
        UC25(["Cotar frete e gerar envio/etiqueta"]):::usecase
        UC26(["Atualizar rastreamento do envio"]):::dependency
    end

    artesao --> UC01
    artesao --> UC02
    artesao --> UC05
    artesao --> UC06
    artesao --> UC09
    artesao --> UC10
    artesao --> UC12
    artesao --> UC13
    artesao --> UC14
    artesao --> UC15
    artesao --> UC17
    artesao --> UC18
    artesao --> UC19

    comprador --> UC01
    comprador --> UC03
    comprador --> UC07
    comprador --> UC08
    comprador --> UC10
    comprador --> UC13
    comprador --> UC14
    comprador --> UC15
    comprador --> UC16

    associacao --> UC04
    admin --> UC20
    admin --> UC21
    admin --> UC22
    admin --> UC04

    UC10 -. inclui .-> UC11
    UC10 -. inclui .-> UC23
    UC10 -. inclui .-> UC25
    UC15 -. requer .-> UC12
    UC23 -. processa .-> mercadoPago
    mercadoPago -. notifica .-> UC24
    UC25 -. integra .-> melhorEnvio
    melhorEnvio -. atualiza .-> UC26
```

> A avaliação só é habilitada quando o pedido está no estado `ENTREGUE`; essa
> pré-condição é representada pela dependência entre avaliação e atualização do
> pedido.

### Rastreabilidade de requisitos funcionais

| Requisitos | Casos de uso que os representam |
| --- | --- |
| RF-01, RF-02, RF-15 | UC01 a UC04 — autenticação e perfis individual/coletivo |
| RF-03, RF-04, RF-05 | UC05 a UC08 — catálogo, vitrine e descoberta |
| RF-06, RF-07 | UC09 a UC12 — disponibilidade, pedido e seus estados |
| RF-08, RF-17 | UC13 e UC14 — conversa privada e perguntas públicas |
| RF-09, RF-13, RF-14 | UC17 a UC19 — precificação, painel e insights |
| RF-10, RF-18 | UC23 a UC26 — pagamento, frete e rastreamento |
| RF-11, RF-12 | UC15 e UC21 — avaliações e selo de autenticidade |
| RF-16, RF-19 | UC16, UC20 e UC22 — disputas, curadoria e intervenção |

## Classes de domínio

```mermaid
classDiagram
    direction LR

    class Usuario {
        +UUID id
        +String nome
        +String email
        +String senhaHash
        +PapelUsuario papel
        +Boolean ativo
    }
    class PerfilArtesao {
        +UUID id
        +String historia
        +String territorio
        +String contato
        +StatusCuradoria statusCuradoria
    }
    class PerfilComprador {
        +UUID id
        +TipoComprador tipo
        +String telefone
    }
    class Associacao {
        +UUID id
        +String nome
        +String regiao
        +String descricao
    }

    class Peca {
        +UUID id
        +String titulo
        +String descricao
        +String origem
        +Decimal precoAtual
        +Disponibilidade disponibilidade
        +Integer prazoProducaoDias
        +StatusCuradoria statusCuradoria
    }
    class FotoPeca {
        +UUID id
        +String url
        +Integer ordem
        +String textoAlternativo
    }
    class Tecnica {
        +UUID id
        +String nome
        +String descricao
    }
    class Categoria {
        +UUID id
        +String nome
    }

    class Pedido {
        +UUID id
        +Instant criadoEm
        +StatusPedido status
        +Decimal valorTotal
        +Instant entregueEm
    }
    class ItemPedido {
        +UUID id
        +Integer quantidade
        +Decimal precoUnitario
    }
    class EnderecoEntrega {
        +UUID id
        +String destinatario
        +String cep
        +String logradouro
        +String numero
        +String cidade
        +String estado
    }
    class Pagamento {
        +UUID id
        +String referenciaExterna
        +StatusPagamento status
        +Decimal valor
        +Instant pagoEm
    }
    class Envio {
        +UUID id
        +String referenciaExterna
        +String codigoRastreio
        +Decimal valorFrete
        +StatusEnvio status
    }

    class Conversa {
        +UUID id
        +Instant criadaEm
        +StatusConversa status
    }
    class Mensagem {
        +UUID id
        +String conteudo
        +Instant enviadaEm
        +Instant lidaEm
    }
    class PerguntaPeca {
        +UUID id
        +String conteudo
        +Instant criadaEm
    }
    class RespostaPergunta {
        +UUID id
        +String conteudo
        +Instant respondidaEm
    }
    class Avaliacao {
        +UUID id
        +Integer nota
        +String comentario
        +Instant criadaEm
    }
    class SeloAutenticidade {
        +UUID id
        +String codigo
        +String registroAutoria
        +Instant concedidoEm
        +StatusCuradoria status
    }
    class Disputa {
        +UUID id
        +String motivo
        +StatusDisputa status
        +String resolucao
    }

    class RegistroPrecificacao {
        +UUID id
        +Decimal custoMateriais
        +Decimal horasTrabalho
        +Decimal valorSugerido
    }
    class InsightMercado {
        +UUID id
        +String titulo
        +String descricao
        +Instant geradoEm
    }
    class AcaoCuradoria {
        +UUID id
        +String motivo
        +Instant criadaEm
        +StatusCuradoria statusAplicado
    }

    class PapelUsuario {
        <<enumeration>>
        ARTESAO
        COMPRADOR
        ADMINISTRADOR
    }
    class TipoComprador {
        <<enumeration>>
        CONSUMIDOR_FINAL
        TURISTA
        LOJISTA
    }
    class Disponibilidade {
        <<enumeration>>
        EM_ESTOQUE
        PECA_UNICA
        SOB_ENCOMENDA
        INDISPONIVEL
    }
    class StatusPedido {
        <<enumeration>>
        AGUARDANDO_PAGAMENTO
        PAGO
        EM_PRODUCAO
        EM_PREPARACAO
        ENVIADO
        ENTREGUE
        CANCELADO
        EM_DISPUTA
    }
    class StatusPagamento {
        <<enumeration>>
        PENDENTE
        APROVADO
        RECUSADO
        ESTORNADO
    }
    class StatusEnvio {
        <<enumeration>>
        AGUARDANDO_COTACAO
        AGUARDANDO_POSTAGEM
        EM_TRANSITO
        ENTREGUE
        DEVOLVIDO
    }
    class StatusCuradoria {
        <<enumeration>>
        PENDENTE
        APROVADO
        REPROVADO
        OCULTO
    }
    class StatusDisputa {
        <<enumeration>>
        ABERTA
        EM_ANALISE
        RESOLVIDA
        CANCELADA
    }
    class StatusConversa {
        <<enumeration>>
        ABERTA
        ENCERRADA
    }

    Usuario "1" --> "0..1" PerfilArtesao : possui
    Usuario "1" --> "0..1" PerfilComprador : possui
    Associacao "0..1" o-- "0..*" PerfilArtesao : reúne
    PerfilArtesao "1" --> "0..*" Peca : produz
    Peca "1" *-- "1..*" FotoPeca : fotos
    Peca "0..*" --> "1" Tecnica : usa
    Peca "0..*" --> "1" Categoria : pertence a

    PerfilComprador "1" --> "0..*" Pedido : realiza
    Pedido "1" *-- "1..*" ItemPedido : contém
    ItemPedido "0..*" --> "1" Peca : referencia
    Pedido "1" *-- "1" EnderecoEntrega : destino
    Pedido "1" *-- "1" Pagamento : pagamento
    Pedido "1" *-- "0..1" Envio : envio
    Pedido "1" *-- "1" Conversa : conversa
    Conversa "1" *-- "0..*" Mensagem : mensagens
    Usuario "1" --> "0..*" Mensagem : envia

    Peca "1" *-- "0..*" PerguntaPeca : perguntas
    PerguntaPeca "1" *-- "0..1" RespostaPergunta : resposta
    PerfilComprador "1" --> "0..*" PerguntaPeca : pergunta
    PerfilArtesao "1" --> "0..*" RespostaPergunta : responde
    Pedido "1" --> "0..*" Avaliacao : habilita após entrega
    Avaliacao "0..*" --> "1" PerfilComprador : autor
    Avaliacao "0..*" --> "1" Peca : avalia
    Avaliacao "0..*" --> "1" PerfilArtesao : avalia
    Peca "1" *-- "0..1" SeloAutenticidade : possui
    Pedido "1" *-- "0..1" Disputa : pode gerar

    PerfilArtesao "1" --> "0..*" RegistroPrecificacao : registra
    PerfilArtesao "1" --> "0..*" InsightMercado : consulta
    Usuario "1" --> "0..*" AcaoCuradoria : executa
    AcaoCuradoria "0..*" --> "0..1" Peca : modera
    AcaoCuradoria "0..*" --> "0..1" PerfilArtesao : modera

    Usuario --> PapelUsuario
    PerfilComprador --> TipoComprador
    Peca --> Disponibilidade
    Pedido --> StatusPedido
    Pagamento --> StatusPagamento
    Envio --> StatusEnvio
    Disputa --> StatusDisputa
    Conversa --> StatusConversa
```

## Regras representadas

- A reserva e a mudança de disponibilidade de uma peça acontecem como parte da
  criação do pedido; peça única não pode integrar dois pedidos confirmados.
- `ItemPedido.precoUnitario` é uma fotografia do preço no momento da compra,
  independente de futuras mudanças em `Peca.precoAtual`.
- Pagamento e envio têm apenas referências externas; os detalhes de Mercado
  Pago e Melhor Envio ficam nos adaptadores de integração, fora do domínio.
- Avaliações só podem ser criadas após a entrega do pedido.
