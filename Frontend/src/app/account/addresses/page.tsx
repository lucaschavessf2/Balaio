import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import EnderecosEntrega from '@/components/forms/EnderecosEntrega'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import { exigirUsuario } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'

const enderecos = [
  {
    apelido: 'Casa',
    principal: true,
    linhas: ['Rua da Aurora, 240, apto 902', 'Boa Vista, Recife, PE', 'CEP 52021-030'],
  },
  {
    apelido: 'Trabalho',
    principal: false,
    linhas: ['Av. Conselheiro Aguiar, 1580, sala 4', 'Boa Viagem, Recife, PE', 'CEP 51111-010'],
  },
]

export default async function EnderecosDaConta() {
  const [usuario, { dados: pedidos }] = await Promise.all([exigirUsuario(), listarPedidos()])
  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Endereços' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="enderecos" usuario={usuario} totalPedidos={pedidos?.length ?? 0} />
      </MenuDrawer>

      <h1 className="titulo-pagina">Endereços de entrega</h1>
      <p className="subtitulo-pagina">Onde você costuma receber as suas peças.</p>

      <div className="conta-hub">
        <EnderecosEntrega iniciais={enderecos} />
      </div>
    </Pagina>
  )
}
