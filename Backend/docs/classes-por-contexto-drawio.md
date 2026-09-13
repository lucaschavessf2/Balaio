# Diagramas de classes por contexto — draw.io

Importe cada bloco em uma página diferente do draw.io. As classes repetidas como
`<<referência>>` existem apenas para deixar claras as ligações entre contextos;
no sistema elas são uma única classe compartilhada.

## Página 1 — pessoas, catálogo e oferta

```mermaid
classDiagram
    direction LR

    class Usuario {
        +UUID id
        +String nome
        +String email
        +String senhaHash
        +Set~PapelUsuario~ papeis
    }
    class PerfilArtesao {
        +UUID id
        +String historia
        +String territorio
        +String contato
        +StatusCuradoria status
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
    }
    class OrganizadorEvento {
        +UUID id
        +String nomePublico
        +TipoOrganizador tipo
        +String contato
    }
    class Peca {
        +UUID id
        +String titulo
        +String origem
        +Decimal precoAtual
        +Disponibilidade disponibilidade
        +Integer prazoProducaoDias
        +StatusCuradoria status
    }
    class FotoPeca {
        +UUID id
        +String url
        +Integer ordem
    }
    class Tecnica {
        +UUID id
        +String nome
    }
    class Categoria {
        +UUID id
        +String nome
    }
    class SeloAutenticidade {
        +UUID id
        +String codigo
        +String registroAutoria
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
    }

    Usuario "1" --> "0..1" PerfilArtesao : possui
    Usuario "1" --> "0..1" PerfilComprador : possui
    Usuario "1" --> "0..1" OrganizadorEvento : pode representar
    Associacao "0..1" o-- "0..*" PerfilArtesao : reúne
    Associacao "0..1" --> "0..1" OrganizadorEvento : organiza como
    PerfilArtesao "1" --> "0..*" Peca : produz
    Peca "1" *-- "1..*" FotoPeca : possui
    Peca "0..*" --> "1" Tecnica : usa
    Peca "0..*" --> "1" Categoria : pertence a
    Peca "1" *-- "0..1" SeloAutenticidade : possui
    PerfilArtesao "1" --> "0..*" RegistroPrecificacao : registra
    PerfilArtesao "1" --> "0..*" InsightMercado : consulta
```

## Página 2 — pedido, pagamento e envio

```mermaid
classDiagram
    direction LR

    class PerfilComprador {
        <<referência>>
    }
    class Peca {
        <<referência>>
        +Decimal precoAtual
        +Disponibilidade disponibilidade
    }
    class Pedido {
        +UUID id
        +StatusPedido status
        +Decimal valorTotal
        +Instant criadoEm
        +Instant entregueEm
    }
    class ItemPedido {
        +UUID id
        +Integer quantidade
        +Decimal precoUnitario
    }
    class EnderecoEntrega {
        +UUID id
        +String cep
        +String logradouro
        +String cidade
        +String estado
    }
    class Pagamento {
        +UUID id
        +String referenciaMercadoPago
        +Decimal valor
        +StatusPagamento status
    }
    class Envio {
        +UUID id
        +String referenciaMelhorEnvio
        +String codigoRastreio
        +Decimal valorFrete
        +StatusEnvio status
    }

    PerfilComprador "1" --> "0..*" Pedido : realiza
    Pedido "1" *-- "1..*" ItemPedido : contém
    ItemPedido "0..*" --> "1" Peca : referencia
    Pedido "1" *-- "1" EnderecoEntrega : destino
    Pedido "1" *-- "1" Pagamento : possui
    Pedido "1" *-- "0..1" Envio : possui
```

> `ItemPedido.precoUnitario` preserva o preço acertado na compra, mesmo se o
> valor atual da peça mudar. Pagamento e envio guardam referências externas,
> sem trazer classes ou SDKs dos provedores para o domínio.

## Página 3 — comunicação, confiança e curadoria

```mermaid
classDiagram
    direction LR

    class Usuario {
        <<referência>>
    }
    class PerfilArtesao {
        <<referência>>
    }
    class PerfilComprador {
        <<referência>>
    }
    class Peca {
        <<referência>>
    }
    class Pedido {
        <<referência>>
        +StatusPedido status
    }
    class Conversa {
        +UUID id
        +StatusConversa status
        +Instant criadaEm
    }
    class Mensagem {
        +UUID id
        +String conteudo
        +Instant enviadaEm
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
    }
    class Disputa {
        +UUID id
        +String motivo
        +StatusDisputa status
        +String resolucao
    }
    class AcaoCuradoria {
        +UUID id
        +TipoAcaoCuradoria tipo
        +String motivo
        +Instant criadaEm
    }

    Pedido "1" *-- "1" Conversa : abre
    Conversa "1" *-- "0..*" Mensagem : contém
    Usuario "1" --> "0..*" Mensagem : envia
    Peca "1" *-- "0..*" PerguntaPeca : recebe
    PerguntaPeca "1" *-- "0..1" RespostaPergunta : possui
    PerfilComprador "1" --> "0..*" PerguntaPeca : cria
    PerfilArtesao "1" --> "0..*" RespostaPergunta : responde
    Pedido "1" --> "0..*" Avaliacao : habilita após entrega
    Avaliacao "0..*" --> "1" Peca : avalia
    Avaliacao "0..*" --> "1" PerfilArtesao : avalia
    Pedido "1" *-- "0..1" Disputa : pode gerar
    Usuario "1" --> "0..*" AcaoCuradoria : executa
    AcaoCuradoria "0..*" --> "0..1" Peca : modera
    AcaoCuradoria "0..*" --> "0..1" Pedido : intervém
```

## Página 4 — eventos e aprovação

```mermaid
classDiagram
    direction LR

    class OrganizadorEvento {
        <<referência>>
        +String nomePublico
        +TipoOrganizador tipo
    }
    class Usuario {
        <<referência: administrador>>
    }
    class Evento {
        +UUID id
        +String titulo
        +String descricao
        +String imagemCapaUrl
        +Instant inicioEm
        +Instant fimEm
        +StatusEvento status
    }
    class LocalEvento {
        +UUID id
        +String nome
        +String endereco
        +String cidade
        +Decimal latitude
        +Decimal longitude
    }
    class AprovacaoEvento {
        +UUID id
        +DecisaoEvento decisao
        +String justificativa
        +Instant decididaEm
    }

    OrganizadorEvento "1" --> "0..*" Evento : cria
    Evento "1" *-- "1" LocalEvento : ocorre em
    Evento "1" *-- "0..1" AprovacaoEvento : recebe
    Usuario "1" --> "0..*" AprovacaoEvento : decide
```

> Calendário, mapa e página do evento são visualizações de `Evento` e
> `LocalEvento`; não são classes do domínio. Um evento só aparece publicamente
> quando seu `StatusEvento` é `PUBLICADO`, após uma aprovação.

## Importação

1. Crie quatro páginas no draw.io, uma para cada seção acima.
2. Use **Ordenar → Inserir → Mermaid → Diagram**.
3. Cole apenas um bloco `classDiagram` por página, sem as crases.
4. Use **A3 horizontal** para entrega digital; escolha A0 apenas se o trabalho
   for impresso em formato grande.
