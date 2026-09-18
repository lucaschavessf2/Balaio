import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Migalhas, Retrato } from '@/components/ui/Basicos'
import BotaoSair from '@/components/conta/BotaoSair'
import {
  IconeCadeado,
  IconeCoracao,
  IconeMapa,
  IconePacote,
  IconePincel,
  IconeSetaDireita,
  IconeUsuario,
} from '@/components/ui/Icones'
import { listarPedidos } from '@/services/api/pedidos.servico'
import { exigirSessao } from '@/services/autenticacao'

export default async function Conta() {
  const { usuario: usuarioAtual, token } = await exigirSessao()
  const { dados: pedidos } = await listarPedidos(token)
  const totalPedidos = (pedidos ?? []).length
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta' }]} />

      <h1 className="titulo-pagina">Minha conta</h1>
      <p className="subtitulo-pagina">Seus pedidos, dados e endereços num lugar só.</p>

      <div className="conta-hub">
        <header className="cartao conta-capa">
          <Retrato imagem={usuarioAtual.imagem} grande />
          <div className="encolhivel">
            <p className="conta-capa-nome">{usuarioAtual.nome}</p>
            <p className="autoria">{usuarioAtual.email}</p>
          </div>
        </header>

        <nav className="cartao lista-menu" aria-label="Minha conta">
          <Link href="/orders" className="menu-item">
            <IconePacote />
            Meus pedidos
            <span className="menu-marcador">{totalPedidos}</span>
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <Link href="/favorites" className="menu-item">
            <IconeCoracao />
            Peças salvas
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <Link href="/account/addresses" className="menu-item">
            <IconeMapa />
            Endereços de entrega
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <Link href="/account/details" className="menu-item">
            <IconeUsuario />
            Meus dados
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <Link href="/login/recover" className="menu-item">
            <IconeCadeado />
            Alterar senha
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <Link href="/dashboard" className="menu-item">
            <IconePincel />
            Painel do artesão
            <span className="menu-item-seta">
              <IconeSetaDireita />
            </span>
          </Link>
          <BotaoSair />
        </nav>
      </div>
    </Pagina>
  )
}
