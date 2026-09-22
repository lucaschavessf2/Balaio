'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { atualizarPeca } from '@/services/api/pecas.servico'
import { avisar } from '@/components/feedback/Avisos'

type Props = { slug: string; nome: string; inativada?: boolean }

export default function InativarPeca({ slug, nome, inativada = false }: Props) {
  const roteador = useRouter()
  const [salvando, definirSalvando] = useState(false)

  async function alterarAtividade() {
    const mensagem = inativada
      ? `Reativar "${nome}"? Ela voltará a aparecer na vitrine e na busca.`
      : `Inativar "${nome}"? Ela deixará de aparecer na vitrine e na busca.`
    if (!window.confirm(mensagem)) return
    definirSalvando(true)
    const resposta = await atualizarPeca(slug, { inativadoEm: inativada ? null : new Date().toISOString() })
    definirSalvando(false)
    if (resposta.erro) {
      avisar.erro('Não foi possível inativar', resposta.erro.mensagem)
      return
    }
    avisar.sucesso(inativada ? 'Peça reativada' : 'Peça inativada')
    roteador.refresh()
  }

  return <button type="button" className="botao botao-fantasma" onClick={() => void alterarAtividade()} disabled={salvando}>{inativada ? 'Reativar' : 'Inativar'}</button>
}