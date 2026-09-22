'use client'

import { enviar } from '@/services/api/cliente'
import { useState } from 'react'
import { EstadoVazio } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso, IconeCheck, IconeSelo } from '@/components/ui/Icones'

type ItemCuradoria = { id: string; peca: string; artesao: string; enviadoEm: string; motivo: string }

export default function FilaCuradoria({
  filaInicial,
  mediacoesAbertas,
  artesaosAtivos,
}: {
  filaInicial: ItemCuradoria[]
  mediacoesAbertas: number
  artesaosAtivos: number
}) {
  const [fila, definirFila] = useState(filaInicial)
  const [analisadas, definirAnalisadas] = useState(0)

  const metricas = [
    { rotulo: 'Na fila', valor: String(fila.length), nota: 'Aguardando análise', classe: 'metrica-amarela' },
    {
      rotulo: 'Analisadas agora',
      valor: String(analisadas),
      nota: 'Nesta sessão',
      classe: 'metrica-verde',
    },
    { rotulo: 'Artesãos ativos', valor: String(artesaosAtivos), nota: 'Com peça publicada', classe: 'metrica-azul' },
    {
      rotulo: 'Mediações abertas',
      valor: String(mediacoesAbertas),
      nota: 'Exigem resposta em 48h',
      classe: 'metrica-branca',
    },
  ]

  async function aprovar(item: ItemCuradoria) {
    const resposta = await enviar('/admin/curadoria/' + item.id + '/decisao', { decisao: 'aprovada' })
    if (resposta.erro) { avisar.erro('Não foi possível aprovar', resposta.erro.mensagem); return }
    definirFila(fila.filter((f) => f.id !== item.id))
    definirAnalisadas((n) => n + 1)
    avisar.sucesso('Peça aprovada e publicada no catálogo', `${item.peca}, de ${item.artesao}.`)
  }

  async function pedirAjuste(item: ItemCuradoria) {
    const resposta = await enviar('/admin/curadoria/' + item.id + '/decisao', { decisao: 'ajuste' })
    if (resposta.erro) { avisar.erro('Não foi possível registrar', resposta.erro.mensagem); return }
    definirFila(fila.filter((f) => f.id !== item.id))
    definirAnalisadas((n) => n + 1)
    avisar.info('Pedido de ajuste enviado ao artesão', `${item.artesao} recebe o motivo por mensagem.`)
  }

  return (
    <>
      <div className="metricas metricas-duplas">
        {metricas.map((m) => (
          <div className={`metrica ${m.classe}`} key={m.rotulo}>
            <p className="metrica-rotulo">{m.rotulo}</p>
            <p className="metrica-valor">{m.valor}</p>
            <p className="metrica-nota">{m.nota}</p>
          </div>
        ))}
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Peças aguardando curadoria</h2>

        {fila.length === 0 ? (
          <EstadoVazio
            icone={<IconeSelo tamanho={34} />}
            titulo="Fila de curadoria em dia"
            descricao="Todas as peças enviadas foram analisadas. As próximas aparecem aqui assim que chegarem."
          />
        ) : (
          <ul className="lista-curadoria">
            {fila.map((item) => (
              <li className="cartao-curadoria" key={item.id}>
                <header className="cartao-curadoria-topo">
                  <span className="selo selo-encomenda">
                    <span className="selo-ponto" />
                    Aguardando análise
                  </span>
                  <span className="dado-rotulo">
                    {item.id} · {item.enviadoEm}
                  </span>
                </header>

                <div className="cartao-curadoria-corpo">
                  <p className="cartao-curadoria-peca">{item.peca}</p>
                  <p className="autoria">por {item.artesao}</p>

                  <p className="aviso acima-3">
                    <IconeAviso />
                    <span>
                      <strong>Ponto de atenção:</strong> {item.motivo}
                    </span>
                  </p>
                </div>

                <footer className="acoes-linha acoes-empilhaveis cartao-curadoria-acoes">
                  <button type="button" className="botao botao-sucesso" onClick={() => aprovar(item)}>
                    <IconeCheck />
                    Aprovar
                  </button>
                  <button type="button" className="botao botao-fantasma" onClick={() => pedirAjuste(item)}>
                    Pedir ajuste
                  </button>
                </footer>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
