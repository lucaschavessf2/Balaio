import Link from 'next/link'
import { Retrato } from '@/components/ui/Basicos'
import BotaoSair from '@/components/conta/BotaoSair'
import { IconeCadeado, IconeCoracao, IconeMapa, IconePacote, IconePincel, IconeUsuario } from '@/components/ui/Icones'
import type { Usuario } from '@/mocks/usuario'

export type ChaveConta = 'pedidos' | 'favoritos' | 'enderecos' | 'dados'

export default function MenuConta({ ativo, usuario, totalPedidos = 0 }: { ativo?: ChaveConta; usuario: Usuario; totalPedidos?: number }) {
  return (
    <nav className="menu-lateral" aria-label="Minha conta">
      <div className="menu-oficina">
        <Retrato imagem={usuario.imagem} tamanho={44} />
        <div className="encolhivel">
          <p className="menu-oficina-nome">{usuario.nome}</p>
          <p className="menu-oficina-local">{usuario.email}</p>
        </div>
      </div>

      <div className="menu-grupo">
        <Link
          href="/orders"
          className={`menu-item${ativo === 'pedidos' ? ' menu-item-ativo' : ''}`}
          aria-current={ativo === 'pedidos' ? 'page' : undefined}
        >
          <IconePacote />
          Meus pedidos
          <span className="menu-marcador">{totalPedidos}</span>
        </Link>
        <Link
          href="/favorites"
          className={`menu-item${ativo === 'favoritos' ? ' menu-item-ativo' : ''}`}
          aria-current={ativo === 'favoritos' ? 'page' : undefined}
        >
          <IconeCoracao />
          Peças salvas
        </Link>
        <Link
          href="/account/addresses"
          className={`menu-item${ativo === 'enderecos' ? ' menu-item-ativo' : ''}`}
          aria-current={ativo === 'enderecos' ? 'page' : undefined}
        >
          <IconeMapa />
          Endereços de entrega
        </Link>
        <Link
          href="/account/details"
          className={`menu-item${ativo === 'dados' ? ' menu-item-ativo' : ''}`}
          aria-current={ativo === 'dados' ? 'page' : undefined}
        >
          <IconeUsuario />
          Meus dados
        </Link>
        <Link href="/login/recover" className="menu-item">
          <IconeCadeado />
          Alterar senha
        </Link>
        <Link href="/dashboard" className="menu-item">
          <IconePincel />
          Painel do artesão
        </Link>
        <BotaoSair />
      </div>
    </nav>
  )
}
