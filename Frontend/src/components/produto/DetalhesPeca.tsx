import Link from 'next/link'
import type { ReactNode } from 'react'
import { Estrelas } from '@/components/ui/Basicos'
import { rotuloDisponibilidade } from '@/constants/rotulos'
import type { Peca } from '@/types/dominio'
import { hrefListagem } from '@/utils/filtrosUrl'

export default function DetalhesPeca({ peca }: { peca: Peca }) {
  const linhas: { rotulo: string; valor: ReactNode }[] = [
    { rotulo: 'Tipo de peça', valor: <Link href={hrefListagem({ tipo: peca.tipo })}>{peca.tipo}</Link> },
    { rotulo: 'Técnica', valor: <Link href={hrefListagem({ tecnica: peca.tecnica })}>{peca.tecnica}</Link> },
    { rotulo: 'Categoria', valor: <Link href={hrefListagem({ categoria: peca.categoria })}>{peca.categoria}</Link> },
    { rotulo: 'Território', valor: <Link href={hrefListagem({ territorio: peca.territorio })}>{peca.territorio}</Link> },
    { rotulo: 'Disponibilidade', valor: rotuloDisponibilidade[peca.disponibilidade] },
  ]
  if (peca.disponibilidade === 'encomenda' && peca.prazoProducaoDias) {
    linhas.push({ rotulo: 'Prazo de produção', valor: `Cerca de ${peca.prazoProducaoDias} dias` })
  }
  if (peca.avaliacao) {
    linhas.push({
      rotulo: 'Avaliação',
      valor: (
        <>
          <Estrelas nota={peca.avaliacao} /> <span className="autoria">({peca.totalAvaliacoes ?? 0} avaliações)</span>
        </>
      ),
    })
  }

  return (
    <section aria-labelledby="detalhes-peca-titulo">
      <h2 className="secao-titulo" id="detalhes-peca-titulo">
        Detalhes da peça
      </h2>
      <div className="tabela-detalhes-moldura">
        <table className="tabela-detalhes">
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.rotulo}>
                <th scope="row">{linha.rotulo}</th>
                <td>{linha.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
