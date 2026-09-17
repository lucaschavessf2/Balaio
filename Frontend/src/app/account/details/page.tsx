import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import { IconeCadeado } from '@/components/ui/Icones'
import { exigirUsuario } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'
import FormDadosConta from '@/components/forms/FormDadosConta'

export default async function DadosDaConta() {
  const [usuario, { dados: pedidos }] = await Promise.all([exigirUsuario(), listarPedidos()])
  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Meus dados' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="dados" usuario={usuario} totalPedidos={pedidos?.length ?? 0} />
      </MenuDrawer>

      <h1 className="titulo-pagina">Meus dados</h1>
      <p className="subtitulo-pagina">Seu nome, contatos e preferências de compra.</p>

      <div className="conta-hub">
        <FormDadosConta usuario={usuario} />

        <div className="cartao">
          <h2 className="secao-titulo">Segurança</h2>
          <p className="autoria abaixo-3">Use a recuperação de acesso se precisar definir uma nova senha.</p>
          <Link href="/login/recover" className="botao botao-secundario botao-largo">
            <IconeCadeado />
            Alterar senha
          </Link>
        </div>
      </div>
    </Pagina>
  )
}
