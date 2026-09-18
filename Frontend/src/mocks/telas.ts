export type Fluxo = 'comprador' | 'artesao' | 'organizador' | 'plataforma' | 'institucional'

export type Tela = {
  rota: string
  nome: string
  descricao: string
  fluxo: Fluxo
  requisitos: string[]
}

export const fluxos: { chave: Fluxo; titulo: string; resumo: string }[] = [
  { chave: 'comprador', titulo: 'Quem compra', resumo: 'Da descoberta da peça à avaliação depois da entrega.' },
  { chave: 'artesao', titulo: 'Quem faz', resumo: 'Publicar, acompanhar pedidos e entender as próprias vendas.' },
  { chave: 'organizador', titulo: 'Quem organiza', resumo: 'Feiras e festivais que reúnem os artesãos, no mapa da vitrine.' },
  { chave: 'plataforma', titulo: 'Plataforma', resumo: 'Curadoria, mediação e estados do sistema.' },
  { chave: 'institucional', titulo: 'Institucional', resumo: 'Conteúdo público sobre o projeto e as regras.' },
]

export const telas: Tela[] = [
  { rota: '/', nome: 'Vitrine', descricao: 'Destaques com o mapa de feiras, atalhos por tipo, ofertas, mais bem avaliadas e artesãos em destaque.', fluxo: 'comprador', requisitos: ['RF-04', 'RF-05', 'RF-07'] },
  { rota: '/search?tipo=Jarras%20%26%20Vasos&ordenar=preco-asc', nome: 'Listagem por tipo', descricao: 'Catálogo filtrado por tipo de peça, com filtros e ordenação na URL.', fluxo: 'comprador', requisitos: ['RF-05'] },
  { rota: '/search?desconto=true', nome: 'Ofertas', descricao: 'Peças com desconto definido pelo artesão.', fluxo: 'comprador', requisitos: ['RF-05'] },
  { rota: '/search?q=renda', nome: 'Busca com resultados', descricao: 'Resultado da busca por termo livre.', fluxo: 'comprador', requisitos: ['RF-05'] },
  { rota: '/search?q=zzzz', nome: 'Busca sem resultados', descricao: 'Estado vazio com sugestões de técnicas.', fluxo: 'comprador', requisitos: ['RF-05'] },
  { rota: '/pieces/leao-imperial-de-tracunhaem', nome: 'Peça única', descricao: 'Detalhe com galeria, história, frete por CEP e perguntas públicas.', fluxo: 'comprador', requisitos: ['RF-03', 'RF-10', 'RF-17'] },
  { rota: '/pieces/toalha-renascenca-florescer', nome: 'Peça sob encomenda', descricao: 'Mesma tela com prazo de produção em destaque.', fluxo: 'comprador', requisitos: ['RF-07'] },
  { rota: '/artisans/mestre-nuca', nome: 'Perfil do artesão', descricao: 'História, selo de origem, território e coleção do ateliê.', fluxo: 'comprador', requisitos: ['RF-02', 'RF-12'] },
  { rota: '/collectives/associacao-de-tracunhaem', nome: 'Perfil coletivo', descricao: 'Associação que reúne ateliês de um mesmo território.', fluxo: 'comprador', requisitos: ['RF-15'] },
  { rota: '/login', nome: 'Entrar', descricao: 'Login centralizado, com e-mail e senha.', fluxo: 'comprador', requisitos: ['RF-02'] },
  { rota: '/login/register', nome: 'Criar conta', descricao: 'Cadastro de comprador ou artesão, com território e técnica.', fluxo: 'comprador', requisitos: ['RF-01'] },
  { rota: '/login/recover', nome: 'Recuperar senha', descricao: 'Envio de link de recuperação por e-mail.', fluxo: 'comprador', requisitos: ['RF-01'] },
  { rota: '/account', nome: 'Minha conta', descricao: 'Dados pessoais, tipo de comprador e endereços de entrega.', fluxo: 'comprador', requisitos: ['RF-02'] },
  { rota: '/account/details', nome: 'Meus dados', descricao: 'Foto, nome, contatos, tipo de comprador e segurança da conta.', fluxo: 'comprador', requisitos: ['RF-02'] },
  { rota: '/account/addresses', nome: 'Meus endereços', descricao: 'Endereços de entrega salvos, com apelido e marcação do principal.', fluxo: 'comprador', requisitos: ['RF-02'] },
  { rota: '/videos', nome: 'Ateliê ao vivo', descricao: 'Feed vertical de vídeos curtos em que o artesão mostra o processo.', fluxo: 'comprador', requisitos: ['RF-15'] },
  { rota: '/favorites', nome: 'Peças salvas', descricao: 'O que o comprador guardou para decidir depois.', fluxo: 'comprador', requisitos: ['RF-05'] },
  { rota: '/cart', nome: 'Sacola', descricao: 'Itens reservados, quantidade e resumo com frete.', fluxo: 'comprador', requisitos: ['RF-06'] },
  { rota: '/checkout', nome: 'Pagamento', descricao: 'Endereço, opções de frete e Pix, cartão ou boleto.', fluxo: 'comprador', requisitos: ['RF-18', 'RF-10'] },
  { rota: '/confirmation/PE-2026-8941', nome: 'Pedido confirmado', descricao: 'Comprovante e o que acontece a seguir.', fluxo: 'comprador', requisitos: ['RF-06'] },
  { rota: '/orders', nome: 'Meus pedidos', descricao: 'Lista com status de cada compra.', fluxo: 'comprador', requisitos: ['RF-06'] },
  { rota: '/orders/PE-2026-8941', nome: 'Acompanhamento', descricao: 'Linha do tempo da produção, rastreio e conversa com o artesão.', fluxo: 'comprador', requisitos: ['RF-06', 'RF-08'] },
  { rota: '/orders/PE-2026-8720/review', nome: 'Avaliação', descricao: 'Nota geral, critérios e comentário público.', fluxo: 'comprador', requisitos: ['RF-11'] },
  { rota: '/orders/PE-2026-8941/mediation', nome: 'Pedir mediação', descricao: 'Comprador abre uma disputa quando a conversa com o artesão não resolveu.', fluxo: 'comprador', requisitos: ['RF-19'] },
  { rota: '/events', nome: 'Agenda de eventos', descricao: 'Mapa com os eventos de artesanato e lista ordenada pela distância.', fluxo: 'comprador', requisitos: [] },
  { rota: '/events/fenearte-2026', nome: 'Evento em detalhe', descricao: 'Local no mapa, datas, entrada e quem da plataforma vai participar.', fluxo: 'comprador', requisitos: [] },

  { rota: '/events/new', nome: 'Criar evento', descricao: 'Organizador publica feira ou festival com ponto no mapa e participantes.', fluxo: 'organizador', requisitos: [] },

  { rota: '/dashboard', nome: 'Painel de pedidos', descricao: 'Métricas do mês e pedidos aguardando aceitação.', fluxo: 'artesao', requisitos: ['RF-13'] },
  { rota: '/dashboard/pieces', nome: 'Minhas peças', descricao: 'Publicadas, em curadoria e rascunhos.', fluxo: 'artesao', requisitos: ['RF-03'] },
  { rota: '/dashboard/pieces/new', nome: 'Cadastrar peça', descricao: 'Formulário com apoio à precificação e disponibilidade.', fluxo: 'artesao', requisitos: ['RF-03', 'RF-09'] },
  { rota: '/dashboard/videos', nome: 'Publicar vídeo', descricao: 'Upload, legenda, etiquetas e vínculo com a peça.', fluxo: 'artesao', requisitos: ['RF-15'] },
  { rota: '/dashboard/messages', nome: 'Central de mensagens', descricao: 'Fios de conversa por pedido e por pergunta.', fluxo: 'artesao', requisitos: ['RF-08', 'RF-17'] },
  { rota: '/dashboard/sales', nome: 'Vendas e insights', descricao: 'Faturamento por mês, peças que mais vendem e leituras dos números.', fluxo: 'artesao', requisitos: ['RF-14'] },
  { rota: '/dashboard/settings', nome: 'Configurações da oficina', descricao: 'Identidade do ateliê, envio, prazo e recebimento.', fluxo: 'artesao', requisitos: ['RF-13'] },

  { rota: '/admin', nome: 'Curadoria e mediação', descricao: 'Fila de aprovação de peças e disputas abertas.', fluxo: 'plataforma', requisitos: ['RF-16', 'RF-19'] },
  { rota: '/admin/mediations', nome: 'Mediações', descricao: 'Disputas abertas pelos compradores aguardando a plataforma.', fluxo: 'plataforma', requisitos: ['RF-19'] },
  { rota: '/admin/criteria', nome: 'Critérios de curadoria', descricao: 'Regras que a plataforma aplica ao aprovar ou recusar uma peça.', fluxo: 'plataforma', requisitos: ['RF-16'] },
  { rota: '/route-that-does-not-exist', nome: 'Página não encontrada', descricao: 'Estado de erro 404 do sistema.', fluxo: 'plataforma', requisitos: [] },

  { rota: '/about/who-we-are', nome: 'Quem somos', descricao: 'A origem do projeto e o que ele defende.', fluxo: 'institucional', requisitos: [] },
  { rota: '/about/terms', nome: 'Termos de uso', descricao: 'Regras entre comprador, artesão e plataforma.', fluxo: 'institucional', requisitos: [] },
  { rota: '/about/privacy', nome: 'Privacidade', descricao: 'Dados coletados, uso e direitos.', fluxo: 'institucional', requisitos: [] },
  { rota: '/about/cooperatives', nome: 'Para cooperativas', descricao: 'Como associações entram na plataforma.', fluxo: 'institucional', requisitos: [] },
  { rota: '/about/press', nome: 'Imprensa', descricao: 'Material e contato para imprensa.', fluxo: 'institucional', requisitos: [] },
]

export function telasDoFluxo(fluxo: Fluxo): Tela[] {
  return telas.filter((t) => t.fluxo === fluxo)
}
