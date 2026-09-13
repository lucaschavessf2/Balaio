import { useEffect, useState } from 'react'
import { obterReferencias, type Referencias } from '@/services/api/referencias.servico'

const VAZIO: Referencias = { tecnicas: [], territorios: [], categorias: [], etiquetas: [] }

export function useReferencias() {
  const [referencias, definirReferencias] = useState<Referencias>(VAZIO)
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    obterReferencias().then((resposta) => {
      if (!vivo) return
      if (resposta.erro) definirErro(resposta.erro.mensagem)
      else if (resposta.dados) definirReferencias(resposta.dados)
      definirCarregando(false)
    })
    return () => {
      vivo = false
    }
  }, [])

  return { ...referencias, carregando, erro }
}
