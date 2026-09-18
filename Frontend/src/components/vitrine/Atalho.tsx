import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = { texto: string; href: string; icone: ReactNode }

export default function Atalho({ texto, href, icone }: Props) {
  return (
    <Link href={href} className="atalho">
      <span className="atalho-icone">{icone}</span>
      <span className="atalho-texto">{texto}</span>
    </Link>
  )
}
