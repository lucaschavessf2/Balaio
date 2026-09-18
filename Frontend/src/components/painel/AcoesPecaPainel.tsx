'use client'

import { useRouter } from 'next/navigation'
import { avisar } from '@/components/feedback/Avisos'
import { atualizarPeca, excluirPeca } from '@/services/api/pecas.servico'
import type { Peca } from '@/types/dominio'

export default function AcoesPecaPainel({ slug, situacao }: { slug: string; situacao: Peca['situacao'] }) {
  const roteador = useRouter()
  async function alternarPublicacao() {
    const proxima = situacao === 'publicada' ? 'rascunho' : 'curadoria'
    const resposta = await atualizarPeca(slug, { situacao: proxima })
    if (!resposta.dados) return avisar.erro('Não foi possível atualizar', resposta.erro?.mensagem)
    avisar.sucesso(proxima === 'rascunho' ? 'Peça movida para rascunho' : 'Peça enviada para curadoria')
    roteador.refresh()
  }
  async function excluir() {
    if (!window.confirm('Excluir esta peça definitivamente?')) return
    const resposta = await excluirPeca(slug)
    if (!resposta.dados) return avisar.erro('Não foi possível excluir', resposta.erro?.mensagem)
    avisar.sucesso('Peça excluída')
    roteador.refresh()
  }
  return <div className="acoes-linha"><button type="button" className="botao botao-secundario" onClick={alternarPublicacao}>{situacao === 'publicada' ? 'Mover para rascunho' : 'Enviar para curadoria'}</button><button type="button" className="botao botao-perigo" onClick={excluir}>Excluir</button></div>
}
