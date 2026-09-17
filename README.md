# Balaio: Projeto Origem

## Desenvolvimento com fake API

Requer Node.js 22.21+.

```sh
cd Frontend
npm ci
npm run dev
```

Frontend: `http://localhost:4321`. API json-server: `http://127.0.0.1:3001/api/v1`.
O banco é populado automaticamente e mantém as alterações entre reinícios.
Veja [comandos, endpoints, persistência e limites da demonstração](Frontend/fake-api/README.md).

> Marketplace digital voltado para a valorização e comercialização do artesanato e da economia criativa de Pernambuco.

## Sobre o projeto

O **Balaio** é uma aplicação web desenvolvida para o projeto integrador **Origem**, com o objetivo de aproximar artesãos, compradores e iniciativas ligadas à cultura pernambucana.

A plataforma busca oferecer uma experiência simples e acessível para descobrir peças artesanais, conhecer seus produtores e realizar compras, ao mesmo tempo em que fornece ferramentas para os artesãos divulgarem e administrarem seus produtos.

## Objetivos

- Valorizar o artesanato e a cultura pernambucana.
- Aproximar artesãos e consumidores por meio da tecnologia.
- Facilitar a descoberta de produtos artesanais.
- Dar maior visibilidade aos produtores e coletivos.
- Proporcionar uma experiência de compra simples e intuitiva.
- Criar um espaço para divulgação de eventos e conteúdos relacionados ao artesanato.

## Principais funcionalidades

### Para compradores

- Página inicial com produtos e conteúdos em destaque.
- Busca e descoberta de peças.
- Filtros para encontrar produtos.
- Visualização detalhada das peças.
- Informações sobre os artesãos e coletivos.
- Favoritos.
- Carrinho de compras.
- Checkout.
- Acompanhamento de pedidos.
- Avaliação de compras.
- Solicitação e acompanhamento de mediações.
- Gerenciamento da conta.
- Gerenciamento de endereços.
- Recuperação de acesso.
- Conteúdos em vídeo.
- Eventos relacionados ao artesanato.

### Para artesãos

- Dashboard para acompanhamento da atividade.
- Cadastro e gerenciamento de peças.
- Publicação de vídeos.
- Gerenciamento de mensagens.
- Acompanhamento de vendas.
- Configurações do perfil.

### Para a plataforma

- Administração da plataforma.
- Gerenciamento de mediações.
- Critérios de curadoria.
- Organização de conteúdos e informações.
- Páginas institucionais.

### Para organizadores de eventos

- Criação de eventos.
- Divulgação de eventos relacionados à cultura e ao artesanato.

## Experiência e acessibilidade

A aplicação foi desenvolvida pensando em diferentes dispositivos e perfis de usuários.

Entre os recursos implementados estão:

- Interface responsiva.
- Tema claro e escuro.
- Navegação adaptada para dispositivos móveis.
- Contraste adequado.
- Estados de foco para navegação.
- Suporte à redução de animações.
- Compatibilidade com leitores de tela.
- Feedback visual por meio de notificações.
- Busca por uma experiência alinhada às práticas de acessibilidade **WCAG AA**.

## Tecnologias

### Frontend

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**
- **Sonner**
- **Recharts**
- **Leaflet**
- **OpenStreetMap**

### Ferramentas

- **ESLint**
- **Docker**
- **Node.js / npm**
