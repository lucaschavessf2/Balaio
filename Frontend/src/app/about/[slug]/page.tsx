import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'

type Documento = { titulo: string; resumo: string; secoes: { titulo: string; paragrafos: string[] }[] }

const documentos: Record<string, Documento> = {
  terms: {
    titulo: 'Termos de uso',
    resumo: 'As regras de convivência entre quem compra, quem faz e a plataforma.',
    secoes: [
      {
        titulo: 'O que a plataforma é',
        paragrafos: [
          'O Balaio aproxima artesãos de Pernambuco de pessoas que querem comprar direto de quem faz. Não somos a fabricante das peças nem a transportadora: intermediamos a venda, a comunicação e o pagamento.',
          'Cada peça é de responsabilidade do artesão que a publicou, incluindo a descrição, o prazo informado e a autoria declarada.',
        ],
      },
      {
        titulo: 'Curadoria e autenticidade',
        paragrafos: [
          'Toda peça passa por curadoria antes de entrar no catálogo. Recusamos produto industrializado, revenda de terceiros e foto de banco de imagens.',
          'O Selo de Origem é emitido pela associação do território, não pela plataforma. Ele indica que a origem e a autoria foram conferidas por quem conhece o ofício localmente.',
        ],
      },
      {
        titulo: 'Pagamento e repasse',
        paragrafos: [
          'O pagamento é processado por parceiro externo. O valor fica retido e é repassado ao artesão após a confirmação da entrega.',
          'Se a peça não for entregue ou chegar diferente do anunciado, o comprador pode abrir uma mediação. A plataforma analisa as duas versões antes de decidir sobre o repasse.',
        ],
      },
      {
        titulo: 'Cancelamento',
        paragrafos: [
          'Peças em estoque podem ser canceladas enquanto não tiverem sido despachadas.',
          'Peças sob encomenda podem ser canceladas até o artesão iniciar a produção. Depois disso, o cancelamento depende de acordo entre as partes, porque o material já foi comprado e o tempo já foi investido.',
        ],
      },
    ],
  },
  privacy: {
    titulo: 'Política de privacidade',
    resumo: 'Que dados guardamos, por quê, e o que você pode pedir para apagar.',
    secoes: [
      {
        titulo: 'O que coletamos',
        paragrafos: [
          'Dados de cadastro (nome, e-mail, telefone), endereço de entrega e histórico de pedidos. Para artesãos, também o território, a técnica e a chave de recebimento.',
          'Não guardamos dados de cartão. Eles vão direto para o processador de pagamento.',
        ],
      },
      {
        titulo: 'Para que usamos',
        paragrafos: [
          'Para completar a compra, calcular frete, permitir a conversa entre comprador e artesão e emitir nota quando for o caso.',
          'Usamos dados agregados de venda para gerar os insights que aparecem no painel do artesão. Esses números descrevem o próprio ateliê, não pessoas identificáveis.',
        ],
      },
      {
        titulo: 'Com quem compartilhamos',
        paragrafos: [
          'Com o processador de pagamento e a transportadora, apenas o necessário para concluir a entrega.',
          'O artesão vê o nome e o endereço de quem comprou, porque é ele quem despacha a peça. Não compartilhamos sua lista de pedidos com outros artesãos.',
        ],
      },
      {
        titulo: 'Seus direitos',
        paragrafos: [
          'Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pela sua conta ou pelo suporte.',
          'Alguns registros de venda precisam ser mantidos por obrigação fiscal mesmo após a exclusão da conta, mas ficam desvinculados do seu perfil.',
        ],
      },
    ],
  },
  'who-we-are': {
    titulo: 'Quem somos',
    resumo: 'Um projeto que nasceu de uma pergunta simples: por que o artesão ganha tão pouco do que a peça vale?',
    secoes: [
      {
        titulo: 'A origem',
        paragrafos: [
          'O artesanato de Pernambuco tem alcance cultural enorme e alcance digital pequeno. Boa parte da produção é vendida em feiras, num calendário sazonal, para quem passa por ali.',
          'Quando a venda sai da feira, costuma passar por intermediários que capturam parte da margem de quem produz. O Balaio existe para encurtar esse caminho.',
        ],
      },
      {
        titulo: 'O que defendemos',
        paragrafos: [
          'Que origem, técnica e autoria sejam visíveis, porque é isso que separa o artesanato do produto que apenas o imita.',
          'Que o artesão não precise se formalizar para começar a vender, e que a plataforma se adapte a quem tem pouca familiaridade digital, e não o contrário.',
        ],
      },
    ],
  },
  press: {
    titulo: 'Imprensa',
    resumo: 'Material e contato para quem quer falar sobre o projeto.',
    secoes: [
      {
        titulo: 'Sobre o projeto',
        paragrafos: [
          'O Balaio é um marketplace da economia criativa e do artesanato de Pernambuco, criado como projeto integrador acadêmico a partir de um estudo de Análise de Domínio.',
        ],
      },
      {
        titulo: 'Contato',
        paragrafos: ['Pedidos de entrevista e material de imprensa podem ser enviados pelo suporte da plataforma.'],
      },
    ],
  },
  cooperatives: {
    titulo: 'Para cooperativas',
    resumo: 'Como associações e cooperativas de artesãos entram na plataforma.',
    secoes: [
      {
        titulo: 'Perfil coletivo',
        paragrafos: [
          'Uma associação pode ter um perfil próprio, que reúne os ateliês membros, as técnicas do território e o apoio institucional recebido.',
          'O coletivo também é quem emite o Selo de Origem das peças daquele território, porque é quem tem como conferir autoria e processo de perto.',
        ],
      },
      {
        titulo: 'Como participar',
        paragrafos: [
          'A associação se cadastra, indica os ateliês membros e passa por uma verificação única. Depois disso, cada artesão gerencia as próprias peças normalmente.',
        ],
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(documentos).map((slug) => ({ slug }))
}

export default async function Institucional({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = documentos[slug]
  if (!doc) notFound()

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: doc.titulo }]} />

      <h1 className="titulo-pagina">{doc.titulo}</h1>
      <p className="subtitulo-pagina">{doc.resumo}</p>

      <article className="cartao texto-longo">
        {doc.secoes.map((secao) => (
          <section key={secao.titulo}>
            <h2 className="secao-titulo">{secao.titulo}</h2>
            {secao.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <p className="campo-ajuda">
          Documento de demonstração deste protótipo. Não constitui termo jurídico válido.
        </p>
      </article>
    </Pagina>
  )
}
