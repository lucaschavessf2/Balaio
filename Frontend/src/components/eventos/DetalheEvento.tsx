'use client'

import Link from 'next/link'
import { Retrato } from '@/components/ui/Basicos'
import { IconeSetaDireita } from '@/components/ui/Icones'
import MapaEventosCliente from '@/components/eventos/MapaEventosCliente'
import { rotuloTipoEvento, type Evento } from '@/mocks/eventos'
import { useDados } from '@/store/dados'

export default function DetalheEvento({ evento }: { evento: Evento }) {
  const { artesaos, coletivos } = useDados()
  const artesaosDoEvento = evento.artesaos
    .map((slug) => artesaos.find((a) => a.slug === slug))
    .filter((artesao): artesao is NonNullable<typeof artesao> => Boolean(artesao))
  const coletivosDoEvento = evento.coletivos
    .map((slug) => coletivos.find((c) => c.slug === slug))
    .filter((coletivo): coletivo is NonNullable<typeof coletivo> => Boolean(coletivo))
  const semParticipantes = artesaosDoEvento.length === 0 && coletivosDoEvento.length === 0

  return (
    <>
      <div className="linha-flex abaixo-3">
        <span className="selo selo-neutro">{rotuloTipoEvento[evento.tipo]}</span>
        {evento.criadoPorVoce && <span className="selo selo-encomenda">Seu evento</span>}
      </div>

      <h1 className="titulo-pagina">{evento.nome}</h1>
      <p className="subtitulo-pagina">
        {evento.periodo} · {evento.cidade}, Pernambuco
      </p>

      <div className="duas-colunas">
        <div>
          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Sobre o evento</h2>
            <p className="texto-suave abaixo-4">{evento.descricao}</p>
            <div className="grade-dois">
              <div className="dado">
                <span className="dado-rotulo">Quando</span>
                <span className="dado-valor">{evento.periodo}</span>
              </div>
              {evento.horario && (
                <div className="dado">
                  <span className="dado-rotulo">Horário</span>
                  <span className="dado-valor">{evento.horario}</span>
                </div>
              )}
              <div className="dado">
                <span className="dado-rotulo">Entrada</span>
                <span className="dado-valor">{evento.entrada}</span>
              </div>
              <div className="dado">
                <span className="dado-rotulo">Organização</span>
                <span className="dado-valor">{evento.organizador}</span>
              </div>
            </div>
          </section>

          <section className="cartao">
            <h2 className="secao-titulo">Quem vai estar lá</h2>
            {semParticipantes ? (
              <p className="texto-suave">Os participantes ainda serão confirmados pelo organizador.</p>
            ) : (
              <div className="grade-participantes">
                {artesaosDoEvento.map((artesao) => (
                  <Link key={artesao.slug} href={`/artisans/${artesao.slug}`} className="cartao-participante">
                    <Retrato imagem={artesao.imagem} />
                    <span className="encolhivel">
                      <span className="texto-forte">{artesao.nome}</span>
                      <span className="autoria">
                        {artesao.atelie} · {artesao.territorio}
                      </span>
                    </span>
                  </Link>
                ))}
                {coletivosDoEvento.map((coletivo) => (
                  <Link key={coletivo.slug} href={`/collectives/${coletivo.slug}`} className="cartao-participante">
                    <Retrato imagem={coletivo.imagem} />
                    <span className="encolhivel">
                      <span className="texto-forte">{coletivo.nome}</span>
                      <span className="autoria">Coletivo · {coletivo.territorio}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="cartao">
          <h2 className="secao-titulo">Onde vai ser</h2>
          <div className="mapa-eventos mapa-eventos-mini abaixo-4">
            <MapaEventosCliente
              eventos={[
                {
                  slug: evento.slug,
                  nome: evento.nome,
                  cidade: evento.cidade,
                  periodo: evento.periodo,
                  lat: evento.lat,
                  lng: evento.lng,
                  proprio: evento.criadoPorVoce,
                },
              ]}
              zoom={14}
              rotulo={`Mapa com o local do evento: ${evento.local}`}
            />
          </div>
          <div className="dado abaixo-3">
            <span className="dado-rotulo">Local</span>
            <span className="dado-valor">{evento.local}</span>
          </div>
          <div className="dado abaixo-4">
            <span className="dado-rotulo">Endereço</span>
            <span className="dado-valor">
              {evento.endereco}, {evento.cidade}, PE
            </span>
          </div>
          <a
            className="botao botao-secundario"
            href={`https://www.google.com/maps/dir/?api=1&destination=${evento.lat},${evento.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            Traçar rota no Google Maps
            <IconeSetaDireita />
          </a>
        </aside>
      </div>
    </>
  )
}
