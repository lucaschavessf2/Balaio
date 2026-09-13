import type { ReactNode } from 'react'
import { IconeAviso, IconeSelo, IconeGrade } from '@/components/ui/Icones'
import { filaCuradoria, mediacoes } from '@/mocks/pedidos'

export type ChaveAdmin = 'curadoria' | 'mediacoes' | 'criterios'

export type GrupoAdmin = 'moderacao' | 'referencia'

export type ItemAdmin = {
  chave: ChaveAdmin
  texto: string
  textoCurto: string
  href: string
  icone: ReactNode
  grupo: GrupoAdmin
  marcador?: { texto: string; alerta?: boolean }
}

export const rotulosGrupoAdmin: Record<GrupoAdmin, string> = {
  moderacao: 'Moderação',
  referencia: 'Referência',
}

export function itensAdmin(): ItemAdmin[] {
  const naFila = filaCuradoria.length
  const abertas = mediacoes.length

  return [
    {
      chave: 'curadoria',
      texto: 'Fila de curadoria',
      textoCurto: 'Curadoria',
      href: '/admin',
      icone: <IconeSelo />,
      grupo: 'moderacao',
      marcador: naFila > 0 ? { texto: `${naFila} na fila` } : undefined,
    },
    {
      chave: 'mediacoes',
      texto: 'Mediações',
      textoCurto: 'Mediações',
      href: '/admin/mediations',
      icone: <IconeAviso />,
      grupo: 'moderacao',
      marcador: abertas > 0 ? { texto: `${abertas} aberta${abertas === 1 ? '' : 's'}`, alerta: true } : undefined,
    },
    {
      chave: 'criterios',
      texto: 'Critérios',
      textoCurto: 'Critérios',
      href: '/admin/criteria',
      icone: <IconeGrade />,
      grupo: 'referencia',
    },
  ]
}

export function itensAdminPorGrupo() {
  const itens = itensAdmin()
  return (Object.keys(rotulosGrupoAdmin) as GrupoAdmin[])
    .map((grupo) => ({ grupo, rotulo: rotulosGrupoAdmin[grupo], itens: itens.filter((i) => i.grupo === grupo) }))
    .filter((g) => g.itens.length > 0)
}
