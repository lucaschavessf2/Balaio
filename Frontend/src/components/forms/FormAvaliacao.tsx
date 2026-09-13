'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo, Foto } from '@/components/ui/Basicos'
import SeletorEstrelas from '@/components/ui/SeletorEstrelas'
import { IconeCheck } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'

const rotulosNota = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']

const aspectosPositivos = [
  'Fiel às fotos',
  'Chegou bem embalado',
  'Entregue no prazo',
  'Artesão atencioso',
  'Qualidade excelente',
  'Recomendo',
]

const aspectosMelhoria = [
  'Diferente das fotos',
  'Chegou danificado',
  'Demorou mais que o previsto',
  'Pouco contato do artesão',
  'Acabamento abaixo do esperado',
]

function aspectosDaNota(nota: number) {
  if (nota === 0) return null
  return nota >= 4
    ? { titulo: 'O que foi bom? (opcional)', itens: aspectosPositivos }
    : { titulo: 'O que poderia melhorar? (opcional)', itens: aspectosMelhoria }
}

type Props = {
  pedidoId: string
  pecaNome?: string
  pecaImagem?: string
  artesaoNome?: string
}

export default function FormAvaliacao({ pedidoId, pecaNome, pecaImagem, artesaoNome }: Props) {
  const roteador = useRouter()
  const [nota, definirNota] = useState(0)
  const [aspectosMarcados, definirAspectosMarcados] = useState<string[]>([])
  const [comentario, definirComentario] = useState('')
  const [erroNota, definirErroNota] = useState<string | null>(null)

  const aspectos = aspectosDaNota(nota)

  function escolherNota(valor: number) {
    definirNota(valor)
    definirErroNota(null)
    const conjunto = valor >= 4 ? aspectosPositivos : aspectosMelhoria
    definirAspectosMarcados((atuais) => atuais.filter((a) => conjunto.includes(a)))
  }

  function alternarAspecto(aspecto: string) {
    definirAspectosMarcados((atuais) =>
      atuais.includes(aspecto) ? atuais.filter((a) => a !== aspecto) : [...atuais, aspecto],
    )
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (nota === 0) {
      definirErroNota('Escolha uma nota geral de 1 a 5 estrelas')
      avisar.erro('Escolha uma nota geral de 1 a 5 estrelas')
      document.querySelector<HTMLButtonElement>('#nota-geral button')?.focus()
      return
    }
    avisar.sucesso('Avaliação enviada', 'Obrigado por fortalecer o trabalho do artesão.')
    roteador.push(`/orders/${pedidoId}`)
  }

  return (
    <form className="cartao" onSubmit={enviar} noValidate>
      {pecaNome && (
        <div className="item-sacola" style={{ paddingTop: 0, borderBottom: 0 }}>
          <div className="item-sacola-figura">
            <Foto nome={pecaNome} imagem={pecaImagem} decorativa />
          </div>
          <div className="encolhivel">
            <p className="texto-forte">{pecaNome}</p>
            <p className="autoria">por {artesaoNome}</p>
          </div>
        </div>
      )}

      <fieldset className="nota-geral" style={{ border: 0, padding: 0, margin: '20px 0' }}>
        <legend className="campo-rotulo abaixo-3">Qual sua nota para esta compra?</legend>
        <div className="nota-geral-linha">
          <SeletorEstrelas
            id="nota-geral"
            className="seletor-estrelas-grande"
            rotulo="Nota geral da compra"
            tamanho={40}
            valor={nota}
            aoMudar={escolherNota}
          />
          {nota > 0 && <span className="nota-geral-rotulo">{rotulosNota[nota]}</span>}
        </div>
        {erroNota && (
          <p className="campo-erro acima-2" role="status">
            {erroNota}
          </p>
        )}
      </fieldset>

      {aspectos && (
        <fieldset className="elogios" style={{ border: 0, padding: 0, marginBottom: 20 }}>
          <legend className="campo-rotulo abaixo-3">{aspectos.titulo}</legend>
          <div className="elogios-chips">
            {aspectos.itens.map((aspecto) => {
              const marcado = aspectosMarcados.includes(aspecto)
              return (
                <button
                  key={aspecto}
                  type="button"
                  className={`chip-elogio${marcado ? ' chip-elogio-ativo' : ''}`}
                  aria-pressed={marcado}
                  onClick={() => alternarAspecto(aspecto)}
                >
                  {marcado && <IconeCheck tamanho={14} />}
                  {aspecto}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <Campo
        rotulo="Quer contar mais alguma coisa?"
        ajuda="Seu comentário aparece no perfil do artesão, com o seu primeiro nome."
        id="comentario"
      >
        <textarea
          id="comentario"
          placeholder="Conte como foi receber a peça, o contato com o artesão, o que te surpreendeu."
          value={comentario}
          onChange={(evento) => definirComentario(evento.target.value)}
        />
      </Campo>

      <div className="acoes-linha acoes-empilhaveis">
        <button type="submit" className="botao botao-primario">
          Enviar avaliação
        </button>
        <Link href="/orders" className="botao botao-fantasma">
          Deixar para depois
        </Link>
      </div>
    </form>
  )
}
