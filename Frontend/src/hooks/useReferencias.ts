import { useCallback, useEffect, useState } from 'react'
import { obterReferencias, type Referencias } from '@/services/api/referencias.servico'

const VAZIO: Referencias = { tecnicas: [], territorios: [], categorias: [], tipos: [], etiquetas: [] }

export function useReferencias() {
  const [referencias, definirReferencias] = useState<Referencias>(VAZIO)
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)
  const [tentativa, definirTentativa] = useState(0)

  const recarregar = useCallback(() => {
    definirCarregando(true)
    definirErro(null)
    definirTentativa((atual) => atual + 1)
  }, [])

  useEffect(() => {
    let vivo = true
    obterReferencias().then((resposta) => {
      if (!vivo) return
      if (resposta.erro || !resposta.dados) definirErro(resposta.erro?.mensagem ?? 'Não foi possível carregar as opções do formulário.')
      else definirReferencias(resposta.dados)
      definirCarregando(false)
    }).catch(() => {
      if (!vivo) return
      definirErro('Não foi possível carregar as opções do formulário. Tente novamente.')
      definirCarregando(false)
    })
    return () => {
      vivo = false
    }
  }, [tentativa])

  return { ...referencias, carregando, erro, recarregar }
}
