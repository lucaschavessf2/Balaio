import { useEffect, useMemo, useState } from 'react'
import { listarPecas } from '@/services/api/pecas.servico'
import type { Peca } from '@/types/dominio'

export function usePecas() {
  const [pecas, definirPecas] = useState<Peca[]>([])
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true

    async function carregar() {
      const todas: Peca[] = []
      let pagina = 1
      let totalPaginas = 1
      try {
        do {
          const resposta = await listarPecas({ pagina, tamanho: 100 })
          if (!vivo) return
          if (resposta.erro) {
            definirErro(resposta.erro.mensagem)
            return
          }
          todas.push(...resposta.dados ?? [])
          totalPaginas = resposta.paginacao?.totalPaginas ?? 1
          pagina++
        } while (pagina <= totalPaginas)
        definirPecas([...new Map(todas.map((peca) => [peca.slug, peca])).values()])
      } catch {
        if (vivo) definirErro('Não foi possível carregar as peças. Tente novamente.')
      } finally {
        if (vivo) definirCarregando(false)
      }
    }

    void carregar()
    return () => {
      vivo = false
    }
  }, [])

  const mapaPecas = useMemo(() => new Map(pecas.map((p) => [p.slug, p])), [pecas])

  return { pecas, mapaPecas, carregando, erro }
}
