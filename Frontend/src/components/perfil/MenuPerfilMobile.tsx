'use client'

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import ConteudoMenuPerfil from '@/components/perfil/ConteudoMenuPerfil'
import { IconeFechar, IconeUsuario } from '@/components/ui/Icones'
import { useResumoPerfil } from '@/hooks/useResumoPerfil'
import { useSessao } from '@/store/sessao'
import { nomeCurto } from '@/utils/nome'

const LARGURA_DO_CABECALHO_DESKTOP = '(min-width: 700px)'

export default function MenuPerfilMobile({ ativo }: { ativo: boolean }) {
  const { sessao } = useSessao()
  const [aberto, definirAberto] = useState(false)
  const resumo = useResumoPerfil(sessao, aberto)
  const dialogo = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()
  const rotulo = sessao ? nomeCurto(sessao.nome) : 'Entrar'

  useEffect(() => {
    const telaLarga = window.matchMedia(LARGURA_DO_CABECALHO_DESKTOP)
    function fecharSeVirarDesktop(evento: MediaQueryListEvent) {
      if (evento.matches) dialogo.current?.close()
    }
    telaLarga.addEventListener('change', fecharSeVirarDesktop)
    return () => telaLarga.removeEventListener('change', fecharSeVirarDesktop)
  }, [])

  function abrir() {
    dialogo.current?.showModal()
    definirAberto(true)
  }

  function cliqueNoDialogo(evento: MouseEvent<HTMLDialogElement>) {
    const alvo = dialogo.current
    if (!alvo) return
    const clicouNoFundo = evento.target === alvo
    const escolheuItem = Boolean((evento.target as HTMLElement).closest('.folha-perfil-conteudo a, .folha-perfil-conteudo button'))
    if (clicouNoFundo || escolheuItem) alvo.close()
  }

  return (
    <>
      <button
        type="button"
        className="nav-inferior-item"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-current={ativo ? 'page' : undefined}
        onClick={abrir}
      >
        <span className="nav-inferior-icone">
          <IconeUsuario tamanho={22} />
        </span>
        <span className="nav-inferior-texto">{rotulo}</span>
      </button>

      <dialog
        ref={dialogo}
        className="folha-perfil"
        aria-labelledby={idTitulo}
        onClick={cliqueNoDialogo}
        onClose={() => definirAberto(false)}
      >
        <div className="folha-perfil-cabecalho">
          <span className="folha-perfil-alca" aria-hidden />
          <button type="button" className="drawer-fechar" aria-label="Fechar menu" onClick={() => dialogo.current?.close()}>
            <IconeFechar tamanho={20} />
          </button>
        </div>
        <div className="folha-perfil-conteudo">
          <ConteudoMenuPerfil sessao={sessao} resumo={resumo} idTitulo={idTitulo} />
        </div>
      </dialog>
    </>
  )
}
