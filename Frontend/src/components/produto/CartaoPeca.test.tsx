import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import CartaoPeca from './CartaoPeca'
import { EstadoClienteProvider } from '@/store/estadoCliente'
import { FavoritosProvider } from '@/store/favoritos'
import type { Peca } from '@/types/dominio'

const peca: Peca = {
  slug: 'jarra-do-catalogo', nome: 'Jarra do catálogo', artesao: 'artesao-parceiro',
  territorio: 'Caruaru', tecnica: 'Cerâmica & Barro', categoria: 'Casa & Mesa',
  tipo: 'Jarras & Vasos', preco: 125, desconto: 0, disponibilidade: 'disponivel',
  historia: ['Feita à mão.'], imagem: '/fotos/jarra-cabocla.svg',
}

function navegar() {
  assert.fail('Renderizar o cartão não deve iniciar navegação.')
}

const roteador = {
  bfcacheId: "cartao-teste", back: navegar, forward: navegar, refresh: navegar,
  push: navegar, replace: navegar, prefetch: navegar,
}

function renderizar(dados: Peca) {
  return renderToStaticMarkup(
    <AppRouterContext.Provider value={roteador}>
      <EstadoClienteProvider>
        <FavoritosProvider>
          <CartaoPeca peca={dados} />
        </FavoritosProvider>
      </EstadoClienteProvider>
    </AppRouterContext.Provider>,
  ).replace(/\u00a0/g, ' ')
}

function precosDe(html: string) {
  const trecho = html.match(/<div class="cartao-peca-precos">([\s\S]*?)<\/div>/)
  assert.ok(trecho, 'O cartão deve mostrar os preços.')
  return trecho[1]
}

function textoDe(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}

test('desconto zero do catálogo exibe somente o preço, sem zeros extras ou oferta', () => {
  const precos = precosDe(renderizar(peca))
  assert.equal(textoDe(precos), 'R$ 125,00R$ 125')
  assert.doesNotMatch(precos, /preco-riscado|chip-desconto|chip-beneficio/)
})

test('desconto positivo preserva preço anterior, preço final e economia', () => {
  const precos = precosDe(renderizar({ ...peca, desconto: 20 }))
  assert.match(precos, /class="preco-riscado">R\$ 125,00<\/span>/)
  assert.match(precos, /class="so-leitor">R\$ 100,00<\/span>/)
  assert.match(textoDe(precos), /20% de desconto/)
  assert.match(precos, /class="chip-beneficio">Economize R\$ 25,00<\/span>/)
})

test('peça sem desconto e sem avaliação renderiza preço normal e dados essenciais', () => {
  // O catálogo serializa as avaliações ausentes como null no contrato JSON.
  const dados: Peca = JSON.parse(JSON.stringify({ ...peca, desconto: undefined, avaliacao: null, totalAvaliacoes: null }))
  const html = renderizar(dados)
  assert.equal(textoDe(precosDe(html)), 'R$ 125,00R$ 125')
  assert.doesNotMatch(html, /avaliacao-compacta|chip-desconto/)
  assert.match(html, /Jarra do catálogo/)
  assert.match(html, /href="\/pieces\/jarra-do-catalogo"/)
  assert.match(html, /Artesão parceiro/)
})
