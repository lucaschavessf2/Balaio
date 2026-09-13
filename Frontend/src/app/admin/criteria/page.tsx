import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeAviso, IconeCheck, IconeSelo } from '@/components/ui/Icones'

const aprovamos = [
  'Peça feita à mão, com técnica e território identificáveis.',
  'Fotos próprias, que mostrem o detalhe do acabamento.',
  'História que explique a origem e o processo.',
]

const devolvemos = [
  'Produto industrializado ou revenda de terceiros.',
  'Foto de banco de imagens ou de outro artesão.',
  'Origem não verificável junto à associação do território.',
]

export default function Criterios() {
  return (
    <LayoutAdmin ativo="criterios">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Critérios' }]} />

      <h1 className="titulo-pagina">Critérios de curadoria</h1>
      <p className="subtitulo-pagina">
        A régua que vale para toda peça analisada. Quem pede ajuste explica o motivo com base nesta lista.
      </p>

      <div className="grade-dois">
        <section className="cartao">
          <p className="campo-rotulo secao-titulo-icone abaixo-3">
            <IconeSelo />
            O que aprovamos
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
            <IconeAviso />O que devolvemos para ajuste
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
