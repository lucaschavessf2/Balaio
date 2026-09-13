'use client'

import { useEffect, useState } from 'react'

const RESERVA_PADRAO = '/fotos/ImagemBase.webp'

type Props = {
  src?: string
  reserva?: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
  style?: React.CSSProperties
}

export default function ImagemComFallback({ src, reserva = RESERVA_PADRAO, alt, ...resto }: Props) {
  const [fonte, definirFonte] = useState(src ?? reserva)

  useEffect(() => {
    definirFonte(src ?? reserva)
  }, [src, reserva])

  if (!fonte) return null

  return (
    <img
      src={fonte}
      alt={alt}
      onError={() => {
        if (reserva && fonte !== reserva) definirFonte(reserva)
      }}
      {...resto}
    />
  )
}
