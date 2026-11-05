import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeAviso, IconeCheck, IconeSelo } from '@/components/ui/Icones'
import { criteriosDoSelo, motivosDeAjuste } from '@/constants/curadoria'

export default function Criterios() {
  return (
    <LayoutAdmin ativo="criterios">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Critérios' }]} />

      <h1 className="titulo-pagina">Critérios de curadoria</h1>
      <p className="subtitulo-pagina">
        A régua para conceder o selo de artesão verificado. O selo não bloqueia vendas: quem pede ajuste explica o motivo com base nesta lista.
      </p>

      <div className="grade-dois">
        <section className="cartao">
          <p className="campo-rotulo secao-titulo-icone abaixo-3">
            <IconeSelo />
            O que garante o selo
          </p>
          <ul className="lista-criterios">
            {criteriosDoSelo.map((criterio) => (
              <li key={criterio}>
                <IconeCheck tamanho={15} />
                <span>{criterio}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="cartao">
          <p className="campo-rotulo secao-titulo-icone abaixo-3">
            <IconeAviso />O que pede ajuste antes do selo
          </p>
          <ul className="lista-criterios lista-criterios-atencao">
            {motivosDeAjuste.map((criterio) => (
              <li key={criterio}>
                <IconeAviso tamanho={15} />
                <span>{criterio}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </LayoutAdmin>
  )
}
