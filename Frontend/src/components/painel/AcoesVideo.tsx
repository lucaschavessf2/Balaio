'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { removerVideo } from '@/services/api/videos.servico'

export default function AcoesVideo({ id, publicado }: { id: string; publicado: boolean }) {
  const roteador = useRouter()
  const [confirmando, definirConfirmando] = useState(false)
  const [removendo, definirRemovendo] = useState(false)
  const refConfirmar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (confirmando) refConfirmar.current?.focus()
  }, [confirmando])

  async function remover() {
    definirRemovendo(true)
    const resposta = await removerVideo(id)
    definirRemovendo(false)
    if (resposta.erro) {
      avisar.erro('Não foi possível remover o vídeo', resposta.erro.mensagem)
      return
    }
    avisar.sucesso('Vídeo removido')
    roteador.refresh()
  }

  if (confirmando) {
    return (
      <div className="video-painel-acoes">
        <p className="video-painel-pergunta" role="status">
          Remover este vídeo? Os comentários também serão apagados, e isso não pode ser desfeito.
        </p>
        <button ref={refConfirmar} type="button" className="botao botao-perigo" disabled={removendo} onClick={() => void remover()}>
          {removendo ? 'Removendo…' : 'Confirmar remoção'}
        </button>
        <button type="button" className="botao botao-fantasma" disabled={removendo} onClick={() => definirConfirmando(false)}>
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="video-painel-acoes">
      <Link href={`/dashboard/videos/${encodeURIComponent(id)}`} className="botao botao-secundario">Editar</Link>
      <button type="button" className="botao botao-fantasma" onClick={() => definirConfirmando(true)}>Remover</button>
      {publicado && (
        <Link href={`/videos#${id}`} className="prateleira-ver-todos">
          Ver no ateliê
          <IconeSetaDireita tamanho={14} />
        </Link>
      )}
    </div>
  )
}
