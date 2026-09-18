import Link from 'next/link'
import LayoutPainel from '@/components/painel/LayoutPainel'
import { Foto, Migalhas, SeloDisponibilidade } from '@/components/ui/Basicos'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { emReais } from '@/utils/formato'

const situacoes: Record<string, { texto: string; classe: string }> = {
  publicada: { texto: 'Publicada', classe: 'selo-disponivel' },
  curadoria: { texto: 'Em curadoria', classe: 'selo-encomenda' },
  rascunho: { texto: 'Rascunho', classe: 'selo-neutro' },
}


export default async function MinhasPecas() {
  const { dados: pecas } = await pecasPorArtesao('mestre-nuca')

  return (
    <LayoutPainel ativo="pecas">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Minhas peças' }]} />

      <div className="catalogo-topo" style={{ marginBottom: 8 }}>
        <h1 className="titulo-pagina" style={{ margin: 0 }}>
          Minhas peças
        </h1>
        <Link href="/dashboard/pieces/new" className="botao botao-primario">
          Cadastrar peça
          <IconeSetaDireita />
        </Link>
      </div>
      <p className="subtitulo-pagina">
        Tudo o que você já publicou, o que está em curadoria e o que ficou como rascunho.
      </p>

      {(pecas ?? []).map((peca) => {
        const chave = peca.situacao ?? 'publicada'
        const situacao = situacoes[chave]

        return (
          <article className="linha-pedido" key={peca.slug}>
            <div className="linha-flex encolhivel" style={{ flexWrap: 'nowrap' }}>
              <div className="linha-pedido-figura">
                <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
              </div>
              <div className="encolhivel">
                <p className="dado-valor">{peca.nome}</p>
                <p className="autoria">{peca.tecnica}</p>
              </div>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Preço</span>
              <span className="dado-valor preco-destaque">{emReais(peca.preco)}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Disponibilidade</span>
              <SeloDisponibilidade tipo={peca.disponibilidade} prazoDias={peca.prazoProducaoDias} />
            </div>

            <div className="dado">
              <span className="dado-rotulo">Situação</span>
              <span className={`selo ${situacao.classe}`}>
                <span className="selo-ponto" />
                {situacao.texto}
              </span>
            </div>

            <div className="acoes-linha">
              <Link href={`/pieces/${peca.slug}`} className="botao botao-fantasma">
                Ver na loja
              </Link>
              <Link href="/dashboard/pieces/new" className="botao botao-secundario">
                Cadastrar semelhante
              </Link>
            </div>
          </article>
        )
      })}
    </LayoutPainel>
  )
}
