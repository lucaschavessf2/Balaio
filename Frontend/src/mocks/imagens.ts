export const imagemBase = '/fotos/ImagemBase.webp'

export function fallbackDe(imagem?: string): string | undefined {
  return imagem ? imagemBase : undefined
}

export function aplicarFotos<T>(itens: T[], campo: keyof T, caminho: (item: T) => string): void {
  for (const item of itens) {
    ;(item as Record<string, unknown>)[campo as string] = caminho(item)
  }
}
