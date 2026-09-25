'use client'

import { useFavoritos } from '@/store/favoritos'

type Props = { esconderZero?: boolean; decorativo?: boolean }

export default function ContadorFavoritos({ esconderZero = false, decorativo = false }: Props) {
  const { slugs, pronto } = useFavoritos()

  if (esconderZero && (!pronto || slugs.length === 0)) return null

  return (
    <span className="contador" aria-hidden={decorativo || undefined}>
      {slugs.length}
    </span>
  )
}