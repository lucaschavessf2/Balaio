import { Retrato } from '@/components/ui/Basicos'
import type { PerguntaPublica } from '@/services/api/perguntas.servico'

type Props = {
  iniciais: PerguntaPublica[]
  slug: string
  artesaoSlug?: string
  artesaoNome?: string
  artesaoImagem?: string
}

export default function PerguntasPublicas({ iniciais, artesaoNome, artesaoImagem }: Props) {
  return (
    <>
      <h2 className="secao-titulo">Perguntas e respostas ({iniciais.length})</h2>

      <ul
        className={`lista-perguntas${iniciais.length > 3 ? ' lista-perguntas-rolavel' : ''}`}
        tabIndex={iniciais.length > 3 ? 0 : undefined}
        aria-label={iniciais.length > 3 ? 'Lista de perguntas, role para ver todas' : undefined}
      >
        {iniciais.map((p) => (
          <li className="fio-pergunta" key={p.id}>
            <div className="pergunta-bloco">
              <span className="pergunta-inicial" aria-hidden>{(p.autor ?? '?').charAt(0)}</span>
              <div className="encolhivel">
                <p className="pergunta-autor">{p.autor ?? 'Visitante'}</p>
                <p className="balao balao-pergunta">{p.pergunta}</p>
              </div>
            </div>

            {p.resposta ? (
              <div className="resposta-artesao">
                <Retrato imagem={artesaoImagem} tamanho={28} />
                <div className="encolhivel">
                  <p className="resposta-autor">
                    {artesaoNome}
                    <span className="selo selo-encomenda">artesão</span>
                  </p>
                  <p className="balao balao-resposta">{p.resposta}</p>
                </div>
              </div>
            ) : (
              <p className="pergunta-aguardando">
                <span className="selo selo-neutro">Aguardando resposta do artesão</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
