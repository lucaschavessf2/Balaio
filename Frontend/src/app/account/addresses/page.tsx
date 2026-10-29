'use client'

import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import EnderecosEntrega from '@/components/forms/EnderecosEntrega'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import EstadoErro from '@/components/feedback/EstadoErro'
import { usePerfilConta } from '@/hooks/usePerfilConta'
import { usePedidosConta } from '@/hooks/usePedidosConta'
import { useSessao } from '@/store/sessao'

export default function EnderecosDaConta() {
  const { sessao, estado, versao } = useSessao()
  const { perfil, erro, carregando } = usePerfilConta()
  const { pedidos } = usePedidosConta()
  if (!sessao || estado !== 'autenticada') return null

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Endereços' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="enderecos" usuario={sessao} totalPedidos={pedidos?.length} />
      </MenuDrawer>

      <h1 className="titulo-pagina">Endereços de entrega</h1>
      <p className="subtitulo-pagina">Onde você costuma receber as suas peças.</p>

      {carregando ? <EstadoCarregando rotulo="Carregando seus endereços…" cartoes={1} /> : erro ? (
        <EstadoErro mensagem={erro} />
      ) : perfil && (
        <div className="conta-hub">
          <EnderecosEntrega key={`${versao}:${sessao.id}`} iniciais={perfil.enderecos ?? []} />
        </div>
      )}
    </Pagina>
  )
}
