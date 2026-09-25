import type { Coletivo } from '@/types/dominio'

export const coletivos: Coletivo[] = [
  {
    slug: 'associacao-de-tracunhaem',
    nome: 'Associação dos Ceramistas de Tracunhaém',
    territorio: 'Tracunhaém, Mata Norte',
    fundado: '1998',
    historia:
      'Reúne oficinas familiares que dividem forno, transporte e a rede de compradores. A associação é quem emite o Selo de Origem das peças do território e negocia a compra coletiva de barro e lenha, o que segura o preço final para quem produz.',
    membros: ['mestre-nuca', 'mestre-vitalino-sucessores'],
    tecnicas: ['Cerâmica & Barro'],
    apoio: ['Cooperativa de compra de matéria-prima', 'Programa municipal de feiras'],
    imagem: '/fotos/atelier-nuca.svg',
  },
  {
    slug: 'rede-renascenca-do-cariri',
    nome: 'Rede Renascença do Cariri',
    territorio: 'Cariri pernambucano',
    fundado: '2006',
    historia:
      'Nasceu de um grupo de doze bordadeiras que passaram a vender juntas para não competir por preço entre si. Hoje organiza a produção sob encomenda, distribui os pedidos conforme a agenda de cada casa e mantém um fundo comum para material.',
    membros: ['maria-de-caruaru'],
    tecnicas: ['Bordado & Renda (Renascença)'],
    apoio: ['Fundo comum de material', 'Rede de oficinas do território'],
    imagem: '/fotos/casa-renascenca.svg',
  },
]


export function acharColetivo(slug: string): Coletivo | undefined {
  return coletivos.find((c) => c.slug === slug)
}
