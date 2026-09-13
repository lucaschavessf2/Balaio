import Link from 'next/link'
import { EstadoVazio } from '@/components/ui/Basicos'
import { IconeAviso } from '@/components/ui/Icones'

export default function EstadoErro({ mensagem }: { mensagem?: string }) {
  return (
    <EstadoVazio
      icone={<IconeAviso tamanho={34} />}
      titulo="Não foi possível carregar"
      descricao={mensagem ?? 'Tivemos um problema ao buscar os dados. Tente novamente em instantes.'}
      acao={
        <Link href="/" className="botao botao-primario">
          Voltar ao início
        </Link>
      }
    />
  )
}
