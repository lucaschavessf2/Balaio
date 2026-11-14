'use client'

import type { ReactNode } from 'react'
import { revelarAoRolar } from '@/utils/revelarAoRolar'

type Props = {
  como?: 'div' | 'ol'
  className: string
  children: ReactNode
}

export default function ListaEscalonada({ como: Elemento = 'div', className, children }: Props) {
  return (
    <Elemento ref={revelarAoRolar} className={`escalonado ${className}`}>
      {children}
    </Elemento>
  )
}
