'use client'

import { useState } from 'react'
import type { FotoPeca } from '@/types/dominio'
import { IconeEtiqueta } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { fallbackDe } from '@/mocks/imagens'

type GaleriaPecaProps = {
  imagem: string
  fotos?: FotoPeca[]
  ordemFotos?: string[]
  nome: string
  desconto?: number
}

export default function GaleriaPeca({
  imagem,
  fotos,
  ordemFotos,
  nome,
  desconto,
}: GaleriaPecaProps) {
  const [ativa, definirAtiva] = useState<string | null>(null)

  const fotosOrdenadas: FotoPeca[] = fotos?.length
    ? [...fotos].sort((a, b) => {
        const ordemA = ordemFotos?.indexOf(a.id) ?? -1
        const ordemB = ordemFotos?.indexOf(b.id) ?? -1
        if (ordemA >= 0 && ordemB >= 0) return ordemA - ordemB
        if (ordemA >= 0) return -1
        if (ordemB >= 0) return 1
        return a.ordem - b.ordem
      })
    : [
        {
          id: 'capa',
          nome,
          url: imagem,
          ordem: 0,
        },
      ]

  const fotoAtual =
    fotosOrdenadas.find((foto) => foto.id === ativa) ??
    fotosOrdenadas[0]

  const reserva = fallbackDe(fotoAtual?.url ?? imagem)

  return (
    <div>
      <div className="figura-principal">
        {desconto ? (
          <span className="etiqueta-desconto etiqueta-desconto-sobre-foto">
            <IconeEtiqueta tamanho={13} />
            {desconto}%
            <span className="so-leitor">
              {' '}de desconto da plataforma
            </span>
          </span>
        ) : null}

        <div className="foto">
          <ImagemComFallback
            key={fotoAtual.id}
            src={fotoAtual?.url ?? imagem}
            reserva={reserva}
            alt={`${nome} — ${fotoAtual?.nome ?? nome}`}
            className="galeria-principal-img"
            style={{
              transform: 'none',
              objectPosition: 'center',
            }}
          />
        </div>
      </div>

      {fotosOrdenadas.length > 1 && (
        <div
          className="galeria-miniaturas"
          role="group"
          aria-label={`Fotos de ${nome}`}
        >
          {fotosOrdenadas.map((foto, i) => {
            const selecionada = foto.id === fotoAtual.id

            return (
              <button
                key={foto.id}
                type="button"
                className={`galeria-miniatura${
                  selecionada ? ' galeria-miniatura-ativa' : ''
                }`}
                aria-pressed={selecionada}
                aria-label={`Ver foto ${i + 1} de ${nome}`}
                title={`Foto ${i + 1}`}
                onClick={() => definirAtiva(foto.id)}
              >
                <ImagemComFallback
                  src={foto.url}
                  reserva={fallbackDe(foto.url)}
                  alt=""
                  loading="lazy"
                  style={{
                    transform: 'none',
                    objectPosition: 'center',
                  }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}