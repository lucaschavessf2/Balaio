import type { Artesao } from '@/types/dominio'

export const artesaos: Artesao[] = [
  {
    slug: 'mestre-nuca',
    nome: 'Mestre Nuca (Sucessor)',
    atelie: 'Atelier Sucessores de Nuca',
    territorio: 'Tracunhaém, Mata Norte de Pernambuco',
    tecnica: 'Cerâmica & Barro',
    historia:
      'Iniciado pelo lendário Mestre Nuca de Tracunhaém, o atelier mantém viva a tradição de moldar leões de juba cacheada em cerâmica crua. Hoje conduzido por sua família, cada geração protege as ferramentas secretas de entalhe e a queima de forno lento que confere a cor de terracota brilhante única.',
    obrasComercializadas: 320,
    avaliacaoMedia: 4.9,
    selo: true,
    imagem: '/fotos/atelier-nuca.svg',
  },
  {
    slug: 'maria-de-caruaru',
    nome: 'Maria de Caruaru',
    atelie: 'Casa da Renascença',
    territorio: 'Cariri pernambucano',
    tecnica: 'Bordado & Renda (Renascença)',
    historia:
      'Aprendeu o ponto com a avó aos nove anos e hoje coordena um grupo de doze bordadeiras. A casa produz sob encomenda porque cada peça leva semanas, e porque nenhuma renda nasce igual à anterior.',
    obrasComercializadas: 145,
    avaliacaoMedia: 5,
    selo: true,
    imagem: '/fotos/casa-renascenca.svg',
  },
  {
    slug: 'mestre-dila',
    nome: 'Mestre Dila',
    atelie: 'Ateliê de Xilogravura do Agreste',
    territorio: 'Caruaru, Agreste',
    tecnica: 'Xilogravura',
    historia:
      'Gravador e cordelista, entalha matrizes em madeira desde os anos setenta. Imprime à mão, folha por folha, mantendo a irregularidade que distingue a gravura da reprodução industrial.',
    obrasComercializadas: 88,
    avaliacaoMedia: 5,
    selo: true,
    imagem: '/fotos/atelie-dila.svg',
  },
  {
    slug: 'mestre-amaro',
    nome: 'Mestre Amaro',
    atelie: 'Oficina de Imburana',
    territorio: 'Petrolina, Sertão do São Francisco',
    tecnica: 'Escultura em Madeira',
    historia:
      'Entalha figuras do cotidiano sertanejo em imburana e umburana-de-cheiro, madeiras recolhidas de podas e árvores já caídas.',
    obrasComercializadas: 210,
    avaliacaoMedia: 4.8,
    selo: true,
    imagem: '/fotos/oficina-imburana.svg',
  },
  {
    slug: 'ze-do-cariri',
    nome: 'Artesão Zé do Cariri',
    atelie: 'Couraria do Pajeú',
    territorio: 'Pajeú, Sertão',
    tecnica: 'Couro Autoral',
    historia:
      'Trabalha o couro curtido com casca de angico, técnica que herdou do pai. Produz gibões, chapéus e bolsas com costura à mão.',
    obrasComercializadas: 132,
    avaliacaoMedia: 4.7,
    selo: false,
    imagem: '/fotos/couraria-pajeu.svg',
  },
  {
    slug: 'dona-bia-do-ipojuca',
    nome: 'Dona Bia do Ipojuca',
    atelie: 'Barro do Ipojuca',
    territorio: 'Vale do Ipojuca',
    tecnica: 'Cerâmica & Barro',
    historia:
      'Pinta cenas de feira e festa em cerâmica utilitária, com pigmentos que ela mesma prepara a partir de terras da região.',
    obrasComercializadas: 176,
    avaliacaoMedia: 4.6,
    selo: true,
    imagem: '/fotos/barro-ipojuca.svg',
  },
  {
    slug: 'mestre-vitalino-sucessores',
    nome: 'Sucessores de Vitalino',
    atelie: 'Casa do Alto do Moura',
    territorio: 'Alto do Moura, Caruaru',
    tecnica: 'Cerâmica & Barro',
    historia:
      'A casa que continua o traço de Mestre Vitalino no Alto do Moura, maior centro de arte figurativa em barro das Américas.',
    obrasComercializadas: 402,
    avaliacaoMedia: 5,
    selo: true,
    imagem: '/fotos/alto-do-moura.svg',
  },
]


export function acharArtesao(slug: string): Artesao | undefined {
  return artesaos.find((a) => a.slug === slug)
}
