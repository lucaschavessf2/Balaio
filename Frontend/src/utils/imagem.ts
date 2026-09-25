export const imagemBase = '/fotos/ImagemBase.webp'

export function fallbackDe(imagem?: string): string | undefined {
  return imagem ? imagemBase : undefined
}
