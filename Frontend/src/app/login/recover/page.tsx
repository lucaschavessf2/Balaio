import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormRecuperar from '@/components/forms/FormRecuperar'
import { IconeCadeado } from '@/components/ui/Icones'

export default function Recuperar() {
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar', href: '/login' }, { texto: 'Recuperar senha' }]} />

      <div className="tela-estreita">
        <header className="cabeca-auth">
          <span className="cabeca-auth-icone">
            <IconeCadeado tamanho={26} />
          </span>
          <h1 className="titulo-pagina">Recuperar sua senha</h1>
          <p className="subtitulo-pagina">
            Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.
          </p>
        </header>

        <FormRecuperar />

        <div className="cartao ajuda-auth">
          <p className="campo-rotulo linha-flex abaixo-3">
            <IconeCadeado tamanho={16} />
            Não consegue acessar o e-mail?
          </p>
          <p className="autoria abaixo-3">
            Se você é artesão e se cadastrou com ajuda da associação do seu território, ela pode solicitar a recuperação
            por você.
          </p>
          <p className="autoria">Também dá para falar com a gente pelo suporte. Respondemos em até um dia útil.</p>
        </div>
      </div>
    </Pagina>
  )
}
