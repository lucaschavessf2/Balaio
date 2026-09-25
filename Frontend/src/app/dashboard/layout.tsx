import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import LayoutPainel from '@/components/painel/LayoutPainel'

export default function LayoutDoPainel({ children }: { children: ReactNode }) {
  return (
    <Pagina>
      <LayoutPainel>{children}</LayoutPainel>
    </Pagina>
  )
}
