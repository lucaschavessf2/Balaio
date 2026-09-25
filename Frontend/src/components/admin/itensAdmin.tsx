import type { ReactNode } from 'react'
import { IconeAviso, IconeSelo, IconeGrade } from '@/components/ui/Icones'

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

export type ContagensAdmin = { curadoria: number; mediacoes: number }

export const rotulosGrupoAdmin: Record<GrupoAdmin, string> = {
  moderacao: 'Moderação',
  referencia: 'Referência',
}

export function itensAdmin({ curadoria, mediacoes }: ContagensAdmin = { curadoria: 0, mediacoes: 0 }): ItemAdmin[] {
  return [
    {
      chave: 'curadoria',
      texto: 'Fila de curadoria',
      textoCurto: 'Curadoria',
      href: '/admin',
      icone: <IconeSelo />,
      grupo: 'moderacao',
      marcador: curadoria > 0 ? { texto: `${curadoria} na fila` } : undefined,
    },
    {
      chave: 'mediacoes',
      texto: 'Mediações',
      textoCurto: 'Mediações',
      href: '/admin/mediations',
      icone: <IconeAviso />,
      grupo: 'moderacao',
      marcador: mediacoes > 0 ? { texto: `${mediacoes} abertas`, alerta: true } : undefined,
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

export function itensAdminPorGrupo(contagens?: ContagensAdmin) {
  const itens = itensAdmin(contagens)
  return (Object.keys(rotulosGrupoAdmin) as GrupoAdmin[])
    .map((grupo) => ({ grupo, rotulo: rotulosGrupoAdmin[grupo], itens: itens.filter((i) => i.grupo === grupo) }))
    .filter((g) => g.itens.length > 0)
}
