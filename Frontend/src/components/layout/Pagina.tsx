import type { ReactNode } from 'react'
import Cabecalho from '@/components/layout/Cabecalho'
import CabecalhoMobile from '@/components/navegacao/CabecalhoMobile'
import NavegacaoInferior from '@/components/navegacao/NavegacaoInferior'
import Rodape from '@/components/layout/Rodape'

type Props = { children: ReactNode; comoArtesao?: boolean }

export default function Pagina({ children, comoArtesao = false }: Props) {
  return (
    <div className="pagina">
      <a className="pular-para-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho comoArtesao={comoArtesao} />
      <CabecalhoMobile />
      <main id="conteudo" className="conteudo">
        <div className="container">{children}</div>
      </main>
      <Rodape />
      <NavegacaoInferior comoArtesao={comoArtesao} />
    </div>
  )
}
