import Link from 'next/link'
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { IconeEstrela } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { fallbackDe } from '@/utils/imagem'
import { type Disponibilidade } from '@/types/dominio'
import { rotuloDisponibilidade } from '@/constants/rotulos'

export function Migalhas({ trilha }: { trilha: { texto: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está aqui">
      <ol className="migalhas">
        {trilha.map((item) => (
          <li key={item.texto}>{item.href ? <Link href={item.href}>{item.texto}</Link> : item.texto}</li>
        ))}
      </ol>
    </nav>
  )
}

export function SeloDisponibilidade({
  tipo,
  sobreFoto = false,
  prazoDias,
}: {
  tipo: Disponibilidade
  sobreFoto?: boolean
  prazoDias?: number
}) {
  const classe = tipo === 'disponivel' ? 'selo-disponivel' : tipo === 'encomenda' ? 'selo-encomenda' : 'selo-unica'
  const texto =
    tipo === 'encomenda' && prazoDias ? `${rotuloDisponibilidade[tipo]} · ${prazoDias} dias` : rotuloDisponibilidade[tipo]

  return (
    <span className={`selo ${classe}${sobreFoto ? ' selo-sobre-foto' : ''}`}>
      <span className="selo-ponto" />
      {texto}
    </span>
  )
}

export function Foto({
  nome,
  imagem,
  altura,
  decorativa = false,
}: {
  nome: string
  imagem?: string
  altura?: number
  decorativa?: boolean
}) {
  return (
    <div className="foto" style={altura ? { height: altura } : undefined}>
      {imagem ? (
        <ImagemComFallback src={imagem} reserva={fallbackDe(imagem)} alt={decorativa ? '' : nome} loading="lazy" />
      ) : (
        <span className="foto-rotulo">{nome}</span>
      )}
    </div>
  )
}

export function Retrato({
  imagem,
  grande = false,
  tamanho,
}: {
  imagem?: string
  grande?: boolean
  tamanho?: number
}) {
  return (
    <span
      className={`retrato${grande ? ' retrato-grande' : ''}`}
      style={tamanho ? { width: tamanho, height: tamanho } : undefined}
    >
      {imagem && <ImagemComFallback src={imagem} reserva={fallbackDe(imagem)} alt="" loading="lazy" />}
    </span>
  )
}

export function Estrelas({ nota, mostrarNota = true }: { nota: number; mostrarNota?: boolean }) {
  return (
    <span className="estrelas-linha" role="img" aria-label={`Nota ${nota.toFixed(1)} de 5`}>
      <span className="estrela-unica" aria-hidden>
        <IconeEstrela preenchida />
      </span>
      {mostrarNota && <strong className="estrelas-nota">{nota.toFixed(1)}</strong>}
    </span>
  )
}

export function Campo({
  rotulo,
  ajuda,
  erro,
  children,
  id,
}: {
  rotulo: string
  ajuda?: string
  erro?: string
  children: ReactNode
  id: string
}) {
  const idAjuda = ajuda ? `${id}-ajuda` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  const descricao = [idErro, idAjuda].filter(Boolean).join(' ') || undefined
  const filho = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        'aria-describedby': descricao,
        'aria-invalid': erro ? true : undefined,
      })
    : children

  return (
    <div className="campo">
      <label className="campo-rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {ajuda && (
        <span className="campo-ajuda" id={idAjuda}>
          {ajuda}
        </span>
      )}
      {filho}
      {erro && (
        <span className="campo-erro" id={idErro} role="status">
          {erro}
        </span>
      )}
    </div>
  )
}
