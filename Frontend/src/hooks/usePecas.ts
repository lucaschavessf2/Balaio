import { useEffect, useMemo, useState } from 'react'
import { listarPecas } from '@/services/api/pecas.servico'
import type { Peca } from '@/types/dominio'

export function usePecas() {
  const [pecas, definirPecas] = useState<Peca[]>([])
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    listarPecas().then((resposta) => {
      if (!vivo) return
      if (resposta.erro) definirErro(resposta.erro.mensagem)
      else definirPecas(resposta.dados ?? [])
      definirCarregando(false)
    })
    return () => {
      vivo = false
    }
  }, [])

  const mapaPecas = useMemo(() => new Map(pecas.map((p) => [p.slug, p])), [pecas])

  return { pecas, mapaPecas, carregando, erro }
}
