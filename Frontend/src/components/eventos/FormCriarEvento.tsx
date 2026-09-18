'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Campo, Retrato } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarObrigatorio } from '@/utils/validacao'
import MapaEventosCliente from '@/components/eventos/MapaEventosCliente'
import { criarEvento } from '@/services/api/eventos.servico'
import { gerarSlugEvento } from '@/components/eventos/eventosLocais'
import { municipiosPE, rotuloTipoEvento, type Evento, type Ponto, type TipoEvento } from '@/mocks/eventos'
import { useDados } from '@/store/dados'

const idPorCampo: Record<string, string> = {
  nome: 'evento-nome',
  organizador: 'evento-organizador',
  periodo: 'evento-periodo',
  cidade: 'evento-cidade',
  local: 'evento-local',
  descricao: 'evento-descricao',
  participantes: 'participantes',
}

export default function FormCriarEvento() {
  const { artesaos, coletivos, erro: erroParticipantes } = useDados()
  const [salvando, definirSalvando] = useState(false)
  const [nome, definirNome] = useState('')
  const [tipo, definirTipo] = useState<TipoEvento>('feira')
  const [organizador, definirOrganizador] = useState('')
  const [periodo, definirPeriodo] = useState('')
  const [horario, definirHorario] = useState('')
  const [entrada, definirEntrada] = useState('Gratuita')
  const [cidade, definirCidade] = useState('')
  const [local, definirLocal] = useState('')
  const [endereco, definirEndereco] = useState('')
  const [descricao, definirDescricao] = useState('')
  const [pino, definirPino] = useState<Ponto | null>(null)
  const [artesaosEscolhidos, definirArtesaosEscolhidos] = useState<string[]>([])
  const [coletivosEscolhidos, definirColetivosEscolhidos] = useState<string[]>([])
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [publicado, definirPublicado] = useState<Evento | null>(null)

  const municipio = municipiosPE.find((m) => m.nome === cidade)
  const centroEscolha = municipio ? { lat: municipio.lat, lng: municipio.lng } : undefined
  const totalParticipantes = artesaosEscolhidos.length + coletivosEscolhidos.length

  function limparErro(chave: string) {
    definirErros((atuais) => {
      if (!(chave in atuais)) return atuais
      const resto = { ...atuais }
      delete resto[chave]
      return resto
    })
  }

  function escolherCidade(nomeCidade: string) {
    definirCidade(nomeCidade)
    limparErro('cidade')
    const escolhido = municipiosPE.find((m) => m.nome === nomeCidade)
    definirPino(escolhido ? { lat: escolhido.lat, lng: escolhido.lng } : null)
  }

  function alternarArtesao(slug: string) {
    limparErro('participantes')
    definirArtesaosEscolhidos((atuais) =>
      atuais.includes(slug) ? atuais.filter((s) => s !== slug) : [...atuais, slug],
    )
  }

  function alternarColetivo(slug: string) {
    limparErro('participantes')
    definirColetivosEscolhidos((atuais) =>
      atuais.includes(slug) ? atuais.filter((s) => s !== slug) : [...atuais, slug],
    )
  }

  function limparFormulario() {
    definirNome('')
    definirTipo('feira')
    definirOrganizador('')
    definirPeriodo('')
    definirHorario('')
    definirEntrada('Gratuita')
    definirCidade('')
    definirLocal('')
    definirEndereco('')
    definirDescricao('')
    definirPino(null)
    definirArtesaosEscolhidos([])
    definirColetivosEscolhidos([])
    definirErros({})
    definirPublicado(null)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return

    const problemas: Record<string, string> = {}
    const conferencias: [string, string | null][] = [
      ['nome', validarObrigatorio(nome, 'Dê um nome ao evento, como "Feira de Cerâmica de Tracunhaém"')],
      ['organizador', validarObrigatorio(organizador, 'Diga quem organiza: associação, prefeitura ou grupo')],
      ['periodo', validarObrigatorio(periodo, 'Informe as datas, como "12 e 13 de setembro, 2026"')],
      ['cidade', validarObrigatorio(cidade, 'Escolha o município onde o evento acontece')],
      ['local', validarObrigatorio(local, 'Informe o local, como "Pátio de Eventos Luiz Gonzaga"')],
      ['descricao', validarObrigatorio(descricao, 'Conte o que vai acontecer no evento')],
      ['participantes', totalParticipantes === 0 ? 'Marque pelo menos um artesão ou coletivo participante' : null],
    ]
    for (const [chave, problema] of conferencias) {
      if (problema) problemas[chave] = problema
    }

    if (Object.keys(problemas).length > 0) {
      definirErros(problemas)
      const primeiraChave = Object.keys(problemas)[0]
      document.getElementById(idPorCampo[primeiraChave])?.focus()
      avisar.erro('Confira os campos destacados', 'Alguns dados do evento ainda estão faltando.')
      return
    }

    const referencia = pino ?? centroEscolha
    if (!referencia) return

    const novoEvento: Evento = {
      slug: gerarSlugEvento(nome),
      nome: nome.trim(),
      tipo,
      organizador: organizador.trim(),
      descricao: descricao.trim(),
      periodo: periodo.trim(),
      horario: horario.trim(),
      entrada: entrada.trim() || 'Gratuita',
      cidade,
      local: local.trim(),
      endereco: endereco.trim() || `${cidade}, Pernambuco`,
      lat: referencia.lat,
      lng: referencia.lng,
      artesaos: artesaosEscolhidos,
      coletivos: coletivosEscolhidos,
      criadoPorVoce: true,
    }

    definirSalvando(true)
    const resposta = await criarEvento(novoEvento)
    definirSalvando(false)
    if (resposta.erro) { avisar.erro('Não foi possível publicar', resposta.erro.mensagem); return }
    avisar.sucesso('Evento publicado na agenda')
    definirPublicado(resposta.dados)
  }

  if (publicado) {
    return (
      <section className="cartao">
        <span className="selo selo-disponivel abaixo-3">
          <span className="selo-ponto" />
          Publicado
        </span>
        <h2 className="secao-titulo">Evento na agenda!</h2>
        <p className="texto-suave abaixo-4">
          “{publicado.nome}” já aparece no mapa da vitrine e na agenda, com o pino marcado em {publicado.cidade}.
          O evento foi salvo e está disponível na agenda.
        </p>
        <div className="acoes-linha acoes-empilhaveis">
          <Link href={`/events/${publicado.slug}`} className="botao botao-primario">
            Ver a página do evento
          </Link>
          <Link href="/events" className="botao botao-secundario">
            Ver a agenda
          </Link>
          <button type="button" className="botao botao-fantasma" onClick={limparFormulario}>
            Criar outro evento
          </button>
        </div>
      </section>
    )
  }

  return (
    <form className="cartao" onSubmit={enviar} noValidate>
      <h2 className="secao-titulo">Dados do evento</h2>
      {erroParticipantes && <p role="alert">{erroParticipantes}</p>}

      <Campo rotulo="Nome do evento" id="evento-nome" erro={erros.nome}>
        <input
          id="evento-nome"
          type="text"
          placeholder='Como "Feira de Cerâmica de Tracunhaém"'
          value={nome}
          onChange={(e) => {
            definirNome(e.target.value)
            limparErro('nome')
          }}
        />
      </Campo>

      <div className="grade-dois">
        <Campo rotulo="Tipo de evento" id="evento-tipo">
          <select id="evento-tipo" value={tipo} onChange={(e) => definirTipo(e.target.value as TipoEvento)}>
            {(Object.keys(rotuloTipoEvento) as TipoEvento[]).map((chave) => (
              <option key={chave} value={chave}>
                {rotuloTipoEvento[chave]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          rotulo="Quem organiza"
          id="evento-organizador"
          ajuda="Associação, prefeitura ou grupo responsável"
          erro={erros.organizador}
        >
          <input
            id="evento-organizador"
            type="text"
            placeholder="Como 'Associação dos Ceramistas'"
            value={organizador}
            onChange={(e) => {
              definirOrganizador(e.target.value)
              limparErro('organizador')
            }}
          />
        </Campo>
      </div>

      <div className="grade-dois">
        <Campo rotulo="Datas" id="evento-periodo" erro={erros.periodo}>
          <input
            id="evento-periodo"
            type="text"
            placeholder="Como '12 e 13 de setembro, 2026'"
            value={periodo}
            onChange={(e) => {
              definirPeriodo(e.target.value)
              limparErro('periodo')
            }}
          />
        </Campo>
        <Campo rotulo="Horário (opcional)" id="evento-horario">
          <input
            id="evento-horario"
            type="text"
            placeholder="Como '9h às 18h'"
            value={horario}
            onChange={(e) => definirHorario(e.target.value)}
          />
        </Campo>
      </div>

      <div className="grade-dois">
        <Campo rotulo="Município" id="evento-cidade" erro={erros.cidade}>
          <select id="evento-cidade" value={cidade} onChange={(e) => escolherCidade(e.target.value)}>
            <option value="">Escolha o município</option>
            {municipiosPE.map((m) => (
              <option key={m.nome} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Entrada" id="evento-entrada" ajuda="Deixe 'Gratuita' se não houver cobrança">
          <input
            id="evento-entrada"
            type="text"
            value={entrada}
            onChange={(e) => definirEntrada(e.target.value)}
          />
        </Campo>
      </div>

      <Campo rotulo="Local" id="evento-local" erro={erros.local}>
        <input
          id="evento-local"
          type="text"
          placeholder="Como 'Pátio de Eventos Luiz Gonzaga'"
          value={local}
          onChange={(e) => {
            definirLocal(e.target.value)
            limparErro('local')
          }}
        />
      </Campo>

      <Campo rotulo="Endereço (opcional)" id="evento-endereco">
        <input
          id="evento-endereco"
          type="text"
          placeholder="Rua, número e bairro"
          value={endereco}
          onChange={(e) => definirEndereco(e.target.value)}
        />
      </Campo>

      <div className="campo">
        <span className="campo-rotulo">Ponto exato no mapa</span>
        <span className="campo-ajuda">
          {cidade
            ? 'O pino começa no centro do município. Clique no mapa para marcar o endereço exato.'
            : 'Escolha o município para posicionar o pino, ou clique direto no mapa.'}
        </span>
        <div className="mapa-eventos mapa-eventos-escolha">
          <MapaEventosCliente
            aoEscolher={(ponto) => definirPino(ponto)}
            escolhido={pino}
            centro={centroEscolha}
            zoom={13}
            rotulo="Mapa para marcar o local exato do evento"
          />
        </div>
      </div>

      <Campo rotulo="O que vai acontecer" id="evento-descricao" erro={erros.descricao}>
        <textarea
          id="evento-descricao"
          placeholder="Conte o que o público vai encontrar: exposição, venda direta, oficinas, apresentações..."
          value={descricao}
          onChange={(e) => {
            definirDescricao(e.target.value)
            limparErro('descricao')
          }}
        />
      </Campo>

      <fieldset id="participantes" tabIndex={-1} className="campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="campo-rotulo">Quem vai participar?</legend>
        <span className="campo-ajuda">Marque os artesãos e coletivos da plataforma confirmados no evento.</span>
        <div className="lista-participantes">
          {artesaos.map((artesao) => (
            <label key={artesao.slug} className="opcao-participante">
              <input
                type="checkbox"
                id={`participante-${artesao.slug}`}
                checked={artesaosEscolhidos.includes(artesao.slug)}
                onChange={() => alternarArtesao(artesao.slug)}
              />
              <Retrato imagem={artesao.imagem} />
              <span className="encolhivel">
                <span className="texto-forte">{artesao.nome}</span>
                <span className="autoria">{artesao.atelie}</span>
              </span>
            </label>
          ))}
          {coletivos.map((coletivo) => (
            <label key={coletivo.slug} className="opcao-participante">
              <input
                type="checkbox"
                id={`participante-${coletivo.slug}`}
                checked={coletivosEscolhidos.includes(coletivo.slug)}
                onChange={() => alternarColetivo(coletivo.slug)}
              />
              <Retrato imagem={coletivo.imagem} />
              <span className="encolhivel">
                <span className="texto-forte">{coletivo.nome}</span>
                <span className="autoria">Coletivo · {coletivo.territorio}</span>
              </span>
            </label>
          ))}
        </div>
        {erros.participantes && (
          <p className="campo-erro acima-2" role="status">
            {erros.participantes}
          </p>
        )}
        {totalParticipantes > 0 && (
          <p className="campo-ajuda acima-2">
            {totalParticipantes} {totalParticipantes === 1 ? 'participante marcado' : 'participantes marcados'}.
          </p>
        )}
      </fieldset>

      <div className="acoes-linha acoes-empilhaveis acima-4">
        <button disabled={salvando || !!erroParticipantes} type="submit" className="botao botao-primario">
          Publicar na agenda
        </button>
        <Link href="/events" className="botao botao-fantasma">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
