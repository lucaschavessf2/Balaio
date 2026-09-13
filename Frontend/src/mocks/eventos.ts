export type Ponto = { lat: number; lng: number }

export type TipoEvento = 'feira' | 'festival' | 'exposicao' | 'oficina'

export const rotuloTipoEvento: Record<TipoEvento, string> = {
  feira: 'Feira',
  festival: 'Festival',
  exposicao: 'Exposição',
  oficina: 'Oficina aberta',
}

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

export const pontoPadrao: Ponto = { lat: -8.0631, lng: -34.8711 }

export const municipiosPE: { nome: string; lat: number; lng: number }[] = [
  { nome: 'Recife', lat: -8.0631, lng: -34.8711 },
  { nome: 'Olinda', lat: -8.0089, lng: -34.8553 },
  { nome: 'Caruaru', lat: -8.2829, lng: -35.9722 },
  { nome: 'Tracunhaém', lat: -7.8047, lng: -35.24 },
  { nome: 'Goiana', lat: -7.5606, lng: -35.0025 },
  { nome: 'Gravatá', lat: -8.2015, lng: -35.5646 },
  { nome: 'Bezerros', lat: -8.2333, lng: -35.7971 },
  { nome: 'Pesqueira', lat: -8.3576, lng: -36.6966 },
  { nome: 'Garanhuns', lat: -8.8829, lng: -36.4966 },
  { nome: 'Serra Talhada', lat: -7.9856, lng: -38.2963 },
  { nome: 'Petrolina', lat: -9.3891, lng: -40.503 },
  { nome: 'Ipojuca', lat: -8.3989, lng: -35.0637 },
]

export const eventos: Evento[] = [
  {
    slug: 'fenearte-2026',
    nome: 'Fenearte: Feira Nacional de Negócios do Artesanato',
    tipo: 'feira',
    organizador: 'Governo de Pernambuco',
    descricao:
      'A maior feira de artesanato da América Latina reúne mestres e mestras de todo o Brasil em duas semanas de exposição, venda direta e oficinas abertas. O pavilhão de Pernambuco concentra o barro de Tracunhaém e do Alto do Moura, a renda renascença do Cariri e a xilogravura do Agreste.',
    periodo: '4 a 13 de setembro, 2026',
    horario: '14h às 22h (sábados e domingos a partir das 10h)',
    entrada: 'R$ 14 · meia para estudantes',
    cidade: 'Olinda',
    local: 'Centro de Convenções de Pernambuco',
    endereco: 'Av. Professor Andrade Bezerra, s/n, Salgadinho',
    lat: -8.033,
    lng: -34.866,
    artesaos: [
      'mestre-nuca',
      'maria-de-caruaru',
      'mestre-dila',
      'mestre-amaro',
      'ze-do-cariri',
      'dona-bia-do-ipojuca',
      'mestre-vitalino-sucessores',
    ],
    coletivos: ['associacao-de-tracunhaem', 'rede-renascenca-do-cariri'],
  },
  {
    slug: 'salao-do-artesanato-marco-zero',
    nome: 'Salão do Artesanato de Pernambuco',
    tipo: 'exposicao',
    organizador: 'Prefeitura do Recife',
    descricao:
      'Mostra a céu aberto no Marco Zero com estandes de venda direta e demonstrações de técnica ao vivo. A curadoria prioriza peças com Selo de Origem dos territórios pernambucanos.',
    periodo: '29 de agosto a 6 de setembro, 2026',
    horario: '10h às 21h',
    entrada: 'Gratuita',
    cidade: 'Recife',
    local: 'Praça do Marco Zero, Recife Antigo',
    endereco: 'Av. Alfredo Lisboa, s/n, Bairro do Recife',
    lat: -8.0631,
    lng: -34.8711,
    artesaos: ['mestre-nuca', 'dona-bia-do-ipojuca', 'maria-de-caruaru'],
    coletivos: ['rede-renascenca-do-cariri'],
  },
  {
    slug: 'feira-de-ceramica-de-tracunhaem',
    nome: 'Feira de Cerâmica de Tracunhaém',
    tipo: 'feira',
    organizador: 'Associação dos Ceramistas de Tracunhaém',
    descricao:
      'A praça da Matriz vira galeria a céu aberto: os ateliês da cidade abrem as portas, os fornos ficam acesos e os leões de juba cacheada saem direto da queima para a feira.',
    periodo: '12 e 13 de setembro, 2026',
    horario: '9h às 18h',
    entrada: 'Gratuita',
    cidade: 'Tracunhaém',
    local: 'Praça da Matriz',
    endereco: 'Centro de Tracunhaém, Mata Norte',
    lat: -7.8047,
    lng: -35.24,
    artesaos: ['mestre-nuca', 'mestre-vitalino-sucessores'],
    coletivos: ['associacao-de-tracunhaem'],
  },
  {
    slug: 'festival-do-barro-alto-do-moura',
    nome: 'Festival do Barro do Alto do Moura',
    tipo: 'festival',
    organizador: 'Prefeitura de Caruaru',
    descricao:
      'No maior centro de arte figurativa em barro das Américas, o festival celebra a herança de Mestre Vitalino com oficinas de modelagem, visita às casas-ateliê e forró no fim da tarde.',
    periodo: '19 e 20 de setembro, 2026',
    horario: '9h às 20h',
    entrada: 'Gratuita',
    cidade: 'Caruaru',
    local: 'Alto do Moura, rua principal',
    endereco: 'Rua Mestre Vitalino, Alto do Moura',
    lat: -8.32,
    lng: -35.995,
    artesaos: ['mestre-vitalino-sucessores', 'dona-bia-do-ipojuca'],
    coletivos: ['associacao-de-tracunhaem'],
  },
  {
    slug: 'encontro-da-renascenca',
    nome: 'Encontro da Renda Renascença',
    tipo: 'oficina',
    organizador: 'Rede Renascença do Cariri',
    descricao:
      'Dois dias de rodas de bordado abertas ao público, com as bordadeiras do Cariri ensinando o ponto aranha e contando a história da renda que atravessa gerações.',
    periodo: '26 e 27 de setembro, 2026',
    horario: '8h às 17h',
    entrada: 'Gratuita',
    cidade: 'Pesqueira',
    local: 'Mercado Cultural de Pesqueira',
    endereco: 'Praça Comendador José Didier, Centro',
    lat: -8.3576,
    lng: -36.6966,
    artesaos: ['maria-de-caruaru'],
    coletivos: ['rede-renascenca-do-cariri'],
  },
  {
    slug: 'mostra-de-couro-do-pajeu',
    nome: 'Mostra de Couro do Pajeú',
    tipo: 'exposicao',
    organizador: 'Couraria do Pajeú',
    descricao:
      'O couro curtido com casca de angico em exposição e venda: gibões, chapéus e bolsas costurados à mão, com demonstração do curtimento tradicional do Sertão.',
    periodo: '10 e 11 de outubro, 2026',
    horario: '9h às 18h',
    entrada: 'Gratuita',
    cidade: 'Serra Talhada',
    local: 'Museu do Cangaço',
    endereco: 'Praça Barão do Pajeú, Centro',
    lat: -7.9856,
    lng: -38.2963,
    artesaos: ['ze-do-cariri'],
    coletivos: [],
  },
  {
    slug: 'entalhadores-do-sao-francisco',
    nome: 'Encontro de Entalhadores do São Francisco',
    tipo: 'festival',
    organizador: 'Prefeitura de Petrolina',
    descricao:
      'Na orla do Velho Chico, escultores de imburana mostram o entalhe das figuras do cotidiano sertanejo, com oficinas para iniciantes e exposição das peças premiadas do ano.',
    periodo: '17 e 18 de outubro, 2026',
    horario: '10h às 19h',
    entrada: 'Gratuita',
    cidade: 'Petrolina',
    local: 'Orla de Petrolina',
    endereco: 'Av. Cardoso de Sá, s/n, Orla',
    lat: -9.3891,
    lng: -40.503,
    artesaos: ['mestre-amaro'],
    coletivos: [],
  },
]

export function acharEvento(slug: string): Evento | undefined {
  return eventos.find((e) => e.slug === slug)
}

export function distanciaKm(a: Ponto, b: Ponto): number {
  const raioTerraKm = 6371
  const emRad = (graus: number) => (graus * Math.PI) / 180
  const dLat = emRad(b.lat - a.lat)
  const dLng = emRad(b.lng - a.lng)
  const arco =
    Math.sin(dLat / 2) ** 2 + Math.cos(emRad(a.lat)) * Math.cos(emRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * raioTerraKm * Math.asin(Math.sqrt(arco))
}

export function distanciaLegivel(km: number): string {
  if (km < 1) return 'a menos de 1 km'
  return `a ${Math.round(km)} km`
}

export function resumoParticipantes(evento: Pick<Evento, 'artesaos' | 'coletivos'>): string {
  const partes: string[] = []
  if (evento.artesaos.length > 0) {
    partes.push(`${evento.artesaos.length} ${evento.artesaos.length === 1 ? 'artesão' : 'artesãos'}`)
  }
  if (evento.coletivos.length > 0) {
    partes.push(`${evento.coletivos.length} ${evento.coletivos.length === 1 ? 'coletivo' : 'coletivos'}`)
  }
  if (partes.length === 0) return 'Participantes a confirmar'
  return `${partes.join(' e ')} confirmados`
}
