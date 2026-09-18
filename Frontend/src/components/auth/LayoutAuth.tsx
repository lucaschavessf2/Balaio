import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeCheck } from '@/components/ui/Icones'

type Trilha = Parameters<typeof Migalhas>[0]['trilha']

type Props = {
  trilha: Trilha
  titulo: string
  apoio: ReactNode
  frase: string
  destaques: string[]
  children: ReactNode
  rodape?: ReactNode
}

export default function LayoutAuth({ trilha, titulo, apoio, frase, destaques, children, rodape }: Props) {
  return (
    <Pagina>
      <Migalhas trilha={trilha} />

      <div className="auth-dividida">
        <aside className="auth-marca">
          <div className="auth-marca-topo">
            <img className="auth-marca-logo" src="/balaio-logo.svg" alt="" width={56} height={56} />
            <p className="auth-marca-nome">Balaio</p>
          </div>
          <p className="auth-marca-frase">{frase}</p>
          <ul className="auth-marca-lista">
            {destaques.map((destaque) => (
              <li key={destaque}>
                <IconeCheck tamanho={15} />
                {destaque}
              </li>
            ))}
          </ul>
        </aside>

        <section className="auth-painel">
          <h1 className="auth-titulo">{titulo}</h1>
          <p className="autoria auth-apoio">{apoio}</p>

          {children}

          {rodape && <div className="auth-alternativa">{rodape}</div>}
        </section>
      </div>
    </Pagina>
  )
}
