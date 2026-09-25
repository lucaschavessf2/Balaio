import type { Comentario, Video } from '@/types/dominio'

export const videos: Video[] = [
  {
    id: 'v-001',
    artesao: 'mestre-nuca',
    peca: 'leao-imperial-de-tracunhaem',
    legenda: 'A juba do leão é feita cacho por cacho, com faca de ponta fina. São quatro horas só nessa parte.',
    etiquetas: ['ceramica', 'tracunhaem', 'passoapasso'],
    duracao: '0:48',
    visualizacoes: 12400,
    curtidas: 1830,
    comentarios: 96,
    publicadoEm: 'há 2 dias',
    capa: '/fotos/leao-imperial.svg',
  },
  {
    id: 'v-002',
    artesao: 'maria-de-caruaru',
    peca: 'toalha-renascenca-florescer',
    legenda: 'O ponto aranha fecha o miolo da flor. Minha avó dizia que é aqui que a renda ganha respiração.',
    etiquetas: ['renascenca', 'cariri', 'bordado'],
    duracao: '1:12',
    visualizacoes: 8730,
    curtidas: 2140,
    comentarios: 141,
    publicadoEm: 'há 4 dias',
    capa: '/fotos/toalha-renascenca.svg',
  },
  {
    id: 'v-003',
    artesao: 'mestre-dila',
    peca: 'painel-xilogravura-sertaneja',
    legenda: 'Entalhar a matriz é o inverso de desenhar: o que eu tiro é o que fica branco no papel.',
    etiquetas: ['xilogravura', 'caruaru', 'cordel'],
    duracao: '0:36',
    visualizacoes: 21900,
    curtidas: 4360,
    comentarios: 288,
    publicadoEm: 'há 1 semana',
    capa: '/fotos/painel-xilogravura.svg',
  },
  {
    id: 'v-004',
    artesao: 'mestre-amaro',
    peca: 'sanfoneiro-em-imburana',
    legenda: 'A imburana perfuma a oficina inteira enquanto trabalho. O sanfoneiro sai de um bloco só, sem emenda.',
    etiquetas: ['madeira', 'petrolina', 'saojoao'],
    duracao: '0:59',
    visualizacoes: 6420,
    curtidas: 1190,
    comentarios: 63,
    publicadoEm: 'há 1 semana',
    capa: '/fotos/sanfoneiro-imburana.svg',
  },
  {
    id: 'v-005',
    artesao: 'ze-do-cariri',
    peca: 'gibao-de-couro-de-sertao',
    legenda: 'Couro curtido com casca de angico, do jeito que meu pai ensinou. Cada costura é feita à mão.',
    etiquetas: ['couro', 'pajeu', 'vaqueiro'],
    duracao: '1:04',
    visualizacoes: 4980,
    curtidas: 870,
    comentarios: 44,
    publicadoEm: 'há 2 semanas',
    capa: '/fotos/gibao-couro.svg',
  },
  {
    id: 'v-006',
    artesao: 'dona-bia-do-ipojuca',
    peca: 'jarra-de-ceramica-cabocla',
    legenda: 'Os pigmentos vêm da terra daqui do vale. Eu mesma moo e misturo antes de pintar.',
    etiquetas: ['ceramica', 'ipojuca', 'pintura'],
    duracao: '0:42',
    visualizacoes: 9310,
    curtidas: 1620,
    comentarios: 88,
    publicadoEm: 'há 2 semanas',
    capa: '/fotos/jarra-cabocla.svg',
  },
]

export const comentarios: Record<string, Comentario[]> = {
  'v-001': [
    {
      autor: 'Clarissa M. Reis',
      texto: 'Nunca tinha visto de perto como a juba é feita. Agora entendo o preço, é dia de trabalho em cada peça.',
      quando: 'há 1 dia',
      curtidas: 214,
      resposta: { texto: 'Obrigado, Clarissa! É isso mesmo, o leão grande leva quase quatro dias até a queima.', quando: 'há 22 horas' },
    },
    { autor: 'Renato Albuquerque', texto: 'Faz em tamanho menor pra apartamento?', quando: 'há 1 dia', curtidas: 41, resposta: { texto: 'Faço sim! O Leãozinho de Bolso está no catálogo, mesma técnica.', quando: 'há 1 dia' } },
    { autor: 'Mestre Dila', texto: 'Trabalho lindo, colega. O acabamento da juba está impecável.', quando: 'há 20 horas', curtidas: 88, artesao: true },
    { autor: 'Paula Bezerra', texto: 'Comprei o meu ano passado e até hoje todo mundo que entra em casa pergunta de onde é.', quando: 'há 14 horas', curtidas: 132 },
  ],
  'v-002': [
    { autor: 'Ana Luiza', texto: 'Minha avó fazia renascença e eu nunca aprendi. Ver esse vídeo deu um aperto bom no peito.', quando: 'há 3 dias', curtidas: 386, resposta: { texto: 'Nunca é tarde, viu? A gente dá oficina em Caruaru todo mês.', quando: 'há 3 dias' } },
    { autor: 'Fernanda Sá', texto: 'Quanto tempo leva uma toalha desse tamanho?', quando: 'há 2 dias', curtidas: 27, resposta: { texto: 'Cerca de três semanas, trabalhando um pouco por dia.', quando: 'há 2 dias' } },
    { autor: 'Dona Bia do Ipojuca', texto: 'O ponto aranha dessa flor está perfeito. Paciência de outro mundo.', quando: 'há 2 dias', curtidas: 64, artesao: true },
  ],
  'v-003': [
    { autor: 'Tiago Nunes', texto: 'Isso é o inverso de desenhar mesmo. Nunca tinha pensado assim, mudou minha cabeça.', quando: 'há 6 dias', curtidas: 512 },
    { autor: 'Camila Verçosa', texto: 'Dá pra encomendar a matriz junto com a gravura?', quando: 'há 5 dias', curtidas: 73, resposta: { texto: 'Dá sim, mas a matriz sai por encomenda e leva mais tempo. Me chama no chat.', quando: 'há 5 dias' } },
    { autor: 'Mestre Amaro', texto: 'A madeira que tu usa é umburana também?', quando: 'há 4 dias', curtidas: 19, artesao: true, resposta: { texto: 'Uso cedro pra matriz, segura melhor o corte fino.', quando: 'há 4 dias' } },
    { autor: 'Joana Ribeiro', texto: 'Levei um painel pra minha sala e virou o assunto da casa.', quando: 'há 3 dias', curtidas: 145 },
  ],
  'v-004': [
    { autor: 'Hélio Souza', texto: 'O cheiro da imburana é uma memória de infância inteira.', quando: 'há 6 dias', curtidas: 208 },
    { autor: 'Marina Costa', texto: 'Sai de um bloco só? Achei que fosse colado. Impressionante.', quando: 'há 5 dias', curtidas: 94, resposta: { texto: 'Bloco único, sem emenda nenhuma. É o que garante que não solta com o tempo.', quando: 'há 5 dias' } },
    { autor: 'Carlos de Olinda', texto: 'Chega pronto pro São João?', quando: 'há 4 dias', curtidas: 12, resposta: { texto: 'Se pedir até o fim do mês, chega tranquilo.', quando: 'há 4 dias' } },
  ],
  'v-005': [
    { autor: 'Débora Lins', texto: 'Curtimento com casca de angico é coisa que quase ninguém faz mais. Que bom ver isso vivo.', quando: 'há 12 dias', curtidas: 176 },
    { autor: 'Zé do Cariri', texto: 'Obrigado, Débora. Foi meu pai que ensinou e eu não largo.', quando: 'há 12 dias', curtidas: 58, artesao: true },
    { autor: 'Rafael Menezes', texto: 'Tem numeração maior?', quando: 'há 9 dias', curtidas: 8, resposta: { texto: 'Tenho até o G, e faço sob medida se precisar.', quando: 'há 9 dias' } },
  ],
  'v-006': [
    { autor: 'Luana Peixoto', texto: 'Você mesma mói o pigmento? Isso é outro nível de trabalho.', quando: 'há 10 dias', curtidas: 233, resposta: { texto: 'Eu mesma! A terra vem daqui do vale, cada cor de um barranco diferente.', quando: 'há 10 dias' } },
    { autor: 'Mestre Nuca (Sucessor)', texto: 'As cenas de feira ficaram muito boas nessa jarra.', quando: 'há 9 dias', curtidas: 71, artesao: true },
    { autor: 'Bruno Tavares', texto: 'Pode ir ao forno ou é só decorativa?', quando: 'há 8 dias', curtidas: 22, resposta: { texto: 'Essa é decorativa. Pra uso tenho a linha sem pintura externa.', quando: 'há 8 dias' } },
  ],
}

export function comentariosDoVideo(id: string): Comentario[] {
  return comentarios[id] ?? []
}

export const etiquetasEmAlta = ['ceramica', 'renascenca', 'xilogravura', 'couro', 'madeira', 'passoapasso']
