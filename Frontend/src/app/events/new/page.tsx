import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormCriarEvento from '@/components/eventos/FormCriarEvento'

export default function NovoEvento() {
  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Eventos', href: '/events' },
          { texto: 'Organizar um evento' },
        ]}
      />

      <h1 className="titulo-pagina">Organize um evento</h1>
      <p className="subtitulo-pagina">
        Publique sua feira, festival ou oficina na agenda: o evento entra no mapa da vitrine e mostra quem da
        plataforma vai estar lá.
      </p>

      <div className="duas-colunas">
        <FormCriarEvento />

        <aside className="cartao">
          <h2 className="secao-titulo">Como funciona</h2>
          <ol className="lista-passos-evento">
            <li>
              <strong>Conte o essencial.</strong> Nome, datas, município e local. O público decide se vai com essas
              quatro informações.
            </li>
            <li>
              <strong>Marque o ponto no mapa.</strong> Ao escolher o município, o pino aparece no centro da cidade.
              Clique no mapa para levá-lo até a entrada do evento.
            </li>
            <li>
              <strong>Confirme quem participa.</strong> Os artesãos e coletivos marcados aparecem na página do evento
              com link para as lojas deles.
            </li>
          </ol>
          <p className="texto-suave acima-4">
            O evento aparece na vitrine para quem está perto: a distância é calculada a partir da localização de cada
            visitante.
          </p>
        </aside>
      </div>
    </Pagina>
  )
}
