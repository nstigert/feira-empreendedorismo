/*
 * Dados de demonstração das empresas da Feira de Empreendedorismo.
 * TODOS os valores são ilustrativos (preços de mercado aproximados), não são dados reais das empresas.
 * Cada demo simula a feira de 03/11, das 20h às 22h30, com pico no intervalo (21h–21h30).
 */
const SENHA_DEMO = '1234';

const ing = (id, nome, unidade, qtdEmb, precoEmb) => ({ id, nome, unidade, qtdEmb, precoEmb });
const r = (ingId, qtd) => ({ ingId, qtd });

/*
 * Cada demo descreve: ingredientes, produtos, quanto foi produzido no lote da tarde,
 * quantas vendas houve em cada faixa de 15 min (20h00 → 22h15) e a preferência dos clientes.
 */
const DEMOS = {
  moki: {
    nome: 'MOKI Cookies', icone: '🍪', usuario: 'moki',
    resumo: 'cookies artesanais, ficha técnica por fornada',
    config: { chavePix: '123e4567-e89b-12d3-a456-426614174000', recebedor: 'MOKI COOKIES', margem: 70, alertaMin: 5 },
    ingredientes: [
      ing('farinha', 'Farinha de trigo', 'g', 1000, 5.49),
      ing('manteiga', 'Manteiga sem sal', 'g', 500, 22.90),
      ing('mascavo', 'Açúcar mascavo', 'g', 1000, 9.90),
      ing('acucar', 'Açúcar refinado', 'g', 1000, 4.79),
      ing('ovos', 'Ovos', 'un', 30, 21.00),
      ing('fermento', 'Fermento químico', 'g', 100, 3.50),
      ing('baunilha', 'Essência de baunilha', 'ml', 30, 6.90),
      ing('choc', 'Chocolate meio amargo', 'g', 1000, 49.90),
      ing('chocbranco', 'Chocolate branco', 'g', 1000, 54.90),
      ing('cacau', 'Cacau em pó 50%', 'g', 200, 14.90),
      ing('avela', 'Creme de avelã', 'g', 650, 39.90),
      ing('corante', 'Corante vermelho em gel', 'g', 25, 8.90),
      ing('pacoca', 'Paçoca (rolha)', 'un', 50, 25.00),
      ing('saquinho', 'Saquinho kraft + etiqueta', 'un', 100, 18.00),
      ing('gas', 'Gás e energia (por fornada)', 'un', 1, 4.00)
    ],
    // massa base: rende 20 cookies de ~90 g
    base: [r('farinha', 500), r('manteiga', 250), r('mascavo', 200), r('acucar', 100), r('ovos', 2),
      r('fermento', 5), r('baunilha', 5), r('saquinho', 20), r('gas', 1)],
    produtos: [
      { id: 'tradicional', nome: 'Cookie Tradicional', emoji: '🍪', extras: [r('choc', 300)], rendimento: 20, preco: 8, estoqueMin: 6 },
      { id: 'duplo', nome: 'Duplo Chocolate', emoji: '🍫', extras: [r('choc', 250), r('cacau', 60)], rendimento: 20, preco: 9, estoqueMin: 6 },
      { id: 'redvelvet', nome: 'Red Velvet c/ Choc. Branco', emoji: '❤️', extras: [r('chocbranco', 250), r('cacau', 15), r('corante', 5)], rendimento: 20, preco: 10, estoqueMin: 5 },
      { id: 'nutella', nome: 'Recheado de Avelã', emoji: '🌰', extras: [r('choc', 150), r('avela', 400)], rendimento: 20, preco: 12, estoqueMin: 5 },
      { id: 'pacoca', nome: 'Cookie de Paçoca', emoji: '🥜', extras: [r('choc', 150), r('pacoca', 10)], rendimento: 20, preco: 9, estoqueMin: 5 },
      { id: 'agua', nome: 'Água mineral 500 ml', emoji: '💧', custoCompra: 1.20, preco: 4, estoqueMin: 4 }
    ],
    producao: { tradicional: 40, duplo: 30, redvelvet: 20, nutella: 16, pacoca: 20, agua: 24 },
    vendasPorFaixa: [3, 4, 5, 6, 15, 17, 7, 5, 3, 2],
    preferencia: { tradicional: 30, duplo: 26, redvelvet: 13, nutella: 18, pacoca: 9, agua: 14 },
    itensPorVenda: [0.6, 0.3, 0.1],
    pix: 0.62
  },

  brigadeiro: {
    nome: 'Loja de Brigadeiro', icone: '🍫', usuario: 'brigadeiro',
    resumo: 'brigadeiros gourmet e caixinhas para presente',
    config: { chavePix: '5f0c2a9e-1b7d-4c3e-9a8f-2d6b1e4c7a90', recebedor: 'LOJA DE BRIGADEIRO', margem: 70, alertaMin: 8 },
    ingredientes: [
      ing('condensado', 'Leite condensado', 'g', 395, 7.49),
      ing('creme', 'Creme de leite', 'g', 200, 3.99),
      ing('manteiga', 'Manteiga sem sal', 'g', 500, 22.90),
      ing('cacau', 'Chocolate em pó 50%', 'g', 200, 14.90),
      ing('granulado', 'Granulado de chocolate', 'g', 500, 12.90),
      ing('coco', 'Coco ralado', 'g', 100, 5.49),
      ing('leitepo', 'Leite em pó', 'g', 400, 18.90),
      ing('avela', 'Creme de avelã', 'g', 650, 39.90),
      ing('forminha', 'Forminha nº 4', 'un', 100, 6.50),
      ing('caixinha', 'Caixinha para 4 unidades', 'un', 50, 35.00),
      ing('gas', 'Gás (por panela)', 'un', 1, 2.00)
    ],
    // uma panela: ~25 brigadeiros de 20 g
    base: [r('condensado', 395), r('creme', 100), r('manteiga', 15), r('forminha', 25), r('gas', 1)],
    produtos: [
      { id: 'tradicional', nome: 'Brigadeiro Tradicional', emoji: '🍫', extras: [r('cacau', 40), r('granulado', 120)], rendimento: 25, preco: 3.5, estoqueMin: 10 },
      { id: 'beijinho', nome: 'Beijinho', emoji: '🥥', extras: [r('coco', 100)], rendimento: 25, preco: 3.5, estoqueMin: 8 },
      { id: 'ninho', nome: 'Ninho com Avelã', emoji: '🍬', extras: [r('leitepo', 80), r('avela', 100)], rendimento: 25, preco: 4.5, estoqueMin: 8 },
      { id: 'caixinha', nome: 'Caixinha com 4 sortidos', emoji: '🎁', extras: [r('cacau', 40), r('granulado', 120), r('caixinha', 6)], rendimento: 6, preco: 13, estoqueMin: 3 },
      { id: 'agua', nome: 'Água mineral 500 ml', emoji: '💧', custoCompra: 1.20, preco: 4, estoqueMin: 4 }
    ],
    producao: { tradicional: 60, beijinho: 40, ninho: 50, caixinha: 12, agua: 24 },
    // além do pico no intervalo, cresce no fim: caixinhas para levar para casa
    vendasPorFaixa: [3, 4, 5, 5, 14, 15, 6, 4, 6, 7],
    preferencia: { tradicional: 30, beijinho: 18, ninho: 26, caixinha: 12, agua: 8 },
    itensPorVenda: [0.3, 0.35, 0.2, 0.15],
    pix: 0.7
  },

  pastel: {
    nome: 'Pastel S&A', icone: '🥟', usuario: 'pastel',
    resumo: 'pastéis montados à tarde e fritos na hora',
    config: { chavePix: '8a1d3f5b-6c2e-4f7a-b9d0-3e5c7a1b2f46', recebedor: 'PASTEL SA', margem: 65, alertaMin: 6 },
    ingredientes: [
      ing('massa', 'Massa de pastel (rolo)', 'g', 1000, 16.90),
      ing('carne', 'Carne moída', 'g', 1000, 34.90),
      ing('queijo', 'Queijo muçarela', 'g', 1000, 42.90),
      ing('frango', 'Peito de frango', 'g', 1000, 22.90),
      ing('catupiry', 'Requeijão cremoso', 'g', 400, 21.90),
      ing('presunto', 'Presunto', 'g', 1000, 29.90),
      ing('tempero', 'Cebola, alho e temperos', 'g', 1000, 6.00),
      ing('oleo', 'Óleo de soja (fritura, rateio)', 'ml', 900, 7.49),
      ing('guardanapo', 'Papel + guardanapo', 'un', 100, 8.00)
    ],
    // 20 pastéis por receita: 50 g de massa cada, óleo rateado pela fritura
    base: [r('massa', 1000), r('oleo', 450), r('guardanapo', 20)],
    produtos: [
      { id: 'carne', nome: 'Pastel de Carne', emoji: '🥟', extras: [r('carne', 1000), r('tempero', 200)], rendimento: 20, preco: 10, estoqueMin: 6 },
      { id: 'queijo', nome: 'Pastel de Queijo', emoji: '🧀', extras: [r('queijo', 900)], rendimento: 20, preco: 10, estoqueMin: 6 },
      { id: 'frango', nome: 'Frango com Requeijão', emoji: '🍗', extras: [r('frango', 700), r('catupiry', 300), r('tempero', 100)], rendimento: 20, preco: 11, estoqueMin: 5 },
      { id: 'pizza', nome: 'Pastel de Pizza', emoji: '🍕', extras: [r('queijo', 500), r('presunto', 500), r('tempero', 50)], rendimento: 20, preco: 11, estoqueMin: 5 },
      { id: 'refri', nome: 'Refrigerante lata', emoji: '🥤', custoCompra: 2.80, preco: 6, estoqueMin: 6 },
      { id: 'caldo', nome: 'Caldo de cana 400 ml', emoji: '🧃', custoCompra: 1.60, preco: 7, feitoNaHora: true }
    ],
    producao: { carne: 30, queijo: 30, frango: 24, pizza: 20, refri: 24 },
    // movimento concentrado no intervalo (lanche)
    vendasPorFaixa: [2, 3, 4, 6, 18, 20, 6, 3, 2, 1],
    preferencia: { carne: 30, queijo: 24, frango: 20, pizza: 14, refri: 16, caldo: 12 },
    itensPorVenda: [0.45, 0.4, 0.15],
    pix: 0.55
  },

  cafe: {
    nome: 'Grupo de Cafés', icone: '☕', usuario: 'cafe',
    resumo: 'bebidas preparadas na hora + revenda de salgados',
    config: { chavePix: 'c3b7e1a2-4d6f-4a8b-8e2c-9f1a5d7b3c08', recebedor: 'GRUPO DE CAFES', margem: 70, alertaMin: 6 },
    ingredientes: [
      ing('graos', 'Café especial em grãos', 'g', 1000, 89.90),
      ing('leite', 'Leite integral', 'ml', 1000, 5.29),
      ing('chocolate', 'Chocolate em pó 50%', 'g', 200, 14.90),
      ing('canela', 'Canela em pó', 'g', 30, 4.50),
      ing('caramelo', 'Calda de caramelo', 'ml', 300, 18.90),
      ing('gelo', 'Gelo', 'g', 5000, 15.00),
      ing('copop', 'Copo 180 ml + tampa', 'un', 100, 32.00),
      ing('copog', 'Copo 300 ml + tampa', 'un', 50, 24.00)
    ],
    base: [],
    produtos: [
      { id: 'espresso', nome: 'Espresso', emoji: '☕', extras: [r('graos', 9), r('copop', 1)], rendimento: 1, preco: 6, feitoNaHora: true },
      { id: 'cappuccino', nome: 'Cappuccino', emoji: '🥛', extras: [r('graos', 9), r('leite', 150), r('chocolate', 5), r('canela', 0.5), r('copog', 1)], rendimento: 1, preco: 10, feitoNaHora: true },
      { id: 'latte', nome: 'Latte Gelado de Caramelo', emoji: '🧊', extras: [r('graos', 18), r('leite', 200), r('gelo', 150), r('caramelo', 20), r('copog', 1)], rendimento: 1, preco: 14, feitoNaHora: true },
      { id: 'mocha', nome: 'Mocha', emoji: '🍫', extras: [r('graos', 9), r('leite', 150), r('chocolate', 15), r('copog', 1)], rendimento: 1, preco: 12, feitoNaHora: true },
      { id: 'paoqueijo', nome: 'Pão de queijo (2 un)', emoji: '🧀', custoCompra: 1.40, preco: 5, estoqueMin: 8 },
      { id: 'bolo', nome: 'Fatia de bolo de cenoura', emoji: '🍰', custoCompra: 2.50, preco: 8, estoqueMin: 4 }
    ],
    producao: { paoqueijo: 36, bolo: 12 },
    // café vende bem na chegada (antes das aulas) e no intervalo
    vendasPorFaixa: [8, 9, 8, 6, 12, 13, 5, 3, 2, 1],
    preferencia: { espresso: 18, cappuccino: 28, latte: 16, mocha: 12, paoqueijo: 26, bolo: 10 },
    itensPorVenda: [0.55, 0.35, 0.1],
    pix: 0.68
  }
};

function gerarDadosDemo(tipo = 'moki') {
  const d = DEMOS[tipo];

  // gerador pseudoaleatório com semente fixa: cada demonstração é sempre igual
  let semente = 20261103 + Object.keys(DEMOS).indexOf(tipo) * 7919;
  const aleatorio = () => {
    semente = (semente + 0x6D2B79F5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const sortearPeso = pesos => {
    let x = aleatorio() * pesos.reduce((s, w) => s + w, 0);
    for (let i = 0; i < pesos.length; i++) { if ((x -= pesos[i]) <= 0) return i; }
    return pesos.length - 1;
  };

  const ingredientes = d.ingredientes.map(i => ({ ...i }));
  const produtos = d.produtos.map(p => p.custoCompra !== undefined
    ? { id: p.id, nome: p.nome, emoji: p.emoji, modo: 'compra', receita: [], rendimento: 1, custoCompra: p.custoCompra,
        margem: d.config.margem, preco: p.preco, estoqueMin: p.estoqueMin ?? d.config.alertaMin, feitoNaHora: !!p.feitoNaHora }
    : { id: p.id, nome: p.nome, emoji: p.emoji, modo: 'receita', receita: [...d.base, ...p.extras].map(x => ({ ...x })),
        rendimento: p.rendimento, custoCompra: 0, margem: d.config.margem, preco: p.preco,
        estoqueMin: p.estoqueMin ?? d.config.alertaMin, feitoNaHora: !!p.feitoNaHora });

  const db = {
    config: { empresa: d.nome, cidade: 'SAO PAULO', ...d.config }, // chaves Pix FICTÍCIAS: troque pela real em Ajustes
    ingredientes, produtos, lotes: [], vendas: []
  };

  const custoDe = p => {
    if (p.modo === 'compra') return p.custoCompra;
    const total = p.receita.reduce((s, it) => {
      const i = ingredientes.find(x => x.id === it.ingId);
      return s + i.precoEmb / i.qtdEmb * it.qtd;
    }, 0);
    return Math.round(total / p.rendimento * 100) / 100;
  };
  const dia = (h, m) => new Date(2026, 10, 3, h, m, 0).toISOString();

  // Lote de produção da tarde da feira (só itens com controle de estoque)
  const estoque = {};
  Object.entries(d.producao).forEach(([pid, qtd], idx) => {
    const p = produtos.find(x => x.id === pid);
    db.lotes.push({ id: 'lote-' + pid, produtoId: pid, qtd, data: dia(16, idx * 10), custoUnit: custoDe(p), obs: 'Produção para a feira de 03/11' });
    estoque[pid] = qtd;
  });
  const disponivel = p => p.feitoNaHora || estoque[p.id] > 0;

  // Vendas em faixas de 15 min, das 20h00 às 22h15
  let n = 0;
  d.vendasPorFaixa.forEach((qtdVendas, faixa) => {
    for (let k = 0; k < qtdVendas; k++) {
      const minuto = faixa * 15 + Math.floor(aleatorio() * 15);
      const qtdItens = sortearPeso(d.itensPorVenda) + 1;
      const carrinho = {};
      for (let j = 0; j < qtdItens; j++) {
        const opcoes = produtos.filter(disponivel);
        if (!opcoes.length) break;
        const p = opcoes[sortearPeso(opcoes.map(o => d.preferencia[o.id] || 1))];
        carrinho[p.id] = (carrinho[p.id] || 0) + 1;
        if (!p.feitoNaHora) estoque[p.id]--;
      }
      const itens = Object.entries(carrinho).map(([pid, qtd]) => {
        const p = produtos.find(x => x.id === pid);
        return { produtoId: pid, nome: p.nome, qtd, preco: p.preco, custo: custoDe(p) };
      });
      if (!itens.length) continue;
      const total = Math.round(itens.reduce((s, i) => s + i.qtd * i.preco, 0) * 100) / 100;
      const custo = Math.round(itens.reduce((s, i) => s + i.qtd * i.custo, 0) * 100) / 100;
      const pix = aleatorio() < d.pix;
      const recebido = pix ? total : [5, 10, 20, 50, 100].find(nota => nota >= total) || total;
      db.vendas.push({
        id: 'venda-' + (++n), data: dia(20 + Math.floor(minuto / 60), minuto % 60), itens, total, custo,
        pagamento: pix ? 'pix' : 'dinheiro', recebido, troco: Math.round((recebido - total) * 100) / 100
      });
    }
  });
  db.vendas.sort((a, b) => a.data.localeCompare(b.data));
  return db;
}
