import type { ReactNode } from 'react'
import Cabecalho from '@/components/layout/Cabecalho'
import CabecalhoMobile from '@/components/navegacao/CabecalhoMobile'
import NavegacaoInferior from '@/components/navegacao/NavegacaoInferior'
import Rodape from '@/components/layout/Rodape'

export default function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="pagina">
      <a className="pular-para-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <CabecalhoMobile />
      <main id="conteudo" className="conteudo">
        <div className="container">{children}</div>
      </main>
      <Rodape />
      <NavegacaoInferior />
    </div>
  )
}
