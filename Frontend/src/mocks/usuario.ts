import { artesaos } from './artesaos'

export type Usuario = {
  id?: string
  nome: string
  email: string
  imagem: string
  perfil?: 'comprador' | 'artesao'
  papel?: 'comprador' | 'artesao' | 'admin'
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

export const SENHA_DEMONSTRACAO = 'balaio123'

const emailsDeVendedor: Record<string, string> = { 'mestre-nuca': 'nuca@exemplo.com' }

export const contasDemonstracao = [
  { id: 'u-carlos', ...usuarioAtual, senha: SENHA_DEMONSTRACAO, papel: 'comprador' },
  {
    id: 'u-admin',
    nome: 'Curadoria Balaio',
    email: 'admin@exemplo.com',
    senha: SENHA_DEMONSTRACAO,
    papel: 'admin',
    imagem: '/balaio-logo.svg',
  },
  ...artesaos.map((artesao) => ({
    id: `u-${artesao.slug}`,
    nome: artesao.nome,
    email: emailsDeVendedor[artesao.slug] ?? `${artesao.slug}@exemplo.com`,
    senha: SENHA_DEMONSTRACAO,
    papel: 'artesao',
    artesao: artesao.slug,
    imagem: artesao.imagem,
  })),
]
