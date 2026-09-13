'use client'

import { useState } from 'react'
import { IconeEtiqueta } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { fallbackDe } from '@/mocks/imagens'

type Vista = { rotulo: string; transform: string; posicao: string }

const VISTAS: Vista[] = [
  { rotulo: 'Vista geral', transform: 'scale(1)', posicao: 'center' },
  { rotulo: 'Detalhe da textura', transform: 'scale(1.8)', posicao: '30% 20%' },
  { rotulo: 'Detalhe de perto', transform: 'scale(2.4)', posicao: '70% 60%' },
  { rotulo: 'Base da peça', transform: 'scale(1.4)', posicao: '50% 85%' },
]

export default function GaleriaPeca({
  imagem,
  nome,
  desconto,
}: {
  imagem: string
  nome: string
  desconto?: number
}) {
  const [ativa, definirAtiva] = useState(0)
  const vista = VISTAS[ativa]
  const reserva = fallbackDe(imagem)

  return (
    <div>
      <div className="figura-principal">
        {desconto ? (
          <span className="etiqueta-desconto etiqueta-desconto-sobre-foto">
            <IconeEtiqueta tamanho={13} />
            {desconto}%<span className="so-leitor"> de desconto da plataforma</span>
          </span>
        ) : null}
        <div className="foto">
          <ImagemComFallback
            src={imagem}
            reserva={reserva}
            alt={nome}
            className="galeria-principal-img"
            style={{ transform: vista.transform, objectPosition: vista.posicao }}
          />
        </div>
      </div>

      <div className="galeria-miniaturas">
        {VISTAS.map((v, i) => (
          <button
            key={v.rotulo}
            type="button"
            className={`galeria-miniatura${i === ativa ? ' galeria-miniatura-ativa' : ''}`}
            aria-pressed={i === ativa}
            aria-label={`Ver ${v.rotulo}`}
            title={v.rotulo}
            onClick={() => definirAtiva(i)}
          >
            <span className="so-leitor">{v.rotulo}</span>
            <ImagemComFallback
              src={imagem}
              reserva={reserva}
              alt=""
              loading="lazy"
              style={{ transform: v.transform, objectPosition: v.posicao }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
