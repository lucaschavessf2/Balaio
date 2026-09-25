export const tecnicas = [
  'Cerâmica & Barro',
  'Bordado & Renda (Renascença)',
  'Escultura em Madeira',
  'Couro Autoral',
  'Xilogravura',
] as const

export const territorios = [
  'Mata Norte',
  'Cariri',
  'Pajeú',
  'Petrolina',
  'Vale do Ipojuca',
  'Caruaru',
  'Alto do Moura, Caruaru',
]

export const categorias = ['Decoração & Arte', 'Casa & Mesa', 'Vestuário & Acessórios']

export const tipos = [
  'Jarras & Vasos',
  'Esculturas & Bonecos',
  'Mesa & Cozinha',
  'Toalhas & Rendas',
  'Couro: Bolsas, Cintos & Gibões',
  'Gravuras & Cordéis',
] as const

export type TipoPeca = (typeof tipos)[number]
