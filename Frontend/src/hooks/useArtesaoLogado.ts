'use client'

import { useEffect, useState } from 'react'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { listarConversasArtesao, listarPedidosPendentes } from '@/services/api/pedidos.servico'
import type { ContagensPainel } from '@/components/painel/itensPainel'
import { useSessao } from '@/store/sessao'
import type { Artesao } from '@/types/dominio'

const EVENTO_ARTESAO_ATUALIZADO = 'balaio:artesao-atualizado'
const EVENTO_PAINEL_ATUALIZADO = 'balaio:painel-atualizado'

export function avisarArtesaoAtualizado(artesao: Artesao) {
  window.dispatchEvent(new CustomEvent<Artesao>(EVENTO_ARTESAO_ATUALIZADO, { detail: artesao }))
}

export function avisarPainelAtualizado() {
  window.dispatchEvent(new Event(EVENTO_PAINEL_ATUALIZADO))
}

export function useArtesaoLogado(): Artesao | null {
  const { sessao } = useSessao()
  const slug = sessao?.artesao
  const [artesao, definirArtesao] = useState<Artesao | null>(null)

  useEffect(() => {
    if (!slug) return
    let vivo = true
    obterArtesao(slug).then(({ dados }) => {
      if (vivo) definirArtesao(dados)
    })
    function aoAtualizar(evento: Event) {
      const atualizado = (evento as CustomEvent<Artesao>).detail
      if (atualizado.slug === slug) definirArtesao(atualizado)
    }
    window.addEventListener(EVENTO_ARTESAO_ATUALIZADO, aoAtualizar)
    return () => {
      vivo = false
      window.removeEventListener(EVENTO_ARTESAO_ATUALIZADO, aoAtualizar)
    }
  }, [slug])

  return slug && artesao?.slug === slug ? artesao : null
}

export function useContagensPainel(): ContagensPainel {
  const { sessao } = useSessao()
  const slug = sessao?.artesao
  const [contagens, definirContagens] = useState<ContagensPainel>({ pendentes: 0, naoLidas: 0 })

  useEffect(() => {
    if (!slug) return
    let vivo = true
    function carregar() {
      Promise.all([listarPedidosPendentes(slug), listarConversasArtesao(slug)]).then(([pendentes, conversas]) => {
        if (!vivo) return
        definirContagens({
          pendentes: pendentes.dados?.length ?? 0,
          naoLidas: (conversas.dados ?? []).filter((c) => c.naoLida).length,
        })
      })
    }
    carregar()
    window.addEventListener(EVENTO_PAINEL_ATUALIZADO, carregar)
    return () => {
      vivo = false
      window.removeEventListener(EVENTO_PAINEL_ATUALIZADO, carregar)
    }
  }, [slug])

  return contagens
}
