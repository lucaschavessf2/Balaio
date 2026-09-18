export type Disponibilidade = 'disponivel' | 'encomenda' | 'unica'

export type Tecnica =
  | 'Cerâmica & Barro'
  | 'Bordado & Renda (Renascença)'
  | 'Escultura em Madeira'
  | 'Couro Autoral'
  | 'Xilogravura'

export type Peca = {
  situacao?: 'publicada' | 'curadoria' | 'rascunho'
  slug: string
  nome: string
  artesao: string
  territorio: string
  tecnica: Tecnica
  categoria: string
  preco: number
  desconto?: number
  disponibilidade: Disponibilidade
  prazoProducaoDias?: number
  historia: string[]
  imagem: string
  avaliacao?: number
  totalAvaliacoes?: number
}

export type Artesao = {
  slug: string
  nome: string
  atelie: string
  territorio: string
  tecnica: Tecnica
  historia: string
  obrasComercializadas: number
  avaliacaoMedia: number
  selo: boolean
  imagem: string
}

export type EstadoPedido = 'confirmado' | 'producao' | 'enviado' | 'entregue'

export type EtapaPedido = {
  estado: EstadoPedido
  titulo: string
  detalhe: string
  concluida: boolean
  atual: boolean
  nota?: string
}

export type Pedido = {
  itens?: { slug: string; quantidade: number }[]
  simulado?: boolean
  id: string
  pecaSlug: string
  compradorNome: string
  data: string
  total: number
  estado: EstadoPedido
  rastreio?: string
  transportadora?: string
  previsaoEntrega?: string
  etapas: EtapaPedido[]
  avaliado: boolean
}

export type Mensagem = {
  autor: 'comprador' | 'artesao'
  texto: string
  hora: string
}

export type Mediacao = {
  emAnalise?: boolean
  id: string
  pedido: string
  assunto: string
  partes: string
  aberta: string
}
