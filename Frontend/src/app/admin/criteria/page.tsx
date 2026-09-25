import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeAviso, IconeCheck, IconeSelo } from '@/components/ui/Icones'

const aprovamos = [
  'Trabalho feito à mão, com técnica e território identificáveis.',
  'Peças publicadas com fotos próprias, que mostrem o acabamento.',
  'Vínculo com a associação ou comunidade do território.',
]

const devolvemos = [
  'Loja com produto industrializado ou revenda de terceiros.',
  'Fotos de banco de imagens ou de outro artesão.',
  'Origem não confirmada junto à associação do território.',
]

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
            {aprovamos.map((criterio) => (
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
            {devolvemos.map((criterio) => (
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
