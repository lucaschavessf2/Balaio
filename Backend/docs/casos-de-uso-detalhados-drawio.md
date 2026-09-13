# Casos de uso detalhados — páginas complementares para draw.io

Importe os três diagramas abaixo em páginas separadas. Cada página mostra as
ações concretas de um conjunto de atores e evita linhas cruzadas.

## Página 1 — visitante e comprador

```mermaid
flowchart LR
    visitante["Visitante"]
    comprador["Comprador\n(turista ou lojista)"]

    subgraph sistema["Marketplace — descoberta e compra"]
        direction TB
        V1(["Navegar pela vitrine"])
        V2(["Consultar calendário\ne mapa de eventos"])
        V3(["Visualizar página\ndo evento"])
        C1(["Cadastrar-se e\ngerir perfil"])
        C2(["Buscar e filtrar por técnica,\ncategoria, artesão e território"])
        C3(["Visualizar detalhes da peça\n(origem, técnica e história)"])
        C4(["Criar pedido e\nrealizar pagamento"])
        C5(["Acompanhar pedido\ne rastreamento"])
        C6(["Enviar mensagens e\nperguntas públicas"])
        C7(["Avaliar peça e artesão\napós a entrega"])
        C8(["Abrir disputa\nsobre pedido"])
    end

    visitante --> V1
    visitante --> V2
    visitante --> V3
    comprador --> C1
    comprador --> C2
    comprador --> C3
    comprador --> C4
    comprador --> C5
    comprador --> C6
    comprador --> C7
    comprador --> C8
```

## Página 2 — artesão e organizador de evento

```mermaid
flowchart LR
    artesao["Artesão"]
    organizador["Organizador de evento\n(produtor, associação ou feira)"]

    subgraph sistema["Marketplace — oferta, vendas e eventos"]
        direction TB
        A1(["Cadastrar-se e\ngerir perfil de artesão"])
        A2(["Cadastrar, editar e\npublicar peça"])
        A3(["Adicionar fotos, origem,\ntécnica e categoria"])
        A4(["Definir disponibilidade\ne prazo de produção"])
        A5(["Acompanhar pedidos\ne atualizar status"])
        A6(["Responder mensagens e\nperguntas públicas"])
        A7(["Usar apoio à precificação"])
        A8(["Consultar painel\ne insights de mercado"])
        E1(["Criar e editar evento"])
        E2(["Informar data, local,\ndescrição e imagem"])
        E3(["Submeter evento\npara aprovação"])
    end

    artesao --> A1
    artesao --> A2
    artesao --> A3
    artesao --> A4
    artesao --> A5
    artesao --> A6
    artesao --> A7
    artesao --> A8
    organizador --> E1
    organizador --> E2
    organizador --> E3
```

## Página 3 — administrador e integrações externas

```mermaid
flowchart LR
    administrador["Administrador"]
    mercadoPago["Mercado Pago"]
    melhorEnvio["Melhor Envio"]

    subgraph sistema["Marketplace — administração e integrações"]
        direction TB
        G1(["Analisar e aprovar\nou rejeitar evento"])
        G2(["Publicar ou ocultar evento"])
        G3(["Curar e aprovar\nperfis e peças"])
        G4(["Conceder ou revogar\nselo de autenticidade"])
        G5(["Moderar perguntas,\nmensagens e avaliações"])
        G6(["Mediar disputas e\nintervir em pedidos"])
        I1(["Receber atualização\nde pagamento"])
        I2(["Solicitar cotação, etiqueta\ne rastreamento de envio"])
        I3(["Receber atualização\nde rastreamento"])
    end

    administrador --> G1
    administrador --> G2
    administrador --> G3
    administrador --> G4
    administrador --> G5
    administrador --> G6
    mercadoPago --> I1
    melhorEnvio --> I3
    I2 --> melhorEnvio
```

## Ordem de apresentação

1. **Página 1:** visitante e comprador.
2. **Página 2:** artesão e organizador de evento.
3. **Página 3:** administrador e integrações.

Use A0 horizontal somente se a entrega for impressa. Para uma entrega digital,
A3 horizontal é suficiente e deixa as três páginas mais proporcionais.
