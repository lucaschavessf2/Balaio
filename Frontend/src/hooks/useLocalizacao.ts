import { useEffect, useState } from 'react'
import { pontoPadrao, type Ponto } from '@/mocks/eventos'

export type OrigemLocalizacao = 'padrao' | 'navegador' | 'indisponivel'

export function useLocalizacao() {
  const [posicao, definirPosicao] = useState<Ponto>(pontoPadrao)
  const [origem, definirOrigem] = useState<OrigemLocalizacao>('padrao')

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      definirOrigem('indisponivel')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (resultado) => {
        definirPosicao({ lat: resultado.coords.latitude, lng: resultado.coords.longitude })
        definirOrigem('navegador')
      },
      () => definirOrigem('indisponivel'),
      { maximumAge: 300000, timeout: 8000 },
    )
  }, [])

  return { posicao, origem }
}
