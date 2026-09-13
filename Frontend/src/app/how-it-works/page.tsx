import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeCadeado, IconeCaminhao, IconePincel, IconeSacola, IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { listarColetivos } from '@/services/api/coletivos.servico'

const paraComprar = [
  { titulo: 'Escolha pela origem', texto: 'Filtre por técnica, território ou artesão. Cada peça mostra de onde vem e quem fez.' },
  { titulo: 'Converse antes de comprar', texto: 'Pergunte sobre tamanho, prazo ou encomenda direto na página da peça.' },
  { titulo: 'Pague com segurança', texto: 'O valor fica retido e só é repassado ao artesão depois que a peça chega até você.' },
  { titulo: 'Acompanhe a produção', texto: 'Você vê cada etapa, com notas escritas pelo próprio artesão durante o trabalho.' },
]

const paraVender = [
  { titulo: 'Cadastre-se sem burocracia', texto: 'Não exigimos CNPJ nem empresa aberta. Artesão informal vende normalmente.' },
  { titulo: 'Publique sua peça', texto: 'Fotos, história e preço. A ferramenta de apoio sugere um valor a partir de material e horas.' },
  { titulo: 'Passe pela curadoria', texto: 'Uma pessoa confere origem e autoria antes de publicar. Costuma levar até um dia útil.' },
  { titulo: 'Receba sem intermediário', texto: 'O pedido chega direto a você, e o repasse acontece depois da entrega confirmada.' },
]

const garantias = [
  { icone: <IconeSelo />, titulo: 'Selo de origem', texto: 'A associação do território confirma que a peça é feita à mão por quem diz ter feito.' },
  { icone: <IconeCadeado />, titulo: 'Pagamento retido', texto: 'Processado pelo Mercado Pago; liberado ao artesão só após a entrega.' },
  { icone: <IconeCaminhao />, titulo: 'Envio rastreado', texto: 'A peça sai da oficina com código de rastreio e prazo estimado.' },
]

export default async function ComoFunciona() {
  const { dados: coletivos } = await listarColetivos()

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Como funciona' }]} />

      <h1 className="titulo-pagina">Como funciona o Balaio</h1>
      <p className="subtitulo-pagina">
        Uma feira permanente entre quem faz e quem compra, sem atravessador. Aqui está o caminho dos dois lados.
      </p>

      <div className="duas-colunas">
        <section>
          <h2 className="secao-titulo secao-titulo-icone">
            <IconeSacola tamanho={22} />
            Para quem compra
          </h2>
          <ol className="passos">
            {paraComprar.map((p, i) => (
              <li key={p.titulo}>
                <span className="passo-numero">{i + 1}</span>
                <div>
                  <p className="passo-titulo">{p.titulo}</p>
                  <p className="autoria">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/" className="botao botao-primario" style={{ marginTop: 18 }}>
            Explorar o catálogo
            <IconeSetaDireita />
          </Link>
        </section>

        <section>
          <h2 className="secao-titulo secao-titulo-icone">
            <IconePincel tamanho={22} />
            Para quem faz
          </h2>
          <ol className="passos">
            {paraVender.map((p, i) => (
              <li key={p.titulo}>
                <span className="passo-numero">{i + 1}</span>
                <div>
                  <p className="passo-titulo">{p.titulo}</p>
                  <p className="autoria">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/login" className="botao botao-secundario" style={{ marginTop: 18 }}>
            Quero vender minhas peças
            <IconeSetaDireita />
          </Link>
        </section>
      </div>

      <section className="secao">
        <h2 className="secao-titulo">O que garantimos</h2>
        <div className="grade-tres">
          {garantias.map((g) => (
            <div className="cartao" key={g.titulo}>
              <span className="estado-vazio-icone" style={{ width: 52, height: 52, margin: '0 0 12px' }}>
                {g.icone}
              </span>
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>{g.titulo}</h3>
              <p className="autoria">{g.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="secao">
        <h2 className="secao-titulo">Cooperativas e associações</h2>
        <p className="subtitulo-pagina">
          Vários artesãos daqui vendem através de um coletivo, que divide forno, frete e curadoria.
        </p>
        <div className="grade-dois">
          {(coletivos ?? []).map((c) => (
            <Link href={`/collectives/${c.slug}`} className="cartao" key={c.slug}>
              <p className="territorio">{c.territorio}</p>
              <h3 style={{ fontSize: 18, margin: '4px 0 6px' }}>{c.nome}</h3>
              <p className="autoria">Desde {c.fundado} · {c.membros.length} ateliês</p>
              <p className="ver-peca" style={{ marginTop: 10 }}>
                Ver coletivo <IconeSetaDireita tamanho={14} />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Pagina>
  )
}
