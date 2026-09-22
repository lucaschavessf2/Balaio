import { categorias, tecnicas, tipos } from '@/constants/referencias'
import { montarQuery } from '@/services/api/cliente'

export type LinkDepartamento = { texto: string; href: string }

export const hrefBusca = (filtro: Record<string, string>) => `/search${montarQuery(filtro)}`

export const gruposDepartamentos: { titulo: string; links: LinkDepartamento[] }[] = [
  { titulo: 'Tipos de peça', links: tipos.map((tipo) => ({ texto: tipo, href: hrefBusca({ tipo }) })) },
  { titulo: 'Categorias', links: categorias.map((categoria) => ({ texto: categoria, href: hrefBusca({ categoria }) })) },
  { titulo: 'Técnicas', links: tecnicas.map((tecnica) => ({ texto: tecnica, href: hrefBusca({ tecnica }) })) },
]

export const linksRapidos: LinkDepartamento[] = [
  { texto: 'Ofertas', href: hrefBusca({ desconto: 'true' }) },
  { texto: 'Peças únicas', href: hrefBusca({ disponibilidade: 'unica' }) },
  { texto: 'Sob encomenda', href: hrefBusca({ disponibilidade: 'encomenda' }) },
  { texto: 'Mais bem avaliadas', href: hrefBusca({ ordenar: 'avaliacao' }) },
  { texto: 'Feiras e eventos', href: '/events' },
  { texto: 'Vídeos', href: '/videos' },
]
