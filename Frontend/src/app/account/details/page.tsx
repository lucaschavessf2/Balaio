import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import FormDadosConta from '@/components/conta/FormDadosConta'
import FormAlterarSenha from '@/components/conta/FormAlterarSenha'
import { exigirSessao } from '@/services/sessao/servidor'

export default async function DadosDaConta() {
  await exigirSessao('/account/details')

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Meus dados' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="dados" />
      </MenuDrawer>

      <h1 className="titulo-pagina">Meus dados</h1>
      <p className="subtitulo-pagina">Seu nome, contatos e a senha de acesso.</p>

      <div className="conta-hub">
        <FormDadosConta />
        <FormAlterarSenha />
      </div>
    </Pagina>
  )
}
