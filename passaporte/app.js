(function () {
  const F = window.FEIRA;
  const CHAVE = "passaporte-feira-v1";
  const params = new URLSearchParams(location.search);
  // ?demo=1 permite carimbar tocando na banca (para apresentar sem celular).
  const modoDemo = params.has("demo");

  const $ = (id) => document.getElementById(id);
  const modal = $("modal");

  // Carimbos salvos: { idDaBanca: dataHoraISO }
  let carimbos = carregar();
  let ultimoNovo = null;

  function carregar() {
    try {
      const salvos = JSON.parse(localStorage.getItem(CHAVE)) || {};
      // Ignora carimbos de bancas que não existem mais nos dados.
      const validos = {};
      F.bancas.forEach((b) => { if (salvos[b.id]) validos[b.id] = salvos[b.id]; });
      return validos;
    } catch (e) {
      return {};
    }
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(carimbos)); } catch (e) { /* modo anônimo etc. */ }
  }

  const total = () => Object.keys(carimbos).length;
  const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const porCodigo = (codigo) =>
    F.bancas.find((b) => b.codigo.toUpperCase() === String(codigo).trim().toUpperCase());

  // Quantos carimbos cada selo exige ("todas" = todas as bancas).
  const requisito = (selo) => (selo.carimbos === "todas" ? F.bancas.length : selo.carimbos);
  const selosGanhos = (n) => F.selos.filter((s) => n >= requisito(s));

  function carimbar(banca) {
    if (carimbos[banca.id]) {
      abrirBanca(banca, "repetido");
      return;
    }
    const antes = selosGanhos(total()).length;
    carimbos[banca.id] = new Date().toISOString();
    ultimoNovo = banca.id;
    salvar();
    render();
    abrirBanca(banca, "novo", selosGanhos(total()).slice(antes));
  }

  // ---------- Renderização ----------

  function render() {
    $("nome-feira").textContent = F.nome;
    $("info-feira").textContent = `${F.data} · ${F.horario} · ${F.local}`;
    if (modoDemo) $("info-feira").textContent += " · MODO DEMONSTRAÇÃO";

    if (F.mostrarLinksApresentacao) {
      $("links-apresentacao").hidden = false;
      if (modoDemo) {
        $("link-demo").textContent = "Sair do modo demonstração";
        $("link-demo").href = location.pathname;
      }
    }

    const n = total();
    const qtd = F.bancas.length;
    $("barra-preenchida").style.width = `${(n / qtd) * 100}%`;
    $("texto-progresso").textContent = `${n} de ${qtd} carimbos`;

    renderGrade();
    renderSelos();
  }

  function renderGrade() {
    $("grade").innerHTML = F.bancas
      .map((b) => {
        const quando = carimbos[b.id];
        const classes = ["espaco", quando ? "carimbado" : "", b.id === ultimoNovo ? "novo" : ""].join(" ");
        return `
          <button class="${classes}" style="--cor:${b.cor}" data-id="${b.id}"
                  aria-label="${b.nome}${quando ? ", carimbado" : ", não visitada"}">
            <span class="emoji">${b.emoji}</span>
            <span class="nome">${b.nome}</span>
            <span class="hora">${quando ? hora(quando) : `Mesa ${b.mesa}`}</span>
          </button>`;
      })
      .join("");
    ultimoNovo = null;
  }

  function renderSelos() {
    const n = total();

    $("selos").innerHTML = F.selos
      .map((s) => {
        const ganho = n >= requisito(s);
        const classes = ["selo", ganho ? "ganho" : "bloqueado", s.especial ? "especial" : ""].join(" ");
        const req = s.carimbos === "todas" ? "Todas as bancas" : `${s.carimbos} carimbo${s.carimbos > 1 ? "s" : ""}`;
        return `
          <div class="${classes}" title="${s.descricao}">
            <span class="emoji">${s.emoji}</span>
            <span class="nome">${s.nome}</span>
            <span class="requisito">${ganho ? "✓ Desbloqueado" : `🔒 ${req}`}</span>
          </div>`;
      })
      .join("");

    const proximo = F.selos.find((s) => n < requisito(s));
    if (proximo) {
      const faltam = requisito(proximo) - n;
      $("proximo-selo").innerHTML = `Falta${faltam > 1 ? "m" : ""} <strong>${faltam}</strong>
        carimbo${faltam > 1 ? "s" : ""} para o selo <strong>${proximo.emoji} ${proximo.nome}</strong>.`;
    } else {
      $("proximo-selo").innerHTML = "<strong>Parabéns! Você conquistou todos os selos da feira!</strong>";
    }

    const votacaoLiberada = selosGanhos(n).some((s) => s.liberaVotacao);
    $("votacao").innerHTML = !votacaoLiberada
      ? ""
      : F.linkVotacao
        ? `<a class="botao" href="${F.linkVotacao}" target="_blank" rel="noopener">Votar na melhor banca</a>`
        : `<p><em>Votação liberada! O link será divulgado durante a feira.</em></p>`;
  }

  function abrirBanca(banca, estado, selosNovos = []) {
    const quando = carimbos[banca.id];
    let aviso;
    if (estado === "novo") {
      aviso = `<div class="aviso novo">🎉 Carimbo conquistado! (${total()} de ${F.bancas.length})</div>`;
      aviso += selosNovos
        .map((s) => `<div class="aviso selo-novo">${s.emoji} Novo selo: ${s.nome}!<br><small>${s.descricao}</small></div>`)
        .join("");
    } else if (estado === "repetido") {
      aviso = `<div class="aviso">Você já tinha este carimbo (${hora(quando)}).</div>`;
    } else if (quando) {
      aviso = `<div class="aviso">Carimbado às ${hora(quando)}.</div>`;
    } else {
      aviso = `<div class="aviso">Ainda não visitada: procure a <strong>mesa ${banca.mesa}</strong> e escaneie o QR Code.</div>`;
    }

    const botaoDemo = modoDemo && !quando
      ? `<button id="btn-demo" class="botao">Simular carimbo (demo)</button>`
      : "";

    $("modal-conteudo").innerHTML = `
      <div class="modal-topo" style="--cor:${banca.cor}">
        <div class="emoji">${banca.emoji}</div>
        <h2>${banca.nome}</h2>
      </div>
      ${aviso}
      <p>${banca.resumo}</p>
      <strong>Destaques</strong>
      <ul class="modal-lista">${banca.destaques.map((d) => `<li>${d}</li>`).join("")}</ul>
      <div class="acoes">${botaoDemo}</div>`;

    const btnDemo = $("btn-demo");
    if (btnDemo) btnDemo.onclick = () => carimbar(banca);

    if (!modal.open) modal.showModal();
  }

  // ---------- Eventos ----------

  $("grade").addEventListener("click", (e) => {
    const alvo = e.target.closest(".espaco");
    if (!alvo) return;
    abrirBanca(F.bancas.find((b) => b.id === alvo.dataset.id));
  });

  $("modal-fechar").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  $("form-codigo").addEventListener("submit", (e) => {
    e.preventDefault();
    const campo = $("campo-codigo");
    const msg = $("msg-codigo");
    const banca = porCodigo(campo.value);
    if (!banca) {
      msg.textContent = "Código não encontrado. Confira o código impresso na banca.";
      msg.className = "msg erro";
      return;
    }
    msg.textContent = "";
    msg.className = "msg";
    campo.value = "";
    carimbar(banca);
  });

  // Confirmação em dois toques: alguns navegadores (ex.: o embutido no Instagram)
  // bloqueiam o confirm() e ele retorna false sem mostrar nada.
  const btnReiniciar = $("btn-reiniciar");
  let aguardandoConfirmacao = null;
  btnReiniciar.addEventListener("click", () => {
    if (!aguardandoConfirmacao) {
      btnReiniciar.textContent = "Toque de novo para apagar todos os carimbos";
      aguardandoConfirmacao = setTimeout(() => {
        btnReiniciar.textContent = "Reiniciar passaporte";
        aguardandoConfirmacao = null;
      }, 4000);
      return;
    }
    clearTimeout(aguardandoConfirmacao);
    aguardandoConfirmacao = null;
    btnReiniciar.textContent = "Reiniciar passaporte";
    carimbos = {};
    salvar();
    render();
    scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- Início ----------

  render();

  // QR Code da banca abre: index.html?c=CODIGO
  const codigoUrl = params.get("c");
  if (codigoUrl) {
    // Remove o código da URL para que recarregar a página não carimbe de novo.
    params.delete("c");
    const resto = params.toString();
    history.replaceState(null, "", location.pathname + (resto ? `?${resto}` : ""));

    const banca = porCodigo(codigoUrl);
    if (banca) {
      carimbar(banca);
    } else {
      $("msg-codigo").textContent = "Este QR Code não pertence a nenhuma banca da feira.";
      $("msg-codigo").className = "msg erro";
    }
  }
})();
