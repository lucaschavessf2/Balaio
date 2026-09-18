import type { ReactNode } from 'react'
import { IconeConversa, IconeEngrenagem, IconeGrafico, IconePacote, IconePincel, IconePlay } from '@/components/ui/Icones'

export type ChavePainel = 'pedidos' | 'pecas' | 'videos' | 'conversas' | 'vendas' | 'config'

export type GrupoPainel = 'vender' | 'divulgar' | 'oficina'

export type ItemPainel = {
  chave: ChavePainel
  texto: string
  textoCurto: string
  href: string
  icone: ReactNode
  grupo: GrupoPainel
  marcador?: { texto: string; alerta?: boolean }
}

export const rotulosGrupo: Record<GrupoPainel, string> = {
  vender: 'Vender',
  divulgar: 'Divulgar',
  oficina: 'Oficina',
}

export type ContagensPainel = { pendentes: number; naoLidas: number }

export function itensPainel({ pendentes, naoLidas }: ContagensPainel = { pendentes: 0, naoLidas: 0 }): ItemPainel[] {
  return [
    {
      chave: 'pedidos',
      texto: 'Pedidos',
      textoCurto: 'Pedidos',
      href: '/dashboard',
      icone: <IconePacote />,
      grupo: 'vender',
      marcador: pendentes > 0 ? { texto: `${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}` } : undefined,
    },
    {
      chave: 'pecas',
      texto: 'Minhas peças',
      textoCurto: 'Peças',
      href: '/dashboard/pieces',
      icone: <IconePincel />,
      grupo: 'vender',
    },
    {
      chave: 'vendas',
      texto: 'Vendas',
      textoCurto: 'Vendas',
      href: '/dashboard/sales',
      icone: <IconeGrafico />,
      grupo: 'vender',
    },
    {
      chave: 'conversas',
      texto: 'Conversas',
      textoCurto: 'Conversas',
      href: '/dashboard/messages',
      icone: <IconeConversa />,
      grupo: 'divulgar',
      marcador:
        naoLidas > 0 ? { texto: `${naoLidas} não ${naoLidas === 1 ? 'lida' : 'lidas'}`, alerta: true } : undefined,
    },
    {
      chave: 'videos',
      texto: 'Vídeos',
      textoCurto: 'Vídeos',
      href: '/dashboard/videos',
      icone: <IconePlay />,
      grupo: 'divulgar',
    },
    {
      chave: 'config',
      texto: 'Configurações',
      textoCurto: 'Configurações',
      href: '/dashboard/settings',
      icone: <IconeEngrenagem />,
      grupo: 'oficina',
    },
  ]
}

export function itensPorGrupo(contagens?: ContagensPainel) {
  const itens = itensPainel(contagens)
  return (Object.keys(rotulosGrupo) as GrupoPainel[])
    .map((grupo) => ({ grupo, rotulo: rotulosGrupo[grupo], itens: itens.filter((i) => i.grupo === grupo) }))
    .filter((g) => g.itens.length > 0)
}
