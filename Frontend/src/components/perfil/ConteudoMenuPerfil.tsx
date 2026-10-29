'use client'

import Link from 'next/link'
import BotaoSair from '@/components/conta/BotaoSair'
import { Retrato } from '@/components/ui/Basicos'
import { IconeCadeado, IconeCoracao, IconeMapa, IconePacote, IconeUsuario } from '@/components/ui/Icones'
import type { ResumoPerfil } from '@/hooks/useResumoPerfil'
import type { Sessao } from '@/services/sessao/cookie'
import { useFavoritos } from '@/store/favoritos'

type Props = {
  sessao: Sessao | null
  resumo: ResumoPerfil
  idTitulo: string
}

export default function ConteudoMenuPerfil({ sessao, idTitulo }: Props) {
  const { slugs, pronto } = useFavoritos()

  if (!sessao) {
    return (
      <div className="menu-perfil-conteudo">
        <div className="menu-perfil-topo">
          <div className="encolhivel">
            <p className="menu-perfil-nome" id={idTitulo}>Boas-vindas ao Balaio</p>
            <p className="menu-perfil-detalhe">Entre para acessar sua conta.</p>
          </div>
        </div>
        <div className="menu-perfil-acoes">
          <Link href="/login" className="botao botao-primario">Entrar</Link>
          <Link href="/login/register" className="botao botao-secundario">Criar conta</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="menu-perfil-conteudo">
      <div className="menu-perfil-topo">
        <Retrato imagem={sessao.imagem} tamanho={44} />
        <div className="encolhivel">
          <p className="menu-perfil-nome" id={idTitulo}>{sessao.nome}</p>
          <p className="menu-perfil-detalhe">{sessao.email}</p>
        </div>
      </div>

      <div className="menu-perfil-grupo">
        <Link href="/account" className="menu-item">
          <IconeUsuario />
          Minha conta
        </Link>
        <Link href="/orders" className="menu-item">
          <IconePacote />
          Meus pedidos
        </Link>
        <Link href="/favorites" className="menu-item">
          <IconeCoracao />
          Peças salvas
          {pronto && <span className="menu-marcador">{slugs.length}</span>}
        </Link>
        <Link href="/account/addresses" className="menu-item">
          <IconeMapa />
          Endereços de entrega
        </Link>
        <Link href="/account/details" className="menu-item">
          <IconeUsuario />
          Meus dados
        </Link>
        <Link href="/account/details#seguranca" className="menu-item">
          <IconeCadeado />
          Alterar senha
        </Link>
      </div>

      <div className="menu-perfil-grupo">
        <BotaoSair />
      </div>
    </div>
  )
}
