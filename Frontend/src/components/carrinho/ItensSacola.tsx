'use client'

import Link from 'next/link'
import { EstadoVazio, Foto, SeloDisponibilidade } from '@/components/ui/Basicos'
import { IconeSacola, IconeSetaDireita } from '@/components/ui/Icones'
import { useSacola } from '@/store/sacola'
import { avisar } from '@/components/feedback/Avisos'
import { usePecas } from '@/hooks/usePecas'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { useDados } from '@/store/dados'
import { emReais, precoComDesconto } from '@/utils/formato'

export default function ItensSacola() {
  const { mapaPecas, carregando, erro } = usePecas()
  const { artesaos, fretes, carregando: carregandoFretes, erro: erroFretes } = useDados()
  const { itens, remover, repor, alterarQuantidade } = useSacola()

  const detalhados = itens.flatMap((item) => {
    const peca = mapaPecas.get(item.slug)
    return peca ? [{ item, peca }] : []
  })

  const subtotalCheio = detalhados.reduce((total, d) => total + d.peca.preco * d.item.quantidade, 0)
  const subtotal = detalhados.reduce((total, d) => total + precoComDesconto(d.peca) * d.item.quantidade, 0)
  const economia = subtotalCheio - subtotal
  const frete = fretes[0]?.valor ?? 0

  function removerItem(slug: string, nome: string) {
    const posicao = itens.findIndex((i) => i.slug === slug)
    const item = itens[posicao]
    remover(slug)
    avisar.desfazivel(`${nome} saiu da sacola`, () => repor(item, posicao))
  }

  if (carregando || carregandoFretes) return <EstadoCarregando />
  if (erro || erroFretes || !fretes.length) return <EstadoErro mensagem={erro ?? erroFretes ?? 'Nenhuma opção de entrega disponível.'} />

  if (detalhados.length === 0) {
    return (
      <EstadoVazio
        icone={<IconeSacola tamanho={34} />}
        titulo="Sua sacola está vazia"
        descricao="As peças que você adicionar aparecem aqui, prontas para finalizar a compra."
        acao={
          <Link href="/" className="botao botao-primario">
            Explorar o catálogo
          </Link>
        }
      />
    )
  }

  return (
    <>
      <p className="subtitulo-pagina">
        {detalhados.length} {detalhados.length === 1 ? 'peça reservada' : 'peças reservadas'}. Peças únicas ficam
        guardadas para você por 30 minutos.
      </p>

      <div className="duas-colunas">
        <section className="cartao">
          {detalhados.map(({ peca, item }) => {
            const artesao = artesaos.find((a) => a.slug === peca.artesao)
            return (
              <article className="item-sacola" key={peca.slug}>
                <div className="item-sacola-figura">
                  <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
                </div>
                <div className="encolhivel">
                  <div className="linha-flex linha-entre" style={{ alignItems: 'flex-start' }}>
                    <div className="encolhivel">
                      <Link href={`/pieces/${peca.slug}`} className="texto-forte" style={{ color: 'var(--tinta)' }}>
                        {peca.nome}
                      </Link>
                      <p className="autoria">
                        por {artesao?.nome} · {peca.territorio}
                      </p>
                    </div>
                    <span className="linha-preco">
                      {peca.desconto && (
                        <span className="preco-riscado">{emReais(peca.preco * item.quantidade)}</span>
                      )}
                      <strong className="preco">{emReais(precoComDesconto(peca) * item.quantidade)}</strong>
                    </span>
                  </div>

                  <div className="linha-flex acima-3">
                    <SeloDisponibilidade tipo={peca.disponibilidade} prazoDias={peca.prazoProducaoDias} />
                    {peca.desconto && (
                      <span className="etiqueta-desconto">
                        {peca.desconto}%<span className="so-leitor"> de desconto da plataforma</span>
                      </span>
                    )}
                    {peca.disponibilidade !== 'unica' && (
                      <label className="linha-flex" style={{ gap: 8, fontSize: 14 }}>
                        Quantidade
                        <select
                          className="campo-select"
                          style={{ width: 76 }}
                          value={item.quantidade}
                          onChange={(evento) => alterarQuantidade(peca.slug, Number(evento.target.value))}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </label>
                    )}
                    <button
                      type="button"
                      className="botao-texto botao-texto-perigo"
                      onClick={() => removerItem(peca.slug, peca.nome)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            )
          })}

          <p className="acima-4">
            <Link href="/" className="ver-peca">
              ← Continuar explorando o catálogo
            </Link>
          </p>
        </section>

        <aside className="cartao coluna-compra">
          <h2 className="secao-titulo">Resumo do pedido</h2>

          <p className="resumo">
            <span>Subtotal</span>
            <strong>{emReais(subtotalCheio)}</strong>
          </p>
          {economia > 0 && (
            <p className="resumo resumo-desconto">
              <span>Desconto da plataforma</span>
              <strong>{emReais(economia)}</strong>
            </p>
          )}
          <p className="resumo">
            <span>Frete de origem</span>
            <strong>{emReais(frete)}</strong>
          </p>
          <p className="resumo resumo-total">
            <span>Total</span>
            <span className="preco-destaque">{emReais(subtotal + frete)}</span>
          </p>

          <div className="barra-fixa barra-fixa-total">
            <p className="barra-fixa-info">
              <span className="barra-fixa-rotulo">Total</span>
              <span className="barra-fixa-valor">{emReais(subtotal + frete)}</span>
            </p>
            <Link href="/checkout" className="botao botao-primario botao-largo">
              Ir para o pagamento
              <IconeSetaDireita />
            </Link>
          </div>

          <p className="campo-ajuda acima-3" style={{ textAlign: 'center' }}>
            O valor fica retido até a entrega ser confirmada.
          </p>
        </aside>
      </div>
    </>
  )
}
