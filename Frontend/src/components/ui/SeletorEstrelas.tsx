import { useRef, type KeyboardEvent } from 'react'
import { IconeEstrela } from '@/components/ui/Icones'

type Props = {
  rotulo: string
  valor: number
  aoMudar: (nota: number) => void
  tamanho?: number
  id?: string
  className?: string
}

export default function SeletorEstrelas({ rotulo, valor, aoMudar, tamanho = 26, id, className }: Props) {
  const grupo = useRef<HTMLDivElement>(null)

  function teclado(evento: KeyboardEvent<HTMLDivElement>) {
    let proxima = valor
    if (evento.key === 'ArrowRight' || evento.key === 'ArrowUp') proxima = Math.min(5, valor + 1)
    else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowDown') proxima = Math.max(1, valor - 1)
    else return
    evento.preventDefault()
    aoMudar(proxima)
    const botoes = grupo.current?.querySelectorAll('button')
    botoes?.[proxima - 1]?.focus()
  }

  return (
    <div
      className={`seletor-estrelas${className ? ` ${className}` : ''}`}
      id={id}
      role="radiogroup"
      aria-label={rotulo}
      ref={grupo}
      onKeyDown={teclado}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} de 5`}
          tabIndex={n === Math.max(valor, 1) ? 0 : -1}
          onClick={() => aoMudar(n)}
        >
          <IconeEstrela tamanho={tamanho} preenchida={n <= valor} />
        </button>
      ))}
    </div>
  )
}
