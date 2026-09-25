import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { fluxos, telas, telasDoFluxo } from '@/mocks/telas'

export const metadata = {
  title: 'Mapa de telas do Balaio',
  description: 'Índice navegável de todas as telas do protótipo.',
}

export default function MapaDeTelas() {
  return (
    <Pagina>
      <header className="capa-mapa">
        <span className="selo selo-neutro">Protótipo de interface</span>
        <h1 className="titulo-pagina" style={{ marginTop: 12 }}>
          Mapa de telas
        </h1>
        <p className="subtitulo-pagina" style={{ marginBottom: 0 }}>
          As <strong>{telas.length} telas</strong> do Balaio, agrupadas por quem usa cada uma. Clique para
          abrir. As ações usam uma API local de demonstração; nenhum pagamento real é processado.
        </p>
      </header>

      {fluxos.map((fluxo) => {
        const doFluxo = telasDoFluxo(fluxo.chave)
        return (
          <section className="secao" key={fluxo.chave}>
            <div className="cabecalho-fluxo">
              <h2 className="secao-titulo" style={{ marginBottom: 2 }}>
                {fluxo.titulo}
              </h2>
              <span className="autoria">
                {fluxo.resumo} · {doFluxo.length} telas
              </span>
            </div>

            <div className="grade-telas">
              {doFluxo.map((tela) => (
                <Link href={tela.rota} className="cartao-tela" key={tela.rota}>
                  <span className="rota">{tela.rota}</span>
                  <span className="cartao-tela-nome">{tela.nome}</span>
                  <span className="autoria">{tela.descricao}</span>
                  <span className="cartao-tela-rodape">
                    {tela.requisitos.length > 0 ? (
                      <span className="acoes-linha">
                        {tela.requisitos.map((r) => (
                          <span className="selo selo-neutro" key={r}>
                            {r}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="ver-peca">
                      Abrir <IconeSetaDireita tamanho={14} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </Pagina>
  )
}
