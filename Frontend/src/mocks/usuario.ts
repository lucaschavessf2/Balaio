
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
  artesaoId?: string
  enderecos?: EnderecoUsuario[]
}

export type EnderecoUsuario = {
  id: string
  apelido: string
  rua: string
  bairro: string
  cep: string
  principal: boolean
}

export const usuarioAtual: Usuario = {
  nome: 'Carlos de Olinda',
  email: 'carlos@exemplo.com',
  imagem: '/fotos/jarra-cabocla.svg',
}


export function primeiroNome(nome: string) {
  return nome.split(' ')[0]
}
