'use client'

import { useEffect, useState } from 'react'
import { IconeRelogio } from '@/components/ui/Icones'

const UM_SEGUNDO_MS = 1000

function tempoAteMeiaNoite(agora: Date): string {
  const meiaNoite = new Date(agora)
  meiaNoite.setHours(24, 0, 0, 0)
  const totalSegundos = Math.max(0, Math.floor((meiaNoite.getTime() - agora.getTime()) / UM_SEGUNDO_MS))
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((parte) => String(parte).padStart(2, '0')).join(':')
}

export default function ContagemOfertas() {
  const [restante, definirRestante] = useState<string | null>(null)

  useEffect(() => {
    definirRestante(tempoAteMeiaNoite(new Date()))
    const intervalo = setInterval(() => definirRestante(tempoAteMeiaNoite(new Date())), UM_SEGUNDO_MS)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <p className="contagem-ofertas">
      <IconeRelogio tamanho={16} />
      <span>acabam em</span>
      <time className="contagem-ofertas-tempo" aria-live="off">
        {restante ?? '--:--:--'}
      </time>
    </p>
  )
}
