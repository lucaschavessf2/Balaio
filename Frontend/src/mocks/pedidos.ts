import type { Mediacao, Mensagem, Pedido } from '@/types/dominio'

export const pedidos: Pedido[] = [
  {
    id: 'PE-2026-8941',
    pecaSlug: 'leao-imperial-de-tracunhaem',
    compradorNome: 'Carlos de Olinda',
    data: '12 de março, 2026',
    total: 1250,
    estado: 'producao',
    rastreio: 'BR-TRAC-8893A',
    transportadora: 'Sertão Logística Regional',
    previsaoEntrega: '26 de março, 2026',
    avaliado: false,
    etapas: [
      {
        estado: 'confirmado',
        titulo: 'Pedido confirmado',
        detalhe: '12/03/2026 às 14:32, pagamento aprovado e recebido.',
        concluida: true,
        atual: false,
      },
      {
        estado: 'producao',
        titulo: 'Em produção',
        detalhe: 'Iniciado em 14/03/2026. Previsão de queima final: 19/03.',
        concluida: false,
        atual: true,
        nota: 'O barro de Tracunhaém está excelente nesta semana. Já moldei a estrutura do leão e agora estou esculpindo cada detalhe da juba. Vai para a queima na sexta-feira!',
      },
      {
        estado: 'enviado',
        titulo: 'Enviado (transportadora de origem)',
        detalhe: 'Aguardando finalização da peça e coleta direta na oficina.',
        concluida: false,
        atual: false,
      },
      {
        estado: 'entregue',
        titulo: 'Entregue no seu endereço',
        detalhe: 'Previsão estimada de chegada: 26 de março, 2026.',
        concluida: false,
        atual: false,
      },
    ],
  },
  {
    id: 'PE-2026-8720',
    pecaSlug: 'jarra-de-ceramica-cabocla',
    compradorNome: 'Carlos de Olinda',
    data: '28 de fevereiro, 2026',
    total: 350,
    estado: 'entregue',
    rastreio: 'BR-IPOJ-4471C',
    transportadora: 'Sertão Logística Regional',
    previsaoEntrega: '08 de março, 2026',
    avaliado: false,
    etapas: [
      { estado: 'confirmado', titulo: 'Pedido confirmado', detalhe: '28/02/2026 às 09:15.', concluida: true, atual: false },
      { estado: 'producao', titulo: 'Em produção', detalhe: 'Peça em estoque, separada no mesmo dia.', concluida: true, atual: false },
      { estado: 'enviado', titulo: 'Enviado', detalhe: 'Coletado em 01/03/2026.', concluida: true, atual: false },
      { estado: 'entregue', titulo: 'Entregue no seu endereço', detalhe: 'Recebido em 08/03/2026.', concluida: true, atual: true },
    ],
  },
  {
    id: 'PE-2026-8655',
    pecaSlug: 'leaozinho-de-bolso',
    compradorNome: 'Carlos de Olinda',
    data: '10 de fevereiro, 2026',
    total: 180,
    estado: 'entregue',
    rastreio: 'BR-TRAC-2210B',
    transportadora: 'Sertão Logística Regional',
    previsaoEntrega: '17 de fevereiro, 2026',
    avaliado: true,
    etapas: [
      { estado: 'confirmado', titulo: 'Pedido confirmado', detalhe: '10/02/2026 às 18:40.', concluida: true, atual: false },
      { estado: 'producao', titulo: 'Em produção', detalhe: 'Peça em estoque.', concluida: true, atual: false },
      { estado: 'enviado', titulo: 'Enviado', detalhe: 'Coletado em 11/02/2026.', concluida: true, atual: false },
      { estado: 'entregue', titulo: 'Entregue no seu endereço', detalhe: 'Recebido em 17/02/2026.', concluida: true, atual: true },
    ],
  },
]

export const conversa: Mensagem[] = [
  {
    autor: 'artesao',
    texto: 'Olá, Carlos! Tudo bem? Fico muito feliz que tenha gostado da nota sobre a juba do leão.',
    hora: '14:35',
  },
  {
    autor: 'comprador',
    texto:
      'Olá, mestre! Que ótimo saber. Eu tenho muito apreço pelo trabalho de vocês. Quando estiver pronto para envio, você me avisa por aqui?',
    hora: '14:40',
  },
  {
    autor: 'artesao',
    texto: 'Com certeza! Envio sim uma foto antes dele ir para a transportadora. Qualquer dúvida pode me chamar.',
    hora: '14:42',
  },
]

export const pedidosPendentesArtesao = [
  {
    id: 'PE-2026-9012',
    pecaSlug: 'banda-de-pifanos-completa',
    comprador: 'Clarissa M. Reis',
    quando: 'Hoje, 10:14',
    valor: 420,
  },
  {
    id: 'PE-2026-9008',
    pecaSlug: 'jarra-de-ceramica-cabocla',
    comprador: 'Renato Albuquerque',
    quando: 'Ontem, 16:45',
    valor: 350,
  },
]

export type ConversaArtesao = {
  id: string
  pessoa: string
  assunto: string
  previa: string
  quando: string
  naoLida: boolean
  retrato: string
}

export const conversasArtesao: ConversaArtesao[] = [
  {
    id: 'PE-2026-8941',
    pessoa: 'Carlos de Olinda',
    assunto: 'Leão Imperial de Tracunhaém',
    previa: 'Com certeza! Envio sim uma foto antes dele ir para a transportadora.',
    quando: '14:42',
    naoLida: true,
    retrato: '/fotos/leao-imperial.svg',
  },
  {
    id: 'PE-2026-9012',
    pessoa: 'Clarissa M. Reis',
    assunto: 'Banda de Pífanos Completa',
    previa: 'Consegue entregar antes do São João?',
    quando: 'Ontem',
    naoLida: false,
    retrato: '/fotos/banda-pifanos.svg',
  },
  {
    id: 'PE-2026-9008',
    pessoa: 'Renato Albuquerque',
    assunto: 'Jarra de Cerâmica Cabocla',
    previa: 'Obrigado! Chegou tudo certinho, peça linda.',
    quando: '19/03',
    naoLida: false,
    retrato: '/fotos/jarra-cabocla.svg',
  },
]

export const filaCuradoria = [
  {
    id: 'CUR-114',
    peca: 'Bonecos de Barro do Mestre Zé',
    artesao: 'Oficina do Alto do Moura',
    enviadoEm: 'Hoje, 08:22',
    motivo: 'Primeira publicação do artesão',
  },
  {
    id: 'CUR-113',
    peca: 'Rede de Tear Manual',
    artesao: 'Tecelagem de Pesqueira',
    enviadoEm: 'Ontem, 19:03',
    motivo: 'Faltam fotos de detalhe da técnica',
  },
  {
    id: 'CUR-112',
    peca: 'Chapéu de Couro Cangaceiro',
    artesao: 'Couraria do Pajeú',
    enviadoEm: '19/03, 11:47',
    motivo: 'Revisão de preço fora da faixa da categoria',
  },
]

export const mediacoes: Mediacao[] = [
  {
    id: 'MED-31',
    pedido: 'PE-2026-8801',
    assunto: 'Prazo de encomenda ultrapassado em 6 dias',
    partes: 'Ana Luiza × Casa da Renascença',
    aberta: 'há 2 dias',
  },
]

export function acharPedido(id: string): Pedido | undefined {
  return pedidos.find((p) => p.id === id)
}
