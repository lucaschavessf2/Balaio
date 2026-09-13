import Link from 'next/link'
import { Foto, Retrato } from '@/components/ui/Basicos'
import BotaoFavoritar from '@/components/produto/BotaoFavoritar'
import { IconeEstrela } from '@/components/ui/Icones'
import { acharArtesao } from '@/mocks/artesaos'
import { type Peca } from '@/types/dominio'
import { emReais, precoComDesconto } from '@/utils/formato'

function PrecoGrande({ valor }: { valor: number }) {
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)
  return (
    <span className="preco-grande">
      <span className="so-leitor">{emReais(valor)}</span>
      <span aria-hidden>
        R$ {inteiro.toLocaleString('pt-BR')}
        {centavos > 0 && <sup className="preco-centavos">{String(centavos).padStart(2, '0')}</sup>}
      </span>
    </span>
  )
}

export default function CartaoPeca({ peca }: { peca: Peca }) {
  const artesao = acharArtesao(peca.artesao)

  return (
    <article className="cartao-peca">
      <div className="cartao-peca-figura">
        <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
      </div>
      <div className="cartao-peca-corpo">
        <span className="territorio">{peca.territorio}</span>
        <h3 className="cartao-peca-nome">
          <Link href={`/pieces/${peca.slug}`} className="cartao-peca-link">
            {peca.nome}
          </Link>
        </h3>
        <span className="autoria autoria-com-retrato">
          <Retrato imagem={artesao?.imagem} tamanho={20} />
          por {artesao?.nome ?? 'Artesão parceiro'}
        </span>

        {peca.avaliacao && (
          <span className="avaliacao-compacta">
            <IconeEstrela tamanho={14} />
            <strong>{peca.avaliacao.toFixed(1)}</strong>
            <span className="texto-suave">
              · {peca.totalAvaliacoes} {peca.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
            </span>
          </span>
        )}

        <div className="cartao-peca-precos">
          {peca.desconto && <span className="preco-riscado">{emReais(peca.preco)}</span>}
          <span className="linha-preco-grande">
            <PrecoGrande valor={precoComDesconto(peca)} />
            {peca.desconto && (
              <span className="chip-desconto">
                {peca.desconto}% de desconto<span className="so-leitor"> da plataforma</span>
              </span>
            )}
          </span>
          {peca.desconto && <span className="chip-beneficio">Economize {emReais(peca.preco - precoComDesconto(peca))}</span>}
        </div>
      </div>
      <BotaoFavoritar slug={peca.slug} nome={peca.nome} />
    </article>
  )
}
