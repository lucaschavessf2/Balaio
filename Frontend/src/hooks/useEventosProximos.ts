import { useEffect, useMemo, useState } from 'react'
import { distanciaKm, type Evento } from '@/mocks/eventos'
import { listarEventos } from '@/services/api/eventos.servico'
import { useLocalizacao } from '@/hooks/useLocalizacao'
import type { PontoEvento } from '@/components/eventos/MapaEventos'

export type EventoComDistancia = { evento: Evento; distancia: number }

export function useEventosProximos() {
  const { posicao, origem } = useLocalizacao()
  const [locais, definirLocais] = useState<Evento[]>([])

  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)
  useEffect(() => {
    let vivo = true
    listarEventos().then((resposta) => {
      if (!vivo) return
      definirLocais(resposta.dados ?? [])
      definirErro(resposta.erro?.mensagem ?? null)
      definirCarregando(false)
    })
    return () => { vivo = false }
  }, [])

  const ordenados = useMemo<EventoComDistancia[]>(
    () =>
      locais
        .map((evento) => ({ evento, distancia: distanciaKm(posicao, evento) }))
        .sort((a, b) => a.distancia - b.distancia),
    [locais, posicao],
  )

  const pontos = useMemo<PontoEvento[]>(
    () =>
      ordenados.map(({ evento }) => ({
        slug: evento.slug,
        nome: evento.nome,
        cidade: evento.cidade,
        periodo: evento.periodo,
        lat: evento.lat,
        lng: evento.lng,
        proprio: evento.criadoPorVoce,
      })),
    [ordenados],
  )

  return { ordenados, pontos, posicao, origem, carregando, erro }
}

export function notaDeLocalizacao(origem: 'padrao' | 'navegador' | 'indisponivel'): string {
  return origem === 'navegador'
    ? 'Distâncias calculadas a partir da sua localização.'
    : 'Ative a localização do navegador para ver as distâncias a partir de onde você está. Por enquanto, calculamos a partir do Recife.'
}
