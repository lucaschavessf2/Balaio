export const FORMATOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
export const TAMANHO_MAXIMO_FOTO_MB = 2

const BYTES_POR_MB = 1024 * 1024

export function validarFoto(arquivo: File): string | null {
  if (!FORMATOS_FOTO.includes(arquivo.type)) return 'Use uma foto em JPG, PNG ou WebP'
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_MB * BYTES_POR_MB) {
    return `A foto precisa ter no máximo ${TAMANHO_MAXIMO_FOTO_MB} MB`
  }
  return null
}

export function lerComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => resolver(String(leitor.result))
    leitor.onerror = () => rejeitar(leitor.error)
    leitor.readAsDataURL(arquivo)
  })
}
