import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormCadastro from '@/components/forms/FormCadastro'
import { IconeCadeado, IconeUsuario } from '@/components/ui/Icones'
import { obterReferencias } from '@/services/api/referencias.servico'

export const metadata = {
  title: 'Criar conta no Balaio',
  description: 'Cadastro de comprador ou artesão no Balaio.',
}

export default async function Cadastrar() {
  const { dados } = await obterReferencias()

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar', href: '/login' }, { texto: 'Criar conta' }]}
      />

      <div className="tela-estreita">
        <header className="cabeca-auth">
          <span className="cabeca-auth-icone">
            <IconeUsuario tamanho={26} />
          </span>
          <h1 className="titulo-pagina">Criar sua conta</h1>
          <p className="subtitulo-pagina">
            Leva menos de dois minutos. O que pedimos muda conforme você vem comprar ou vender.
          </p>
        </header>

        <FormCadastro tecnicas={dados?.tecnicas ?? []} territorios={dados?.territorios ?? []} />

        <div className="cartao ajuda-auth">
          <p className="aviso">
            <IconeCadeado />
            <span>
              <strong>Não exigimos formalização.</strong> Artesãos informais vendem normalmente. A plataforma ajuda com
              a nota quando ela for necessária.
            </span>
          </p>
        </div>
      </div>
    </Pagina>
  )
}
