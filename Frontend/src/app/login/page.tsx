import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormEntrar from '@/components/forms/FormEntrar'
import { IconeCheck } from '@/components/ui/Icones'

const promessas = [
  'Origem e autoria verificadas em cada peça',
  'Converse com o artesão antes de comprar',
  'O repasse só chega ao ateliê depois da entrega',
]

export default function Entrar() {
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar' }]} />

      <div className="auth-dividida">
        <aside className="auth-marca">
          <div className="auth-marca-topo">
            <img className="auth-marca-logo" src="/balaio-logo.svg" alt="" width={56} height={56} />
            <p className="auth-marca-nome">Balaio</p>
          </div>
          <p className="auth-marca-frase">Do barro, da linha e da madeira de Pernambuco, direto de quem faz.</p>
          <ul className="auth-marca-lista">
            {promessas.map((promessa) => (
              <li key={promessa}>
                <IconeCheck tamanho={15} />
                {promessa}
              </li>
            ))}
          </ul>
        </aside>

        <section className="auth-painel">
          <h1 className="auth-titulo">Entrar</h1>
          <p className="autoria auth-apoio">
            Uma conta só para comprar, vender e acompanhar seus pedidos. Este é um protótipo de interface: o acesso é
            de demonstração.
          </p>

          <FormEntrar />

          <p className="auth-alternativa">
            Ainda não tem conta? <Link href="/login/register">Criar conta</Link>
          </p>
        </section>
      </div>
    </Pagina>
  )
}
