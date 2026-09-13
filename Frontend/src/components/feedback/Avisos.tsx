'use client'

import { Toaster, toast } from 'sonner'
import { IconeAviso, IconeCheck, IconeInfo } from '@/components/ui/Icones'

export function Avisador() {
  return (
    <Toaster
      position="bottom-right"
      duration={6000}
      closeButton
      gap={10}
      mobileOffset={{ bottom: 'calc(16px + var(--nav-inferior-espaco))' }}
      containerAriaLabel="Notificações"
      icons={{
        success: (
          <span className="aviso-toast-bolha aviso-toast-bolha-sucesso">
            <IconeCheck tamanho={16} />
          </span>
        ),
        error: (
          <span className="aviso-toast-bolha aviso-toast-bolha-erro">
            <IconeAviso tamanho={16} />
          </span>
        ),
        info: (
          <span className="aviso-toast-bolha aviso-toast-bolha-info">
            <IconeInfo tamanho={16} />
          </span>
        ),
      }}
      toastOptions={{ className: 'aviso-toast' }}
    />
  )
}

export const avisar = {
  sucesso: (titulo: string, descricao?: string) => toast.success(titulo, { description: descricao }),
  erro: (titulo: string, descricao?: string) => toast.error(titulo, { description: descricao }),
  info: (titulo: string, descricao?: string) => toast.info(titulo, { description: descricao }),
  comAcao: (titulo: string, rotulo: string, aoClicar: () => void) =>
    toast.success(titulo, { action: { label: rotulo, onClick: aoClicar } }),
  desfazivel: (titulo: string, aoDesfazer: () => void) =>
    toast.success(titulo, { action: { label: 'Desfazer', onClick: aoDesfazer } }),
}
