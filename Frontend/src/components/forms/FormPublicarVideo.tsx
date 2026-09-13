'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarObrigatorio } from '@/utils/validacao'
import { IconePincel } from '@/components/ui/Icones'

type PecaVinculavel = { slug: string; nome: string }

export default function FormPublicarVideo({ pecas }: { pecas: PecaVinculavel[] }) {
  const formulario = useRef<HTMLFormElement>(null)
  const [erroLegenda, definirErroLegenda] = useState<string | null>(null)
  const [temVideo, definirTemVideo] = useState(false)

  function validar(): boolean {
    const dados = new FormData(formulario.current ?? undefined)
    const problema = validarObrigatorio(
      String(dados.get('legenda') ?? ''),
      'Escreva uma legenda contando o que aparece na cena',
    )
    definirErroLegenda(problema)
    if (problema) {
      document.getElementById('video-legenda')?.focus()
      avisar.erro('Confira os campos destacados')
      return false
    }
    return true
  }

  function limpar() {
    formulario.current?.reset()
    definirTemVideo(false)
  }

  function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!validar()) return
    limpar()
    avisar.sucesso('Vídeo enviado para curadoria', 'Ele entra no feed assim que for aprovado.')
  }

  function salvarRascunho() {
    if (!validar()) return
    limpar()
    avisar.sucesso('Rascunho de vídeo salvo')
  }

  return (
    <form ref={formulario} onSubmit={publicar} noValidate>
      <section className="cartao abaixo-5">
        <label className="area-upload" style={{ display: 'block', cursor: 'pointer' }}>
          <span className="estado-vazio-icone" style={{ width: 64, height: 64, marginBottom: 12 }}>
            <IconePincel tamanho={26} />
          </span>
          <span style={{ display: 'block', fontWeight: 600, color: 'var(--tinta)' }}>
            {temVideo ? 'Vídeo escolhido' : 'Toque para escolher o vídeo'}
          </span>
          <span className="campo-ajuda">MP4 ou MOV, até 2 minutos e 200 MB.</span>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            className="so-leitor"
            onChange={(evento) => {
              const escolhido = (evento.target.files?.length ?? 0) > 0
              definirTemVideo(escolhido)
              if (escolhido) avisar.sucesso('Vídeo pronto para publicar')
            }}
          />
        </label>

        <Campo
          rotulo="Legenda"
          ajuda="Conte o que está acontecendo na cena. Fale como falaria na feira."
          erro={erroLegenda ?? undefined}
          id="video-legenda"
        >
          <textarea
            id="video-legenda"
            name="legenda"
            placeholder="A juba do leão é feita cacho por cacho, com faca de ponta fina..."
          />
        </Campo>

        <Campo rotulo="Etiquetas" ajuda="Separe por espaço. Ajudam quem procura pela técnica." id="video-etiquetas">
          <input id="video-etiquetas" name="etiquetas" placeholder="ceramica tracunhaem passoapasso" />
        </Campo>

        <Campo rotulo="Vincular a uma peça" ajuda="Quem assistir pode ir direto para a peça e comprar." id="video-peca">
          <select id="video-peca" name="peca" defaultValue="">
            <option value="">Nenhuma peça vinculada</option>
            {pecas.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.nome}
              </option>
            ))}
          </select>
        </Campo>

        <div className="acoes-linha">
          <button type="submit" className="botao botao-primario">
            Publicar
          </button>
          <button type="button" className="botao botao-fantasma" onClick={salvarRascunho}>
            Salvar rascunho
          </button>
        </div>
      </section>
    </form>
  )
}
