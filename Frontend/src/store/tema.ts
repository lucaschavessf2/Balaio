export type Tema = 'claro' | 'escuro'

const inscritos = new Set<() => void>()

function temaDoSistema(): Tema {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export function inscrever(aoMudar: () => void) {
  inscritos.add(aoMudar)
  return () => {
    inscritos.delete(aoMudar)
  }
}

export function lerTema(): Tema {
  return (document.documentElement.dataset.tema as Tema | undefined) ?? temaDoSistema()
}

export function definirTema(tema: Tema) {
  document.documentElement.dataset.tema = tema
  try {
    localStorage.setItem('tema', tema)
  } catch {}
  inscritos.forEach((aoMudar) => aoMudar())
}
