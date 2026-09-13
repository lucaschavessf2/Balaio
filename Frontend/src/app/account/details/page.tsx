import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { Campo, Migalhas } from '@/components/ui/Basicos'
import FormularioSimulado from '@/components/forms/FormularioSimulado'
import TrocarFoto from '@/components/forms/TrocarFoto'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuConta from '@/components/conta/MenuConta'
import { IconeCadeado } from '@/components/ui/Icones'

export default function DadosDaConta() {
  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Minha conta', href: '/account' }, { texto: 'Meus dados' }]}
      />

      <MenuDrawer titulo="Minha conta" rotulo="Minha conta">
        <MenuConta ativo="dados" />
      </MenuDrawer>

      <h1 className="titulo-pagina">Meus dados</h1>
      <p className="subtitulo-pagina">Seu nome, contatos e preferências de compra.</p>

      <div className="conta-hub">
        <FormularioSimulado textoSucesso="Dados da conta salvos">
          <section className="cartao">
            <TrocarFoto imagemInicial="/fotos/jarra-cabocla.svg" rotulo="Carlos de Olinda" />

            <Campo rotulo="Nome completo" id="conta-nome">
              <input id="conta-nome" defaultValue="Carlos de Olinda" autoComplete="name" required />
            </Campo>
            <Campo rotulo="E-mail" id="conta-email">
              <input id="conta-email" type="email" defaultValue="carlos@exemplo.com" autoComplete="email" required />
            </Campo>
            <Campo rotulo="Telefone" ajuda="Usado só para avisos sobre a entrega." id="conta-telefone">
              <input id="conta-telefone" type="tel" defaultValue="(81) 99999-0000" autoComplete="tel" />
            </Campo>

            <Campo
              rotulo="Que tipo de comprador você é?"
              ajuda="Ajuda a plataforma a sugerir peças mais úteis para você."
              id="conta-tipo"
            >
              <select id="conta-tipo" defaultValue="final">
                <option value="final">Compro para mim</option>
                <option value="presente">Compro para presentear</option>
                <option value="lojista">Sou lojista e revendo</option>
                <option value="turista">Conheci em uma viagem a PE</option>
              </select>
            </Campo>

            <button type="submit" className="botao botao-primario">
              Salvar alterações
            </button>
          </section>
        </FormularioSimulado>

        <div className="cartao">
          <h2 className="secao-titulo">Segurança</h2>
          <p className="autoria abaixo-3">Sua senha foi alterada pela última vez em 10 de fevereiro de 2026.</p>
          <Link href="/login/recover" className="botao botao-secundario botao-largo">
            <IconeCadeado />
            Alterar senha
          </Link>
        </div>
      </div>
    </Pagina>
  )
}
