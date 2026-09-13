import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import CatalogoFiltrado from '@/components/produto/CatalogoFiltrado'
import BuscaComSugestoes from '@/components/produto/BuscaComSugestoes'
import { EstadoVazio, Migalhas } from '@/components/ui/Basicos'
import EstadoErro from '@/components/feedback/EstadoErro'
import { IconeBusca } from '@/components/ui/Icones'
import { tecnicas } from '@/constants/referencias'
import { artesaos } from '@/mocks/artesaos'
import { listarPecas } from '@/services/api/pecas.servico'
import { obterReferencias } from '@/services/api/referencias.servico'

type Props = { searchParams: Promise<{ q?: string }> }

async function montarSugestoes() {
  const [pecasResp, refs] = await Promise.all([listarPecas(), obterReferencias()])
  const nomesPecas = (pecasResp.dados ?? []).map((p) => p.nome)
  const referencias = refs.dados
  const base = referencias
    ? [...referencias.tecnicas, ...referencias.territorios, ...referencias.categorias]
    : []
  return Array.from(new Set([...nomesPecas, ...base, ...artesaos.map((a) => a.nome)]))
}

export default async function Busca({ searchParams }: Props) {
  const { q: qOriginal = '' } = await searchParams
  const q = qOriginal.slice(0, 80)
  const [{ dados, erro }, sugestoes] = await Promise.all([listarPecas({ q }), montarSugestoes()])
  const resultados = dados ?? []

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Busca' }]} />

      <h1 className="titulo-pagina">{q ? `Resultados para "${q}"` : 'Explorar o catálogo'}</h1>
      <p className="subtitulo-pagina">
        Busque por técnica, território, categoria ou pelo nome da peça e do artesão.
      </p>

      <BuscaComSugestoes consultaAtual={q} sugestoes={sugestoes} />

      {erro ? (
        <EstadoErro mensagem={erro.mensagem} />
      ) : resultados.length > 0 ? (
        <CatalogoFiltrado key={q} pecas={resultados} />
      ) : (
        <EstadoVazio
          icone={<IconeBusca tamanho={34} />}
          titulo="Não encontramos peças com esse termo"
          descricao="Tente uma técnica, um território ou o nome de um artesão. Você também pode começar por uma das técnicas abaixo."
          acao={
            <div className="acoes-linha" style={{ justifyContent: 'center' }}>
              {tecnicas.slice(0, 3).map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="botao botao-secundario">
                  {t}
                </Link>
              ))}
            </div>
          }
        />
      )}
    </Pagina>
  )
}
