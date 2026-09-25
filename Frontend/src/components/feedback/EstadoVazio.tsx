import type { ReactNode } from 'react'

export default function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone: ReactNode
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="cartao estado-vazio">
      <div className="estado-vazio-icone">{icone}</div>
      <h3>{titulo}</h3>
      <p>{descricao}</p>
      {acao}
    </div>
  )
}
