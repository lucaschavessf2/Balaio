import type { TipoPeca } from '@/constants/referencias'

export type Disponibilidade = 'disponivel' | 'encomenda' | 'unica'

export type Tecnica =
  | 'Cerâmica & Barro'
  | 'Bordado & Renda (Renascença)'
  | 'Escultura em Madeira'
  | 'Couro Autoral'
  | 'Xilogravura'

export type FotoPeca = {
  id: string
  nome: string
  url: string
  ordem: number
}

export type Peca = {
  situacao?: 'publicada' | 'rascunho'
  criadaEm?: string
  inativadoEm?: string | null
  vendidaEmPedido?: string | null
  slug: string
  nome: string
  artesao: string
  territorio: string
  tecnica: Tecnica
  categoria: string
  tipo: TipoPeca
  preco: number
  desconto?: number
  disponibilidade: Disponibilidade
  prazoProducaoDias?: number
  historia: string[]
  imagem: string
  fotos?: FotoPeca[]
  ordemFotos?: string[]
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
  cepOrigem?: string
  prazoPadraoDias?: number
  aceitaEncomendas?: boolean
  chavePix?: string
}

export type EstadoPedido = 'confirmado' | 'producao' | 'enviado' | 'entregue' | 'recusado' | 'cancelado' | 'reembolsado'

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
  compradorId?: string
  usuarioId?: string
  compradorNome: string
  data: string
  total: number
  estado: EstadoPedido
  rastreio?: string
  transportadora?: string
  previsaoEntrega?: string
  etapas: EtapaPedido[]
  avaliado: boolean
  motivoEncerramento?: string
}

export type PedidoPendente = {
  id: string
  pecaSlug: string
  comprador: string
  quando: string
  valor: number
}

export type ConversaArtesao = {
  id: string
  pessoa: string
  assunto: string
  previa: string
  quando: string
  naoLida: boolean
  retrato: string
}

export type SituacaoSolicitacaoSelo = 'pendente' | 'aprovada' | 'ajuste'

export type SolicitacaoSelo = {
  id: string
  artesaoSlug: string
  artesao: string
  atelie: string
  mensagem: string
  situacao: SituacaoSolicitacaoSelo
  solicitadoEm: string
  motivo?: string
  decididoEm?: string
}

export type SolicitacaoSeloNaFila = SolicitacaoSelo & {
  territorio: string
  tecnica: string
  imagem: string
  pecasPublicadas: number
}

export type EstadoSelo = {
  selo: boolean
  solicitacao: SolicitacaoSelo | null
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

export type Coletivo = {
  slug: string
  nome: string
  territorio: string
  fundado: string
  historia: string
  membros: string[]
  tecnicas: string[]
  apoio: string[]
  imagem: string
}

export type Ponto = { lat: number; lng: number }

export type TipoEvento = 'feira' | 'festival' | 'exposicao' | 'oficina'

export type Evento = {
  slug: string
  nome: string
  tipo: TipoEvento
  organizador: string
  descricao: string
  periodo: string
  horario: string
  entrada: string
  cidade: string
  local: string
  endereco: string
  lat: number
  lng: number
  artesaos: string[]
  coletivos: string[]
  criadoPorVoce?: boolean
}

export type Video = {
  id: string
  artesao: string
  peca?: string
  legenda: string
  etiquetas: string[]
  duracao: string
  visualizacoes: number
  curtidas: number
  comentarios: number
  publicadoEm: string
  capa: string
}

export type Comentario = {
  autor: string
  texto: string
  quando: string
  curtidas: number
  artesao?: boolean
  resposta?: { texto: string; quando: string }
}

export type EnderecoUsuario = {
  id: string
  apelido: string
  rua: string
  bairro: string
  cep: string
  principal: boolean
}

export type Usuario = {
  id?: string
  nome: string
  email: string
  imagem: string
  perfil?: 'comprador' | 'artesao'
  papel?: 'comprador' | 'artesao' | 'admin'
  telefone?: string
  tipoComprador?: string
  territorio?: string
  tecnica?: string
  artesaoId?: string
  enderecos?: EnderecoUsuario[]
}

export type OpcaoFrete = { id: string; nome: string; prazo: string; valor: number }
