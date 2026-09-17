
export type Usuario = {
  id?: string
  nome: string
  email: string
  imagem: string
  perfil?: 'comprador' | 'artesao'
  telefone?: string
  tipoComprador?: string
  territorio?: string
  tecnica?: string
}

export const usuarioAtual: Usuario = {
  nome: 'Carlos de Olinda',
  email: 'carlos@exemplo.com',
  imagem: '/fotos/jarra-cabocla.svg',
}


export function primeiroNome(nome: string) {
  return nome.split(' ')[0]
}
