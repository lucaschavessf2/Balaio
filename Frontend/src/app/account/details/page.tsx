'use client'

import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import { IconeCadeado } from '@/components/ui/Icones'
import FormDadosConta from '@/components/forms/FormDadosConta'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import EstadoErro from '@/components/feedback/EstadoErro'
import { usePerfilConta } from '@/hooks/usePerfilConta'
import { usePedidosConta } from '@/hooks/usePedidosConta'
import { useSessao } from '@/store/sessao'

export default function DadosDaConta() {
  const { sessao, estado, versao } = useSessao()
  const { perfil, erro, carregando, recarregar } = usePerfilConta()
  const { pedidos } = usePedidosConta()
  if (!sessao || estado !== 'autenticada') return null

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Meus dados' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="dados" usuario={sessao} totalPedidos={pedidos?.length} />
      </MenuDrawer>

      <h1 className="titulo-pagina">Meus dados</h1>
      <p className="subtitulo-pagina">Seu nome, contatos e a senha de acesso.</p>

      <div className="conta-hub">
        {carregando ? <EstadoCarregando rotulo="Carregando seus dados…" cartoes={1} /> : erro ? (
          <EstadoErro mensagem={erro} />
        ) : perfil && (
          <FormDadosConta key={`${versao}:${sessao.id}`} usuario={perfil} aoSalvar={recarregar} />
        )}

        <section className="cartao" id="seguranca">
          <h2 className="secao-titulo">Segurança</h2>
          <p className="autoria abaixo-3">Use a recuperação de acesso se precisar definir uma nova senha.</p>
          <Link href="/login/recover" className="botao botao-secundario botao-largo">
            <IconeCadeado />
            Alterar senha
          </Link>
        </section>
      </div>
    </Pagina>
  )
}
