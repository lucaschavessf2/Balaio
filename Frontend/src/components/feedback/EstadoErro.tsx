import Link from 'next/link'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { IconeAviso } from '@/components/ui/Icones'

export default function EstadoErro({ mensagem, aoTentarNovamente }: { mensagem?: string; aoTentarNovamente?: () => void }) {
  return (
    <EstadoVazio
      icone={<IconeAviso tamanho={34} />}
      titulo="Não foi possível carregar"
      descricao={mensagem ?? 'Tivemos um problema ao buscar os dados. Tente novamente em instantes.'}
      acao={
        aoTentarNovamente ? <button type="button" className="botao botao-primario" onClick={aoTentarNovamente}>
          Tentar novamente
        </button> : <Link href="/" className="botao botao-primario">
          Voltar ao início
        </Link>
      }
    />
  )
}
