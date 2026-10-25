'use strict';

/* =========================================================
 * Mini-ERP de Feira — HTML + CSS + JS puro, dados no localStorage
 * ========================================================= */

const CHAVE_CONTAS = 'minierp_contas_v2';        // lista de empresas (login)
const PREFIXO_DADOS = 'minierp_dados_v2_';       // + id da empresa: dados separados por empresa
const CHAVE_SESSAO = 'minierp_sessao';           // sessionStorage: empresa logada nesta aba

// ---------- Utilidades ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const brl = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (v, casas = 2) => (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: casas });
const pct = v => fmt(v, 1) + '%';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const numero = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const arred = v => Math.round(v * 100) / 100;
const dataLocal = iso => new Date(iso).toLocaleDateString('pt-BR');
const horaLocal = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const diaChave = iso => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const agoraInput = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('mostrar');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('mostrar'), 2400);
}

// ---------- Dados ----------
function estadoVazio() {
  return {
    config: { empresa: '', chavePix: '', recebedor: '', cidade: '', margem: 65, alertaMin: 5 },
    ingredientes: [], // {id, nome, unidade, qtdEmb, precoEmb}
    produtos: [],     // {id, nome, emoji, modo:'receita'|'compra', receita:[{ingId,qtd}], rendimento, custoCompra, margem, preco, estoqueMin, feitoNaHora}
    lotes: [],        // {id, produtoId, qtd, data, custoUnit, obs}
    vendas: []        // {id, data, itens:[{produtoId,nome,qtd,preco,custo}], total, custo, pagamento, recebido, troco}
  };
}

const normalizarDb = d => {
  const base = estadoVazio();
  return { ...base, ...d, config: { ...base.config, ...(d && d.config) } };
};

function lerJSON(chave, padrao) {
  try { const v = JSON.parse(localStorage.getItem(chave)); return v ?? padrao; }
  catch (e) { return padrao; }
}
function gravarJSON(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
  catch (e) { toast('Atenção: não foi possível salvar no navegador'); return false; }
}

// ---------- Contas (login básico, só no navegador) ----------
// Contas: {id, nome, icone, usuario, senha (hash), demo: 'moki'|'brigadeiro'|'pastel'|'cafe'|null}
const lerContas = () => lerJSON(CHAVE_CONTAS, []);
const gravarContas = contas => gravarJSON(CHAVE_CONTAS, contas);
const normalizarUsuario = u => String(u || '').trim().toLowerCase();

// Hash simples (cyrb53) para não guardar a senha em texto puro.
// É um login didático: os dados continuam no navegador e não há servidor.
function hashSenha(usuario, senha) {
  const str = 'minierp|' + normalizarUsuario(usuario) + '|' + senha;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function criarConta({ nome, icone, usuario, senha, demo = null, dados }) {
  const contas = lerContas();
  const conta = { id: uid(), nome, icone: icone || '🏪', usuario: normalizarUsuario(usuario), senha: hashSenha(usuario, senha), demo };
  contas.push(conta);
  gravarContas(contas);
  const d = normalizarDb(dados || estadoVazio());
  d.config.empresa = nome;
  gravarJSON(PREFIXO_DADOS + conta.id, d);
  return conta;
}

let empresaAtual = null; // conta logada
let db = estadoVazio();  // dados da empresa logada

function salvar() {
  if (empresaAtual) gravarJSON(PREFIXO_DADOS + empresaAtual.id, db);
}

const ingPorId = id => db.ingredientes.find(i => i.id === id);
const prodPorId = id => db.produtos.find(p => p.id === id);
const custoUnitIng = ing => ing && ing.qtdEmb > 0 ? ing.precoEmb / ing.qtdEmb : 0;

function custoReceita(p) {
  return (p.receita || []).reduce((s, it) => s + custoUnitIng(ingPorId(it.ingId)) * numero(it.qtd), 0);
}

function custoProduto(p) {
  if (p.modo === 'compra') return numero(p.custoCompra);
  return p.rendimento > 0 ? custoReceita(p) / p.rendimento : 0;
}

// margem sobre o preço de venda: preço = custo / (1 - margem)
const precoSugerido = (custo, margem) => margem > 0 && margem < 100 ? custo / (1 - margem / 100) : custo;

function estoque(pid) {
  const entrou = db.lotes.filter(l => l.produtoId === pid).reduce((s, l) => s + l.qtd, 0);
  const saiu = db.vendas.reduce((s, v) => s + v.itens.filter(i => i.produtoId === pid).reduce((a, i) => a + i.qtd, 0), 0);
  return entrou - saiu;
}

const minimoDe = p => p.estoqueMin ?? db.config.alertaMin;

function statusEstoque(p) {
  if (p.feitoNaHora) return { classe: 'ok', texto: 'Na hora' };
  const e = estoque(p.id);
  if (e <= 0) return { classe: 'zero', texto: 'Esgotado' };
  if (e <= minimoDe(p)) return { classe: 'baixo', texto: 'Acabando' };
  return { classe: 'ok', texto: 'OK' };
}

// ---------- Navegação ----------
let viewAtual = 'caixa';
const renderizadores = {};

function irPara(view) {
  viewAtual = view;
  $$('.view').forEach(v => v.classList.toggle('ativa', v.id === 'view-' + view));
  $$('.abas button').forEach(b => b.classList.toggle('ativa', b.dataset.view === view));
  renderizar();
  window.scrollTo(0, 0);
}

function renderizar() {
  if (!empresaAtual) return;
  $('#nome-empresa').textContent = empresaAtual.nome;
  $('#logo-empresa').textContent = empresaAtual.icone || '🏪';
  document.title = empresaAtual.nome + ' · Mini-ERP de Feira';
  renderizadores[viewAtual]();
}

$$('.abas button').forEach(b => b.addEventListener('click', () => irPara(b.dataset.view)));

// ---------- Modal ----------
const modal = $('#modal');
function abrirModal(titulo, html, aoMontar) {
  $('#modal-titulo').textContent = titulo;
  // troca o elemento a cada abertura para não acumular event listeners
  const antigo = $('#modal-corpo');
  const corpo = antigo.cloneNode(false);
  antigo.replaceWith(corpo);
  corpo.innerHTML = html;
  if (!modal.open) modal.showModal();
  if (aoMontar) aoMontar(corpo);
}
const fecharModal = () => modal.open && modal.close();
$('#modal-fechar').addEventListener('click', fecharModal);
modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });

const blocoVazioDemo = (texto) => `
  <div class="cartao vazio">
    <span class="grande">${esc(empresaAtual?.icone || '🏪')}</span>
    <p>${texto}</p>
    <button class="btn" data-acao="demo">Carregar dados de demonstração</button>
  </div>`;

document.addEventListener('click', e => {
  if (e.target.closest('[data-acao="demo"]')) carregarDemo();
});

/* =========================================================
 * 1. CAIXA (PDV)
 * ========================================================= */
let carrinho = {}; // produtoId -> qtd

const totalCarrinho = () => Object.entries(carrinho).reduce((s, [id, q]) => s + (prodPorId(id)?.preco || 0) * q, 0);

renderizadores.caixa = function () {
  const el = $('#view-caixa');
  if (!db.produtos.length) {
    el.innerHTML = blocoVazioDemo('Nenhum produto cadastrado ainda. Cadastre em <strong>Produtos</strong> ou carregue a demonstração.');
    return;
  }
  const acabando = db.produtos.filter(p => statusEstoque(p).classe !== 'ok');
  const itens = Object.entries(carrinho).filter(([id]) => prodPorId(id));
  const ultimas = db.vendas.slice(-5).reverse();

  el.innerHTML = `
    ${acabando.length ? `<div class="alerta amarelo">⚠️ Estoque baixo: ${acabando.map(p => `${esc(p.nome)} (${estoque(p.id)})`).join(', ')}</div>` : ''}
    <div class="grade-produtos">
      ${db.produtos.map(p => {
        const st = statusEstoque(p);
        const q = carrinho[p.id];
        return `<button class="produto-btn ${st.classe === 'zero' ? 'esgotado' : ''}" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)}, ${brl(p.preco)}">
          ${q ? `<span class="qtd-carrinho">${q}</span>` : ''}
          <span class="etiqueta ${st.classe}" title="${p.feitoNaHora ? 'Feito na hora' : 'Estoque disponível'}">${p.feitoNaHora ? 'na hora' : estoque(p.id) - (q || 0)}</span>
          <span class="emoji">${esc(p.emoji || '🍪')}</span>
          <span class="nome">${esc(p.nome)}</span>
          <span class="preco">${brl(p.preco)}</span>
        </button>`;
      }).join('')}
    </div>

    ${itens.length ? `
      <div class="cartao" style="margin-top:12px">
        <div class="cab-secao" style="margin-bottom:0"><h3 style="margin:0">Pedido</h3>
          <button class="btn btn-sec btn-peq" id="limpar-carrinho">Limpar</button></div>
        <ul class="lista carrinho">
          ${itens.map(([id, q]) => { const p = prodPorId(id); return `
            <li><div class="info"><div class="titulo">${esc(p.emoji || '')} ${esc(p.nome)}</div><div class="sub">${brl(p.preco)} cada</div></div>
              <div class="qtd"><button data-menos="${id}" aria-label="Menos">−</button><strong>${q}</strong><button data-mais="${id}" aria-label="Mais">+</button></div>
              <div class="valor" style="min-width:76px">${brl(p.preco * q)}</div></li>`; }).join('')}
        </ul>
      </div>` : ''}

    <div class="barra-total">
      <div><div class="rotulo">Total</div><div class="total">${brl(totalCarrinho())}</div></div>
      <button class="btn" id="cobrar" ${itens.length ? '' : 'disabled'}>Cobrar →</button>
    </div>

    ${ultimas.length ? `
      <h3>Últimas vendas</h3>
      <div class="cartao"><ul class="lista">
        ${ultimas.map(v => `<li><div class="info"><div class="titulo">${v.pagamento === 'pix' ? '⚡ Pix' : '💵 Dinheiro'} · ${horaLocal(v.data)}</div>
          <div class="sub">${v.itens.map(i => `${i.qtd}× ${esc(i.nome)}`).join(', ')}</div></div>
          <div class="valor">${brl(v.total)}</div>
          <button class="btn-icone" data-estornar="${v.id}" title="Cancelar venda" aria-label="Cancelar venda">↩️</button></li>`).join('')}
      </ul></div>` : ''}
  `;

  $$('[data-add]', el).forEach(b => b.addEventListener('click', () => adicionar(b.dataset.add)));
  $$('[data-mais]', el).forEach(b => b.addEventListener('click', () => adicionar(b.dataset.mais)));
  $$('[data-menos]', el).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.menos;
    carrinho[id]--; if (carrinho[id] <= 0) delete carrinho[id];
    renderizar();
  }));
  $('#limpar-carrinho', el)?.addEventListener('click', () => { carrinho = {}; renderizar(); });
  $('#cobrar', el)?.addEventListener('click', abrirCobranca);
  $$('[data-estornar]', el).forEach(b => b.addEventListener('click', () => {
    if (!confirm('Cancelar esta venda? Os itens voltam para o estoque.')) return;
    db.vendas = db.vendas.filter(v => v.id !== b.dataset.estornar);
    salvar(); renderizar(); toast('Venda cancelada');
  }));
};

function adicionar(id) {
  const atual = carrinho[id] || 0;
  if (!prodPorId(id).feitoNaHora && atual + 1 > estoque(id)) {
    toast('Sem estoque suficiente — registre um lote em Produção');
    return;
  }
  carrinho[id] = atual + 1;
  renderizar();
}

function abrirCobranca() {
  const total = arred(totalCarrinho());
  let forma = 'dinheiro';

  const desenhar = () => {
    abrirModal('Receber pagamento', `
      <div class="total-grande">${brl(total)}</div>
      <div class="segmentado">
        <button data-forma="dinheiro" class="${forma === 'dinheiro' ? 'ativa' : ''}">💵 Dinheiro</button>
        <button data-forma="pix" class="${forma === 'pix' ? 'ativa' : ''}">⚡ Pix</button>
      </div>
      <div id="area-pagamento"></div>
    `, corpo => {
      $$('[data-forma]', corpo).forEach(b => b.addEventListener('click', () => { forma = b.dataset.forma; desenhar(); }));
      forma === 'dinheiro' ? montarDinheiro($('#area-pagamento'), total) : montarPix($('#area-pagamento'), total);
    });
  };
  desenhar();
}

function montarDinheiro(area, total) {
  const notas = [total, 10, 20, 50, 100].filter((n, i) => i === 0 || n >= total);
  area.innerHTML = `
    <label for="recebido">Valor recebido</label>
    <input id="recebido" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00">
    <div class="notas">${notas.map((n, i) => `<button class="btn btn-sec btn-peq" data-nota="${n}">${i === 0 ? 'Exato' : 'R$ ' + n}</button>`).join('')}</div>
    <div class="troco" id="troco">Informe o valor recebido</div>
    <button class="btn btn-verde btn-bloco" id="confirmar" disabled>Confirmar venda</button>
  `;
  const inp = $('#recebido', area);
  const atualizar = () => {
    const rec = numero(inp.value);
    const troco = arred(rec - total);
    const ok = rec > 0 && troco >= 0;
    $('#troco', area).innerHTML = !rec ? 'Informe o valor recebido'
      : ok ? `Troco<strong>${brl(troco)}</strong>` : `<span style="color:var(--vermelho)">Faltam ${brl(-troco)}</span>`;
    $('#confirmar', area).disabled = !ok;
  };
  inp.addEventListener('input', atualizar);
  $$('[data-nota]', area).forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.nota; atualizar(); }));
  $('#confirmar', area).addEventListener('click', () => {
    const rec = numero(inp.value);
    registrarVenda('dinheiro', rec, arred(rec - total));
  });
}

function montarPix(area, total) {
  const c = db.config;
  if (!c.chavePix) {
    area.innerHTML = `<div class="alerta amarelo">Cadastre sua chave Pix em <strong>Ajustes</strong> para gerar o QR Code.</div>
      <button class="btn btn-sec btn-bloco" id="ir-ajustes">Ir para Ajustes</button>`;
    $('#ir-ajustes', area).addEventListener('click', () => { fecharModal(); irPara('ajustes'); });
    return;
  }
  const payload = Pix.gerarPayload({ chave: c.chavePix, nome: c.recebedor || c.empresa, cidade: c.cidade, valor: total });
  area.innerHTML = `
    <div class="qr-box"><div id="qrcode"></div></div>
    <p class="dica" style="text-align:center">Peça para o cliente escanear no app do banco. Valor já preenchido: <strong>${brl(total)}</strong></p>
    <div class="copia-cola" id="payload">${esc(payload)}</div>
    <div class="btns" style="margin-bottom:10px"><button class="btn btn-sec btn-peq" id="copiar">📋 Copiar código Pix</button></div>
    <button class="btn btn-verde btn-bloco" id="confirmar">✅ Pix recebido — confirmar venda</button>
    <p class="dica">Confira o recebimento no app do banco antes de confirmar.</p>
  `;
  if (window.QRCode) {
    new QRCode($('#qrcode', area), { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
  } else {
    $('#qrcode', area).innerHTML = '<p class="dica">Não foi possível carregar o gerador de QR Code (js/lib/qrcode.min.js). Use o “copia e cola” abaixo.</p>';
  }
  $('#copiar', area).addEventListener('click', () => copiar(payload));
  $('#confirmar', area).addEventListener('click', () => registrarVenda('pix', total, 0));
}

function copiar(texto) {
  const ok = () => toast('Código copiado!');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto).then(ok, () => copiarFallback(texto, ok));
  } else copiarFallback(texto, ok);
}
function copiarFallback(texto, ok) {
  const t = document.createElement('textarea');
  t.value = texto; document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); ok(); } catch (e) { toast('Não foi possível copiar'); }
  t.remove();
}

function registrarVenda(pagamento, recebido, troco) {
  const itens = Object.entries(carrinho).map(([id, qtd]) => {
    const p = prodPorId(id);
    return { produtoId: id, nome: p.nome, qtd, preco: p.preco, custo: arred(custoProduto(p)) };
  }).filter(i => i.qtd > 0);
  if (!itens.length) return;
  const total = arred(itens.reduce((s, i) => s + i.preco * i.qtd, 0));
  const custo = arred(itens.reduce((s, i) => s + i.custo * i.qtd, 0));
  db.vendas.push({ id: uid(), data: new Date().toISOString(), itens, total, custo, pagamento, recebido, troco });
  salvar();
  carrinho = {};
  fecharModal();
  renderizar();
  toast(pagamento === 'pix' ? 'Venda registrada (Pix) ✅' : `Venda registrada ✅ Troco: ${brl(troco)}`);
}

/* =========================================================
 * 2. PRODUTOS E FICHA TÉCNICA
 * ========================================================= */
let abaProdutos = 'produtos';

// Ícones sugeridos para negócios de feira (doces, salgados e bebidas)
const ICONES_PRODUTO = [
  '🍪', '🍫', '🍩', '🧁', '🎂', '🍰', '🥧', '🍮', '🍬', '🍭', '🍯', '🍓',
  '🍒', '🍌', '🍋', '🥥', '🥜', '🌰', '❤️', '⭐', '🥐', '🥖', '🍞', '🥟',
  '🥪', '🌭', '🍔', '🍕', '🧀', '🥚', '🍗', '🌮', '☕', '🍵', '🥤',
  '🧃', '🍹', '🥛', '💧', '🍿', '🍦', '🍨', '🎁', '📦'
];

renderizadores.produtos = function () {
  const el = $('#view-produtos');
  el.innerHTML = `
    <div class="segmentado">
      <button data-aba="produtos" class="${abaProdutos === 'produtos' ? 'ativa' : ''}">Produtos</button>
      <button data-aba="ingredientes" class="${abaProdutos === 'ingredientes' ? 'ativa' : ''}">Ingredientes</button>
    </div>
    <div id="conteudo-produtos"></div>`;
  $$('[data-aba]', el).forEach(b => b.addEventListener('click', () => { abaProdutos = b.dataset.aba; renderizar(); }));
  abaProdutos === 'produtos' ? listarProdutos($('#conteudo-produtos')) : listarIngredientes($('#conteudo-produtos'));
};

function listarProdutos(el) {
  el.innerHTML = `
    <div class="cab-secao"><h2>Produtos</h2><button class="btn btn-peq" id="novo-produto">+ Novo produto</button></div>
    ${db.produtos.length ? `<div class="cartao"><ul class="lista">
      ${db.produtos.map(p => {
        const custo = custoProduto(p);
        const margem = p.preco > 0 ? (1 - custo / p.preco) * 100 : 0;
        return `<li>
          <span style="font-size:1.6rem">${esc(p.emoji || '🍪')}</span>
          <div class="info"><div class="titulo">${esc(p.nome)}</div>
            <div class="sub">${p.modo === 'compra' ? 'Revenda' : `Ficha técnica · rende ${p.rendimento}`}${p.feitoNaHora ? ' · feito na hora' : ''} · custo ${brl(custo)} · margem ${pct(margem)}</div></div>
          <div class="valor">${brl(p.preco)}</div>
          <button class="btn-icone" data-editar="${p.id}" aria-label="Editar">✏️</button></li>`;
      }).join('')}</ul></div>`
      : blocoVazioDemo('Cadastre seus produtos com a ficha técnica (receita) ou com o custo de compra, para revenda.')}
  `;
  $('#novo-produto', el).addEventListener('click', () => formProduto());
  $$('[data-editar]', el).forEach(b => b.addEventListener('click', () => formProduto(prodPorId(b.dataset.editar))));
}

function formProduto(prod) {
  const p = prod ? JSON.parse(JSON.stringify(prod)) : {
    id: uid(), nome: '', emoji: '🍪', modo: db.ingredientes.length ? 'receita' : 'compra',
    receita: [], rendimento: 10, custoCompra: 0, margem: db.config.margem, preco: 0, estoqueMin: db.config.alertaMin
  };
  if (p.modo === 'receita' && !p.receita.length && db.ingredientes.length) p.receita.push({ ingId: db.ingredientes[0].id, qtd: 0 });

  const opcoesIng = sel => db.ingredientes.map(i => `<option value="${i.id}" ${i.id === sel ? 'selected' : ''}>${esc(i.nome)}</option>`).join('');

  const desenhar = () => abrirModal(prod ? 'Editar produto' : 'Novo produto', `
    <div class="linha2" style="grid-template-columns:1fr 118px">
      <div><label for="p-nome">Nome</label><input id="p-nome" value="${esc(p.nome)}" placeholder="Ex.: Cookie tradicional"></div>
      <div><label for="p-emoji">Ícone</label>
        <div class="campo-icone">
          <input id="p-emoji" value="${esc(p.emoji)}" maxlength="4">
          <button type="button" class="btn btn-sec btn-peq" id="abrir-icones" aria-expanded="false" aria-controls="painel-icones" title="Escolher ícone">😀 ▾</button>
        </div></div>
    </div>
    <div class="painel-icones" id="painel-icones" hidden>
      ${ICONES_PRODUTO.map(i => `<button type="button" data-icone="${i}" class="${i === p.emoji ? 'ativa' : ''}" aria-label="Usar ícone ${i}">${i}</button>`).join('')}
      <p class="dica">Ou digite/cole qualquer emoji no campo (no Windows: tecla <strong>Windows + .</strong>).</p>
    </div>
    <label>Como calcular o custo?</label>
    <div class="segmentado">
      <button type="button" data-modo="receita" class="${p.modo === 'receita' ? 'ativa' : ''}">Ficha técnica</button>
      <button type="button" data-modo="compra" class="${p.modo === 'compra' ? 'ativa' : ''}">Custo de compra</button>
    </div>
    ${p.modo === 'receita' ? `
      ${db.ingredientes.length ? `
        <div id="linhas-receita">${p.receita.map((it, idx) => {
          const ing = ingPorId(it.ingId);
          return `<div class="receita-linha">
            <select data-ing="${idx}">${opcoesIng(it.ingId)}</select>
            <div><input type="number" inputmode="decimal" step="any" min="0" data-qtd="${idx}" value="${it.qtd || ''}" placeholder="qtd"><div class="un">${esc(ing?.unidade || '')}</div></div>
            <button type="button" class="btn-icone" data-rem="${idx}" aria-label="Remover">🗑️</button></div>`;
        }).join('')}</div>
        <button type="button" class="btn btn-sec btn-peq" id="add-linha">+ Ingrediente</button>
        <label for="p-rend">Rendimento da receita (unidades)</label>
        <input id="p-rend" type="number" inputmode="numeric" min="1" step="1" value="${p.rendimento}">`
      : `<div class="alerta amarelo">Cadastre ingredientes primeiro (aba Ingredientes) ou use “Custo de compra”.</div>`}
    ` : `
      <label for="p-compra">Custo de compra por unidade (R$)</label>
      <input id="p-compra" type="number" inputmode="decimal" step="0.01" min="0" value="${p.custoCompra || ''}">
      <p class="dica">Use para produtos de revenda (bebidas, embalados de terceiros).</p>
    `}
    <div class="linha2">
      <div><label for="p-margem">Margem desejada (%)</label><input id="p-margem" type="number" inputmode="decimal" min="0" max="95" value="${p.margem}"></div>
      <div><label for="p-preco">Preço de venda (R$)</label><input id="p-preco" type="number" inputmode="decimal" step="0.01" min="0" value="${p.preco || ''}"></div>
    </div>
    <div class="resumo-custo" id="resumo"></div>
    <label class="check"><input type="checkbox" id="p-nahora" ${p.feitoNaHora ? 'checked' : ''}>
      Feito na hora (não controla estoque)</label>
    <p class="dica">Marque para itens preparados no pedido, como café ou pastel frito na hora. O custo continua sendo calculado.</p>
    <div id="bloco-min" ${p.feitoNaHora ? 'hidden' : ''}>
      <label for="p-min">Alertar quando o estoque chegar a</label>
      <input id="p-min" type="number" inputmode="numeric" min="0" value="${p.estoqueMin ?? db.config.alertaMin}">
    </div>
    <div class="modal-acoes">
      ${prod ? '<button class="btn btn-perigo" id="excluir">Excluir</button>' : ''}
      <button class="btn" id="salvar">Salvar</button>
    </div>
  `, corpo => {
    const ler = () => {
      p.nome = $('#p-nome', corpo).value.trim();
      p.emoji = $('#p-emoji', corpo).value.trim();
      p.margem = numero($('#p-margem', corpo).value);
      p.preco = numero($('#p-preco', corpo).value);
      p.estoqueMin = Math.max(0, Math.round(numero($('#p-min', corpo).value)));
      p.feitoNaHora = $('#p-nahora', corpo).checked;
      $('#bloco-min', corpo).hidden = p.feitoNaHora;
      if (p.modo === 'receita' && $('#p-rend', corpo)) {
        p.rendimento = Math.max(1, Math.round(numero($('#p-rend', corpo).value)));
        $$('[data-ing]', corpo).forEach(s => p.receita[s.dataset.ing].ingId = s.value);
        $$('[data-qtd]', corpo).forEach(i => p.receita[i.dataset.qtd].qtd = numero(i.value));
      }
      if (p.modo === 'compra') p.custoCompra = numero($('#p-compra', corpo).value);
    };
    const resumo = () => {
      ler();
      const custo = custoProduto(p);
      const sug = precoSugerido(custo, p.margem);
      const margemReal = p.preco > 0 ? (1 - custo / p.preco) * 100 : 0;
      $('#resumo', corpo).innerHTML = `
        ${p.modo === 'receita' ? `<div><span>Custo da receita</span><span>${brl(custoReceita(p))}</span></div>` : ''}
        <div><span>Custo por unidade</span><strong>${brl(custo)}</strong></div>
        <div class="destaque"><span>Preço sugerido (${pct(p.margem)})</span><span>${brl(sug)}</span></div>
        ${p.preco > 0 ? `<div><span>Lucro por unidade no preço atual</span><span>${brl(p.preco - custo)} (${pct(margemReal)})</span></div>` : ''}
        <button type="button" class="btn btn-sec btn-peq" id="usar-sug" style="margin-top:6px">Usar preço sugerido (arredondado)</button>`;
      $('#usar-sug', corpo).addEventListener('click', () => {
        $('#p-preco', corpo).value = (Math.ceil(sug * 2) / 2).toFixed(2); // arredonda para cima, de R$ 0,50 em R$ 0,50
        resumo();
      });
    };
    corpo.addEventListener('input', resumo);
    corpo.addEventListener('change', e => { if (e.target.matches('[data-ing]')) { ler(); desenhar(); } });
    const painel = $('#painel-icones', corpo), btnIcones = $('#abrir-icones', corpo);
    btnIcones.addEventListener('click', () => {
      painel.hidden = !painel.hidden;
      btnIcones.setAttribute('aria-expanded', String(!painel.hidden));
    });
    $$('[data-icone]', painel).forEach(b => b.addEventListener('click', () => {
      $('#p-emoji', corpo).value = b.dataset.icone;
      $$('[data-icone]', painel).forEach(x => x.classList.toggle('ativa', x === b));
      painel.hidden = true;
      btnIcones.setAttribute('aria-expanded', 'false');
      ler();
    }));
    $$('[data-modo]', corpo).forEach(b => b.addEventListener('click', () => {
      ler(); p.modo = b.dataset.modo;
      if (p.modo === 'receita' && !p.receita.length && db.ingredientes.length) p.receita.push({ ingId: db.ingredientes[0].id, qtd: 0 });
      desenhar();
    }));
    $('#add-linha', corpo)?.addEventListener('click', () => { ler(); p.receita.push({ ingId: db.ingredientes[0].id, qtd: 0 }); desenhar(); });
    $$('[data-rem]', corpo).forEach(b => b.addEventListener('click', () => { ler(); p.receita.splice(+b.dataset.rem, 1); desenhar(); }));
    $('#excluir', corpo)?.addEventListener('click', () => {
      if (!confirm(`Excluir "${p.nome}"? O histórico de vendas é mantido.`)) return;
      db.produtos = db.produtos.filter(x => x.id !== p.id);
      delete carrinho[p.id];
      salvar(); fecharModal(); renderizar(); toast('Produto excluído');
    });
    $('#salvar', corpo).addEventListener('click', () => {
      ler();
      if (!p.nome) return toast('Informe o nome do produto');
      if (p.preco <= 0) return toast('Informe o preço de venda');
      if (p.modo === 'receita') p.receita = p.receita.filter(it => it.qtd > 0);
      const i = db.produtos.findIndex(x => x.id === p.id);
      i >= 0 ? db.produtos[i] = p : db.produtos.push(p);
      salvar(); fecharModal(); renderizar(); toast('Produto salvo');
    });
    resumo();
  });
  desenhar();
}

function listarIngredientes(el) {
  el.innerHTML = `
    <div class="cab-secao"><h2>Ingredientes e insumos</h2><button class="btn btn-peq" id="novo-ing">+ Novo</button></div>
    <p class="dica" style="margin-top:-6px">Informe o preço que você paga pela embalagem; o sistema calcula o custo por grama, ml ou unidade.</p>
    ${db.ingredientes.length ? `<div class="cartao"><ul class="lista">
      ${db.ingredientes.map(i => `<li>
        <div class="info"><div class="titulo">${esc(i.nome)}</div>
          <div class="sub">${brl(i.precoEmb)} por ${fmt(i.qtdEmb)} ${esc(i.unidade)}</div></div>
        <div class="valor">${brl(custoUnitIng(i) * (i.unidade === 'un' ? 1 : 100))}<div class="sub">por ${i.unidade === 'un' ? 'un' : '100 ' + esc(i.unidade)}</div></div>
        <button class="btn-icone" data-editar="${i.id}" aria-label="Editar">✏️</button></li>`).join('')}
    </ul></div>` : blocoVazioDemo('Nenhum ingrediente cadastrado.')}
  `;
  $('#novo-ing', el).addEventListener('click', () => formIngrediente());
  $$('[data-editar]', el).forEach(b => b.addEventListener('click', () => formIngrediente(ingPorId(b.dataset.editar))));
}

function formIngrediente(ing) {
  const i = ing ? { ...ing } : { id: uid(), nome: '', unidade: 'g', qtdEmb: 1000, precoEmb: 0 };
  abrirModal(ing ? 'Editar ingrediente' : 'Novo ingrediente', `
    <label for="i-nome">Nome</label><input id="i-nome" value="${esc(i.nome)}" placeholder="Ex.: Farinha de trigo">
    <div class="linha2">
      <div><label for="i-un">Unidade</label><select id="i-un">
        ${[['g', 'gramas (g)'], ['ml', 'mililitros (ml)'], ['un', 'unidades (un)']].map(([v, t]) => `<option value="${v}" ${v === i.unidade ? 'selected' : ''}>${t}</option>`).join('')}
      </select></div>
      <div><label for="i-qtd">Qtd. na embalagem</label><input id="i-qtd" type="number" inputmode="decimal" step="any" min="0" value="${i.qtdEmb}"></div>
    </div>
    <label for="i-preco">Preço da embalagem (R$)</label>
    <input id="i-preco" type="number" inputmode="decimal" step="0.01" min="0" value="${i.precoEmb || ''}">
    <div class="resumo-custo" id="i-resumo"></div>
    <div class="modal-acoes">
      ${ing ? '<button class="btn btn-perigo" id="excluir">Excluir</button>' : ''}
      <button class="btn" id="salvar">Salvar</button>
    </div>
  `, corpo => {
    const ler = () => {
      i.nome = $('#i-nome', corpo).value.trim();
      i.unidade = $('#i-un', corpo).value;
      i.qtdEmb = numero($('#i-qtd', corpo).value);
      i.precoEmb = numero($('#i-preco', corpo).value);
      $('#i-resumo', corpo).innerHTML = `<div><span>Custo por ${esc(i.unidade)}</span><strong>R$ ${fmt(custoUnitIng(i), 4)}</strong></div>`;
    };
    corpo.addEventListener('input', ler);
    ler();
    $('#excluir', corpo)?.addEventListener('click', () => {
      const usado = db.produtos.filter(p => p.modo === 'receita' && p.receita.some(r => r.ingId === i.id));
      if (usado.length) return toast('Não é possível excluir: usado em ' + usado.map(p => p.nome).join(', '));
      if (!confirm(`Excluir "${i.nome}"?`)) return;
      db.ingredientes = db.ingredientes.filter(x => x.id !== i.id);
      salvar(); fecharModal(); renderizar();
    });
    $('#salvar', corpo).addEventListener('click', () => {
      ler();
      if (!i.nome) return toast('Informe o nome');
      if (i.qtdEmb <= 0) return toast('Informe a quantidade da embalagem');
      const idx = db.ingredientes.findIndex(x => x.id === i.id);
      idx >= 0 ? db.ingredientes[idx] = i : db.ingredientes.push(i);
      salvar(); fecharModal(); renderizar(); toast('Ingrediente salvo');
    });
  });
}

/* =========================================================
 * 4. PRODUÇÃO E ESTOQUE
 * ========================================================= */
renderizadores.producao = function () {
  const el = $('#view-producao');
  if (!db.produtos.length) { el.innerHTML = blocoVazioDemo('Cadastre produtos para registrar a produção.'); return; }
  const lotes = [...db.lotes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 15);
  const comEstoque = db.produtos.filter(p => !p.feitoNaHora);
  const naHora = db.produtos.filter(p => p.feitoNaHora);
  const criticos = comEstoque.filter(p => statusEstoque(p).classe !== 'ok');

  el.innerHTML = `
    <div class="cab-secao"><h2>Estoque atual</h2><button class="btn btn-peq" id="novo-lote">+ Registrar lote</button></div>
    ${criticos.length ? `<div class="alerta vermelho">🔔 ${criticos.length} produto(s) acabando ou esgotado(s). Produza mais ou retire do cardápio.</div>` : ''}
    ${comEstoque.length ? `<div class="cartao"><ul class="lista">
      ${comEstoque.map(p => {
        const e = estoque(p.id), st = statusEstoque(p);
        const produzido = db.lotes.filter(l => l.produtoId === p.id).reduce((s, l) => s + l.qtd, 0);
        const larg = produzido > 0 ? Math.max(0, Math.min(100, e / produzido * 100)) : 0;
        return `<li><span style="font-size:1.5rem">${esc(p.emoji || '🍪')}</span>
          <div class="info"><div class="titulo">${esc(p.nome)}</div>
            <div class="sub">mínimo ${minimoDe(p)} · custo em estoque ${brl(Math.max(0, e) * custoProduto(p))}</div>
            <div class="barra ${st.classe}"><span style="width:${larg}%"></span></div></div>
          <div class="valor">${e} un<div><span class="etiqueta ${st.classe}">${st.texto}</span></div></div></li>`;
      }).join('')}
    </ul></div>` : '<div class="cartao vazio">Nenhum produto com controle de estoque.</div>'}
    ${naHora.length ? `<p class="dica">Feitos na hora (sem estoque): ${naHora.map(p => esc(p.emoji + ' ' + p.nome)).join(', ')}.</p>` : ''}

    <h3>Lotes registrados</h3>
    ${lotes.length ? `<div class="cartao"><ul class="lista">
      ${lotes.map(l => { const p = prodPorId(l.produtoId); return `<li>
        <div class="info"><div class="titulo">${l.qtd}× ${esc(p?.nome || '(produto excluído)')}</div>
          <div class="sub">${dataLocal(l.data)} ${horaLocal(l.data)} · custo ${brl(l.qtd * l.custoUnit)}${l.obs ? ' · ' + esc(l.obs) : ''}</div></div>
        <button class="btn-icone" data-del-lote="${l.id}" aria-label="Excluir lote">🗑️</button></li>`; }).join('')}
    </ul></div>` : '<div class="cartao vazio">Nenhum lote registrado. Registre o que foi produzido para controlar o estoque.</div>'}
  `;
  $('#novo-lote', el).addEventListener('click', () => comEstoque.length ? formLote() : toast('Nenhum produto com controle de estoque'));
  $$('[data-del-lote]', el).forEach(b => b.addEventListener('click', () => {
    const lote = db.lotes.find(l => l.id === b.dataset.delLote);
    // excluir um lote já vendido deixaria o estoque negativo
    if (prodPorId(lote.produtoId) && estoque(lote.produtoId) - lote.qtd < 0) {
      return toast(`Não é possível excluir: só restam ${Math.max(0, estoque(lote.produtoId))} un em estoque e o lote tem ${lote.qtd}. Cancele as vendas antes.`);
    }
    if (!confirm('Excluir este lote? O estoque será reduzido.')) return;
    db.lotes = db.lotes.filter(l => l.id !== b.dataset.delLote);
    salvar(); renderizar();
  }));
};

function formLote() {
  abrirModal('Registrar lote produzido', `
    <label for="l-prod">Produto</label>
    <select id="l-prod">${db.produtos.filter(p => !p.feitoNaHora).map(p => `<option value="${p.id}">${esc(p.emoji || '')} ${esc(p.nome)}</option>`).join('')}</select>
    <div class="linha2">
      <div><label for="l-qtd">Quantidade (un)</label><input id="l-qtd" type="number" inputmode="numeric" min="1" step="1" value="20"></div>
      <div><label for="l-data">Data e hora</label><input id="l-data" type="datetime-local" value="${agoraInput()}"></div>
    </div>
    <label for="l-obs">Observação (opcional)</label><input id="l-obs" placeholder="Ex.: para a feira de 03/11">
    <div class="resumo-custo" id="l-resumo"></div>
    <div class="modal-acoes"><button class="btn" id="salvar">Registrar</button></div>
  `, corpo => {
    const resumo = () => {
      const p = prodPorId($('#l-prod', corpo).value);
      const qtd = Math.round(numero($('#l-qtd', corpo).value));
      const custo = custoProduto(p);
      let html = `<div><span>Custo do lote</span><strong>${brl(custo * qtd)}</strong></div>
        <div><span>Faturamento se vender tudo</span><span>${brl(p.preco * qtd)}</span></div>`;
      if (p.modo === 'receita' && p.rendimento > 0 && qtd > 0) {
        const fator = qtd / p.rendimento;
        html += `<div style="margin-top:6px"><span>Ingredientes necessários (${fmt(fator, 1)} receita${fator > 1 ? 's' : ''})</span><span></span></div>
          ${p.receita.map(it => { const ing = ingPorId(it.ingId); return ing ? `<div class="suave"><span>• ${esc(ing.nome)}</span><span>${fmt(it.qtd * fator, 1)} ${esc(ing.unidade)}</span></div>` : ''; }).join('')}`;
      }
      $('#l-resumo', corpo).innerHTML = html;
    };
    corpo.addEventListener('input', resumo);
    resumo();
    $('#salvar', corpo).addEventListener('click', () => {
      const p = prodPorId($('#l-prod', corpo).value);
      const qtd = Math.round(numero($('#l-qtd', corpo).value));
      if (qtd <= 0) return toast('Informe a quantidade');
      const dataStr = $('#l-data', corpo).value;
      db.lotes.push({ id: uid(), produtoId: p.id, qtd, data: dataStr ? new Date(dataStr).toISOString() : new Date().toISOString(),
        custoUnit: arred(custoProduto(p)), obs: $('#l-obs', corpo).value.trim() });
      salvar(); fecharModal(); renderizar(); toast(`Lote de ${qtd} ${p.nome} registrado`);
    });
  });
}

/* =========================================================
 * 3. RELATÓRIO
 * ========================================================= */
let filtroDia = 'todos';

renderizadores.relatorio = function () {
  const el = $('#view-relatorio');
  if (!db.vendas.length) {
    el.innerHTML = db.produtos.length
      ? '<div class="cartao vazio"><span class="grande">📊</span>Nenhuma venda registrada ainda. As vendas do Caixa aparecem aqui.</div>'
      : blocoVazioDemo('Sem dados para o relatório.');
    return;
  }
  const dias = [...new Set(db.vendas.map(v => diaChave(v.data)))].sort().reverse();
  if (filtroDia !== 'todos' && !dias.includes(filtroDia)) filtroDia = 'todos';
  const noFiltro = iso => filtroDia === 'todos' || diaChave(iso) === filtroDia;
  const vendas = db.vendas.filter(v => noFiltro(v.data));
  const lotes = db.lotes.filter(l => noFiltro(l.data));

  const fat = vendas.reduce((s, v) => s + v.total, 0);
  const custo = vendas.reduce((s, v) => s + v.custo, 0);
  const lucro = fat - custo;
  const pix = vendas.filter(v => v.pagamento === 'pix').reduce((s, v) => s + v.total, 0);

  // Por produto
  const porProd = {};
  vendas.forEach(v => v.itens.forEach(i => {
    const r = porProd[i.produtoId] ??= { nome: i.nome, qtd: 0, fat: 0, custo: 0 };
    r.qtd += i.qtd; r.fat += i.qtd * i.preco; r.custo += i.qtd * i.custo;
  }));
  const ranking = Object.values(porProd).sort((a, b) => b.qtd - a.qtd);
  const maxQtd = ranking[0]?.qtd || 1;

  // Por horário: faixas de 15 min (uma feira) ou de 1 h quando as vendas se espalham pelo dia
  const minutosDoDia = vendas.map(v => { const d = new Date(v.data); return d.getHours() * 60 + d.getMinutes(); });
  const passo = Math.max(...minutosDoDia) - Math.min(...minutosDoDia) > 240 ? 60 : 15;
  const faixas = {};
  vendas.forEach((v, i) => {
    const min = Math.floor(minutosDoDia[i] / passo) * passo;
    const f = faixas[min] ??= { n: 0, fat: 0 };
    f.n++; f.fat += v.total;
  });
  const chaves = Object.keys(faixas).map(Number);
  const ini = Math.min(...chaves), fim = Math.max(...chaves);
  const colunas = [];
  for (let m = ini; m <= fim; m += passo) colunas.push({ m, ...(faixas[m] || { n: 0, fat: 0 }) });
  const maxFat = Math.max(...colunas.map(c => c.fat)) || 1;
  const pico = colunas.reduce((a, b) => b.fat > a.fat ? b : a, colunas[0]);
  const hh = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  // Sobras / estoque
  const sobras = db.produtos.filter(p => !p.feitoNaHora).map(p => {
    const produzido = lotes.filter(l => l.produtoId === p.id).reduce((s, l) => s + l.qtd, 0);
    const vendido = porProd[p.id]?.qtd || 0;
    const resto = Math.max(0, estoque(p.id));
    let sugestao = '—';
    if (produzido > 0) {
      const taxaSobra = (produzido - vendido) / produzido;
      if (resto === 0 && vendido > 0) sugestao = '⬆️ Produzir mais';
      else if (taxaSobra > 0.3) sugestao = '⬇️ Reduzir';
      else sugestao = '✅ Manter';
    }
    return { p, produzido, vendido, resto, custoParado: resto * custoProduto(p), sugestao };
  });
  const custoSobras = sobras.reduce((s, x) => s + x.custoParado, 0);

  el.innerHTML = `
    <div class="cab-secao"><h2>Relatório</h2>
      <select id="filtro-dia" style="width:auto">
        <option value="todos">Todo o período</option>
        ${dias.map(d => `<option value="${d}" ${d === filtroDia ? 'selected' : ''}>${d.split('-').reverse().join('/')}</option>`).join('')}
      </select></div>

    <div class="kpis">
      <div class="kpi"><div class="rot">Faturamento</div><div class="val">${brl(fat)}</div></div>
      <div class="kpi"><div class="rot">Custo dos produtos</div><div class="val">${brl(custo)}</div></div>
      <div class="kpi lucro"><div class="rot">Lucro real</div><div class="val">${brl(lucro)}</div></div>
      <div class="kpi"><div class="rot">Margem</div><div class="val">${pct(fat ? lucro / fat * 100 : 0)}</div></div>
      <div class="kpi"><div class="rot">Vendas</div><div class="val">${vendas.length}</div></div>
      <div class="kpi"><div class="rot">Ticket médio</div><div class="val">${brl(vendas.length ? fat / vendas.length : 0)}</div></div>
      <div class="kpi"><div class="rot">Pix</div><div class="val">${brl(pix)}</div></div>
      <div class="kpi"><div class="rot">Dinheiro</div><div class="val">${brl(fat - pix)}</div></div>
    </div>
    <p class="dica">Lucro real = faturamento − custo de cada item vendido (pela ficha técnica ou custo de compra). Se as sobras não puderem ser vendidas depois, o resultado cai para <strong>${brl(lucro - custoSobras)}</strong>.</p>

    <h3>Vendas por horário</h3>
    <div class="cartao">
      <div class="horarios">
        ${colunas.map(c => `<div class="col ${c === pico ? 'pico' : ''}" title="${hh(c.m)}: ${c.n} venda(s), ${brl(c.fat)}">
          <span class="n">${c.n || ''}</span>
          <div class="b" style="height:${c.fat / maxFat * 100}%"></div>
          <span class="h">${hh(c.m)}</span></div>`).join('')}
      </div>
      <p class="dica">🔥 Pico: <strong>${hh(pico.m)}–${hh(pico.m + passo)}</strong>, com ${pico.n} vendas (${brl(pico.fat)}). Números acima das barras = quantidade de vendas; altura = faturamento.</p>
    </div>

    <h3>Produtos mais vendidos</h3>
    <div class="cartao"><ul class="lista">
      ${ranking.map((r, i) => `<li><strong style="width:20px">${i + 1}º</strong>
        <div class="info"><div class="titulo">${esc(r.nome)}</div>
          <div class="sub">${brl(r.fat)} faturado · lucro ${brl(r.fat - r.custo)}</div>
          <div class="barra"><span style="width:${r.qtd / maxQtd * 100}%;background:var(--caramelo)"></span></div></div>
        <div class="valor">${r.qtd} un</div></li>`).join('')}
    </ul></div>

    <h3>Sobras e estoque restante</h3>
    <div class="cartao tabela-rolagem">
      <table class="tabela">
        <thead><tr><th>Produto</th><th>Produzido</th><th>Vendido</th><th>Sobra</th><th>Custo parado</th><th>Próxima feira</th></tr></thead>
        <tbody>${sobras.map(s => `<tr><td>${esc(s.p.nome)}</td><td>${s.produzido}</td><td>${s.vendido}</td><td>${s.resto}</td><td>${brl(s.custoParado)}</td><td>${s.sugestao}</td></tr>`).join('')}</tbody>
      </table>
      <p class="dica">“Produzido” considera os lotes do período selecionado; “Sobra” é o estoque atual. Valor total parado em sobras: <strong>${brl(custoSobras)}</strong>.</p>
    </div>
  `;
  $('#filtro-dia', el).addEventListener('change', e => { filtroDia = e.target.value; renderizar(); });
};

/* =========================================================
 * AJUSTES E DADOS
 * ========================================================= */
renderizadores.ajustes = function () {
  const c = db.config;
  const el = $('#view-ajustes');
  el.innerHTML = `
    <h2 style="margin-bottom:10px">Ajustes</h2>
    <div class="cartao">
      <div class="linha2" style="grid-template-columns:1fr 80px">
        <div><label for="c-empresa">Nome do negócio</label><input id="c-empresa" value="${esc(empresaAtual.nome)}"></div>
        <div><label for="c-icone">Ícone</label><input id="c-icone" value="${esc(empresaAtual.icone)}" maxlength="4" style="text-align:center"></div>
      </div>
      <p class="dica">Usuário de acesso: <strong>${esc(empresaAtual.usuario)}</strong></p>
      <label for="c-chave">Chave Pix</label><input id="c-chave" value="${esc(c.chavePix)}" placeholder="e-mail, CPF/CNPJ, +55DDDNÚMERO ou chave aleatória" autocomplete="off">
      <p class="dica">Telefone deve ter o formato +5511999998888. O QR Code é gerado no próprio aparelho (padrão BR Code do Banco Central).</p>
      <div class="linha2">
        <div><label for="c-receb">Nome do recebedor</label><input id="c-receb" value="${esc(c.recebedor)}" maxlength="25"></div>
        <div><label for="c-cidade">Cidade</label><input id="c-cidade" value="${esc(c.cidade)}" maxlength="15"></div>
      </div>
      <div class="linha2">
        <div><label for="c-margem">Margem padrão (%)</label><input id="c-margem" type="number" inputmode="decimal" min="0" max="95" value="${c.margem}"></div>
        <div><label for="c-alerta">Alerta de estoque (un)</label><input id="c-alerta" type="number" inputmode="numeric" min="0" value="${c.alertaMin}"></div>
      </div>
      <button class="btn btn-bloco" id="salvar-config" style="margin-top:14px">Salvar ajustes</button>
    </div>

    <h3>Dados desta empresa</h3>
    <div class="cartao">
      <p class="dica" style="margin-top:0">Cada empresa tem seus próprios dados, salvos apenas neste navegador (localStorage). Limpar ou carregar a demonstração aqui <strong>não afeta as outras empresas</strong>.</p>
      <div class="btns" style="flex-direction:column">
        <button class="btn btn-verde" data-acao="demo">${esc(empresaAtual.icone)} Carregar dados de demonstração</button>
        <button class="btn btn-sec" id="exportar">⬇️ Exportar backup (.json)</button>
        <label class="btn btn-sec" style="text-align:center;margin:0;font-size:.95rem">⬆️ Importar backup
          <input type="file" id="importar" accept="application/json,.json" hidden></label>
        <button class="btn btn-perigo" id="limpar">🗑️ Limpar dados desta empresa</button>
      </div>
    </div>

    <h3>Conta</h3>
    <div class="cartao">
      <div class="btns" style="flex-direction:column">
        <button class="btn btn-sec" id="sair-ajustes">🚪 Sair (trocar de empresa)</button>
        <button class="btn btn-perigo" id="excluir-empresa">Excluir esta empresa e a conta</button>
      </div>
    </div>
    <p class="dica" style="text-align:center">Mini-ERP de Feira · protótipo acadêmico · dados ilustrativos</p>
  `;
  $('#salvar-config', el).addEventListener('click', () => {
    const nome = $('#c-empresa', el).value.trim();
    if (!nome) return toast('Informe o nome do negócio');
    db.config = {
      empresa: nome,
      chavePix: $('#c-chave', el).value.trim(),
      recebedor: $('#c-receb', el).value.trim(),
      cidade: $('#c-cidade', el).value.trim(),
      margem: Math.min(95, Math.max(0, numero($('#c-margem', el).value))),
      alertaMin: Math.max(0, Math.round(numero($('#c-alerta', el).value)))
    };
    atualizarConta({ nome, icone: $('#c-icone', el).value.trim() || '🏪' });
    salvar(); renderizar(); toast('Ajustes salvos');
  });
  $('#exportar', el).addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-${empresaAtual.usuario}-${diaChave(new Date().toISOString())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#importar', el).addEventListener('change', e => {
    const arq = e.target.files[0];
    if (!arq) return;
    arq.text().then(txt => {
      const d = JSON.parse(txt);
      if (!d || !Array.isArray(d.produtos)) throw new Error('formato');
      if (!confirm(`Substituir os dados de "${empresaAtual.nome}" pelo backup?`)) return;
      db = normalizarDb(d);
      db.config.empresa = empresaAtual.nome;
      carrinho = {}; salvar(); renderizar(); toast('Backup importado');
    }).catch(() => toast('Arquivo de backup inválido'));
  });
  $('#limpar', el).addEventListener('click', () => {
    if (!confirm(`Apagar os produtos, ingredientes, lotes e vendas de "${empresaAtual.nome}"? As outras empresas não são afetadas. Esta ação não pode ser desfeita.`)) return;
    const config = db.config;
    db = estadoVazio(); db.config = config;
    carrinho = {}; salvar(); renderizar(); toast('Dados desta empresa apagados');
  });
  $('#sair-ajustes', el).addEventListener('click', sair);
  $('#excluir-empresa', el).addEventListener('click', () => {
    if (!confirm(`Excluir a empresa "${empresaAtual.nome}", a conta de acesso e todos os seus dados?`)) return;
    gravarContas(lerContas().filter(c => c.id !== empresaAtual.id));
    try { localStorage.removeItem(PREFIXO_DADOS + empresaAtual.id); } catch (e) { /* ignora */ }
    sair();
    toast('Empresa excluída');
  });
};

function atualizarConta(campos) {
  const contas = lerContas();
  const c = contas.find(x => x.id === empresaAtual.id);
  if (!c) return;
  Object.assign(c, campos);
  gravarContas(contas);
  empresaAtual = c;
}

function carregarDemo() {
  const tipos = Object.keys(DEMOS);
  let escolhido = tipos.includes(empresaAtual.demo) ? empresaAtual.demo : tipos[0];
  abrirModal('Dados de demonstração', `
    <p class="dica" style="margin-top:0">Escolha qual negócio simular em <strong>${esc(empresaAtual.nome)}</strong>. Os dados atuais desta empresa serão substituídos; as outras empresas não são afetadas.</p>
    <div class="lista-demos">
      ${tipos.map(t => `<button type="button" class="cartao-demo ${t === escolhido ? 'ativa' : ''}" data-tipo="${t}">
        <span class="emoji">${DEMOS[t].icone}</span><span><strong>${esc(DEMOS[t].nome)}</strong><small>${esc(DEMOS[t].resumo)}</small></span></button>`).join('')}
    </div>
    <div class="modal-acoes"><button class="btn btn-verde" id="confirmar-demo">Carregar demonstração</button></div>
    <p class="dica">⚠️ Todos os números são fictícios/ilustrativos.</p>
  `, corpo => {
    $$('[data-tipo]', corpo).forEach(b => b.addEventListener('click', () => {
      escolhido = b.dataset.tipo;
      $$('[data-tipo]', corpo).forEach(x => x.classList.toggle('ativa', x === b));
    }));
    $('#confirmar-demo', corpo).addEventListener('click', () => {
      db = normalizarDb(gerarDadosDemo(escolhido));
      db.config.empresa = empresaAtual.nome;
      carrinho = {}; filtroDia = 'todos';
      salvar(); fecharModal();
      irPara('relatorio');
      toast('Demonstração carregada (dados fictícios)');
    });
  });
}

/* =========================================================
 * LOGIN E CADASTRO DE EMPRESAS
 * ========================================================= */
function entrar(conta) {
  empresaAtual = conta;
  db = normalizarDb(lerJSON(PREFIXO_DADOS + conta.id, null) || estadoVazio());
  carrinho = {}; filtroDia = 'todos'; abaProdutos = 'produtos';
  try { sessionStorage.setItem(CHAVE_SESSAO, conta.id); } catch (e) { /* ignora */ }
  document.body.classList.remove('deslogado');
  irPara('caixa');
}

function sair() {
  try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (e) { /* ignora */ }
  empresaAtual = null; db = estadoVazio(); carrinho = {};
  fecharModal();
  mostrarLogin();
}

// cria a conta de demonstração na primeira vez que for usada
function garantirContaDemo(tipo) {
  const d = DEMOS[tipo];
  const existente = lerContas().find(c => c.usuario === d.usuario);
  if (existente) return existente;
  return criarConta({ nome: d.nome, icone: d.icone, usuario: d.usuario, senha: SENHA_DEMO, demo: tipo, dados: gerarDadosDemo(tipo) });
}

function mostrarLogin(modo = 'entrar') {
  // as contas de demonstração sempre existem na tela de entrada (inclusive logo após excluir uma)
  Object.keys(DEMOS).forEach(garantirContaDemo);
  document.body.classList.add('deslogado');
  document.title = 'Entrar · Mini-ERP de Feira';
  window.scrollTo(0, 0);
  const el = $('#tela-login');
  el.innerHTML = `
    <div class="login-cab">
      <span class="logo-grande">🧾</span>
      <h1>Mini-ERP de Feira</h1>
      <p class="suave">Custos, caixa com Pix, produção e relatório para pequenos negócios.</p>
    </div>

    <div class="cartao">
      <div class="segmentado">
        <button type="button" data-modo-login="entrar" class="${modo === 'entrar' ? 'ativa' : ''}">Entrar</button>
        <button type="button" data-modo-login="cadastrar" class="${modo === 'cadastrar' ? 'ativa' : ''}">Cadastrar empresa</button>
      </div>
      ${modo === 'entrar' ? `
        <form id="form-login" autocomplete="off">
          <label for="lg-usuario">Usuário</label><input id="lg-usuario" autocapitalize="none" spellcheck="false">
          <label for="lg-senha">Senha</label><input id="lg-senha" type="password">
          <button class="btn btn-bloco" style="margin-top:14px" id="btn-entrar">Entrar</button>
        </form>` : `
        <form id="form-cadastro" autocomplete="off">
          <div class="linha2" style="grid-template-columns:1fr 80px">
            <div><label for="cd-nome">Nome do negócio</label><input id="cd-nome" placeholder="Ex.: Doces da Ana"></div>
            <div><label for="cd-icone">Ícone</label><input id="cd-icone" value="🏪" maxlength="4" style="text-align:center"></div>
          </div>
          <div class="icones-rapidos">${['🏪', '🍪', '🍫', '🥟', '☕', '🧁', '🍔', '🥤', '🍦', '🌮'].map(i => `<button type="button" data-icone-rapido="${i}" aria-label="Usar ícone ${i}">${i}</button>`).join('')}</div>
          <label for="cd-usuario">Usuário</label><input id="cd-usuario" autocapitalize="none" spellcheck="false" placeholder="sem espaços, ex.: docesdaana">
          <div class="linha2">
            <div><label for="cd-senha">Senha</label><input id="cd-senha" type="password"></div>
            <div><label for="cd-senha2">Confirmar senha</label><input id="cd-senha2" type="password"></div>
          </div>
          <button class="btn btn-bloco" style="margin-top:14px">Cadastrar e entrar</button>
        </form>`}
    </div>

    <h3>Empresas de demonstração</h3>
    <p class="dica" style="margin-top:-4px">Toque para preencher o login. Senha de todas: <strong>${SENHA_DEMO}</strong>. Dados fictícios.</p>
    <div class="lista-demos">
      ${Object.entries(DEMOS).map(([t, d]) => `<button type="button" class="cartao-demo" data-demo-login="${t}">
        <span class="emoji">${d.icone}</span><span><strong>${esc(d.nome)}</strong><small>usuário: ${esc(d.usuario)} · ${esc(d.resumo)}</small></span></button>`).join('')}
    </div>
    <p class="dica" style="text-align:center;margin-top:16px">🔒 Login didático: as contas e os dados ficam só neste navegador, sem servidor.</p>
  `;

  $$('[data-modo-login]', el).forEach(b => b.addEventListener('click', () => mostrarLogin(b.dataset.modoLogin)));
  $$('[data-demo-login]', el).forEach(b => b.addEventListener('click', () => {
    const conta = garantirContaDemo(b.dataset.demoLogin);
    if (modo !== 'entrar') mostrarLogin('entrar');
    $('#lg-usuario').value = conta.usuario;
    $('#lg-senha').value = SENHA_DEMO;
    $('#btn-entrar').focus();
  }));

  $('#form-login', el)?.addEventListener('submit', e => {
    e.preventDefault();
    const usuario = normalizarUsuario($('#lg-usuario', el).value);
    const senha = $('#lg-senha', el).value;
    const conta = lerContas().find(c => c.usuario === usuario);
    if (!conta || conta.senha !== hashSenha(usuario, senha)) return toast('Usuário ou senha incorretos');
    entrar(conta);
    toast(`Bem-vindo(a), ${conta.nome}!`);
  });

  $$('[data-icone-rapido]', el).forEach(b => b.addEventListener('click', () => { $('#cd-icone', el).value = b.dataset.iconeRapido; }));
  $('#form-cadastro', el)?.addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#cd-nome', el).value.trim();
    const usuario = normalizarUsuario($('#cd-usuario', el).value);
    const senha = $('#cd-senha', el).value;
    if (!nome) return toast('Informe o nome do negócio');
    if (!/^[a-z0-9._-]{3,30}$/.test(usuario)) return toast('Usuário: 3 a 30 letras/números, sem espaços');
    if (lerContas().some(c => c.usuario === usuario)) return toast('Este usuário já existe');
    if (senha.length < 4) return toast('A senha precisa ter pelo menos 4 caracteres');
    if (senha !== $('#cd-senha2', el).value) return toast('As senhas não conferem');
    const conta = criarConta({ nome, icone: $('#cd-icone', el).value.trim(), usuario, senha });
    entrar(conta);
    toast('Empresa cadastrada! Comece pelos Produtos ou carregue uma demonstração.');
  });
}

$('#btn-sair').addEventListener('click', () => { if (confirm('Sair desta empresa?')) sair(); });

// ---------- Início ----------
(function iniciar() {
  let id = null;
  try { id = sessionStorage.getItem(CHAVE_SESSAO); } catch (e) { /* ignora */ }
  const conta = id && lerContas().find(c => c.id === id);
  conta ? entrar(conta) : mostrarLogin();
})();
