'use client'

import { useRouter } from 'next/navigation'
import { criarVideo } from '@/services/api/videos.servico'
import { useRef, useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarObrigatorio } from '@/utils/validacao'
import { IconePincel } from '@/components/ui/Icones'
import { useSessao } from '@/store/sessao'

type PecaVinculavel = { slug: string; nome: string }

export default function FormPublicarVideo({ pecas }: { pecas: PecaVinculavel[] }) {
  const roteador = useRouter()
  const { sessao } = useSessao()
  const [salvando, definirSalvando] = useState(false)
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

  async function salvar(rascunho: boolean) {
    if (salvando || !validar() || !sessao?.artesao) return
    const dados = new FormData(formulario.current!)
    definirSalvando(true)
    const resposta = await criarVideo({
      id: crypto.randomUUID(), artesao: sessao.artesao, peca: String(dados.get('peca') || ''),
      legenda: String(dados.get('legenda')), etiquetas: String(dados.get('etiquetas') || '').split(/\s+/).filter(Boolean),
      duracao: '0:00', visualizacoes: 0, curtidas: 0, comentarios: 0,
      publicadoEm: rascunho ? 'Rascunho' : 'agora', capa: '/fotos/ImagemBase.webp', situacao: rascunho ? 'rascunho' : 'publicada',
    })
    definirSalvando(false)
    if (resposta.erro) { avisar.erro('Não foi possível salvar', resposta.erro.mensagem); return }
    limpar()
    avisar.sucesso(rascunho ? 'Rascunho salvo' : 'Vídeo de demonstração publicado')
    roteador.refresh()
  }
  function publicar(evento: FormEvent<HTMLFormElement>) { evento.preventDefault(); void salvar(false) }
  function salvarRascunho() { void salvar(true) }

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
          <span className="campo-ajuda">Demonstração: apenas legenda e etiquetas são salvas; o arquivo não é enviado.</span>
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
          <button disabled={salvando} type="submit" className="botao botao-primario">
            Publicar
          </button>
          <button type="button" className="botao botao-fantasma" disabled={salvando} onClick={salvarRascunho}>
            Salvar rascunho
          </button>
        </div>
      </section>
    </form>
  )
}
