document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const locais = Array.isArray(window.LOCAIS) ? window.LOCAIS : [];

  const listaLocais = document.getElementById("listaLocais");
  const pesquisa = document.getElementById("pesquisa");
  const filtroAtividade = document.getElementById("filtroAtividade");
  const limparFiltros = document.getElementById("limparFiltros");
  const verTodos = document.getElementById("verTodos");
  const status = document.getElementById("status");
  const avisoMapa = document.getElementById("avisoMapa");
  const ano = document.getElementById("ano");

  ano.textContent = new Date().getFullYear();

  let mapa = null;
  let grupoMarcadores = null;
  const marcadores = new Map();

  function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
      const entidades = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return entidades[caractere];
    });
  }

  function iniciarMapa() {
    if (typeof window.L === "undefined") {
      avisoMapa.hidden = false;
      return;
    }

    mapa = L.map("mapa", {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([-23.20, -45.90], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    grupoMarcadores = L.featureGroup().addTo(mapa);

    locais.forEach(function (local) {
      if (!Number.isFinite(local.lat) || !Number.isFinite(local.lng)) {
        return;
      }

      const atividades = local.atividades
        .map(escaparHTML)
        .join(", ");

      const conteudoPopup = `
        <h3>${escaparHTML(local.nome)}</h3>
        <p>${escaparHTML(local.descricao)}</p>
        <p><strong>Local:</strong> ${escaparHTML(local.endereco)}</p>
        <p><strong>Atividades:</strong> ${atividades}</p>
      `;

      const marcador = L.marker([local.lat, local.lng])
        .bindPopup(conteudoPopup)
        .addTo(grupoMarcadores);

      marcadores.set(local.id, marcador);
    });

    ajustarMapa();

    // Garante o cálculo correto do tamanho após a renderização da página.
    setTimeout(function () {
      mapa.invalidateSize();
      ajustarMapa();
    }, 200);
  }

  function ajustarMapa() {
    if (!mapa || !grupoMarcadores) {
      return;
    }

    const limites = grupoMarcadores.getBounds();

    if (limites.isValid()) {
      mapa.fitBounds(limites.pad(0.18), {
        maxZoom: 14
      });
    }
  }

  function preencherFiltro() {
    const atividades = new Set();

    locais.forEach(function (local) {
      local.atividades.forEach(function (atividade) {
        atividades.add(atividade);
      });
    });

    Array.from(atividades)
      .sort(function (a, b) {
        return a.localeCompare(b, "pt-BR");
      })
      .forEach(function (atividade) {
        const option = document.createElement("option");
        option.value = atividade;
        option.textContent =
          atividade.charAt(0).toUpperCase() + atividade.slice(1);

        filtroAtividade.appendChild(option);
      });
  }

  function obterLocaisFiltrados() {
    const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
    const atividadeSelecionada = filtroAtividade.value;

    return locais.filter(function (local) {
      const textoPesquisavel = [
        local.nome,
        local.endereco,
        local.descricao,
        ...local.atividades
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondePesquisa =
        termo === "" || textoPesquisavel.includes(termo);

      const correspondeAtividade =
        atividadeSelecionada === "todos" ||
        local.atividades.includes(atividadeSelecionada);

      return correspondePesquisa && correspondeAtividade;
    });
  }

  function renderizarLocais() {
    const locaisFiltrados = obterLocaisFiltrados();

    listaLocais.innerHTML = "";

    status.textContent =
      locaisFiltrados.length === 1
        ? "1 local encontrado"
        : `${locaisFiltrados.length} locais encontrados`;

    if (locaisFiltrados.length === 0) {
      listaLocais.innerHTML =
        '<div class="vazio">Nenhum local corresponde aos filtros selecionados.</div>';
      return;
    }

    locaisFiltrados.forEach(function (local) {
      const artigo = document.createElement("article");
      artigo.className = "cartao";

      const tags = local.atividades
        .map(function (atividade) {
          return `<span class="tag">${escaparHTML(atividade)}</span>`;
        })
        .join("");

      artigo.innerHTML = `
        <h3>${escaparHTML(local.nome)}</h3>
        <p>${escaparHTML(local.descricao)}</p>
        <p><strong>${escaparHTML(local.endereco)}</strong></p>
        <div class="tags">${tags}</div>
        <button type="button">Mostrar no mapa</button>
      `;

      artigo
        .querySelector("button")
        .addEventListener("click", function () {
          mostrarNoMapa(local);
        });

      listaLocais.appendChild(artigo);
    });
  }

  function mostrarNoMapa(local) {
    if (!mapa) {
      avisoMapa.hidden = false;
      return;
    }

    const marcador = marcadores.get(local.id);

    if (!marcador) {
      return;
    }

    mapa.setView(marcador.getLatLng(), 15, {
      animate: true
    });

    marcador.openPopup();

    document.querySelector(".mapa-container").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  pesquisa.addEventListener("input", renderizarLocais);
  filtroAtividade.addEventListener("change", renderizarLocais);

  limparFiltros.addEventListener("click", function () {
    pesquisa.value = "";
    filtroAtividade.value = "todos";
    renderizarLocais();
    ajustarMapa();
    pesquisa.focus();
  });

  verTodos.addEventListener("click", ajustarMapa);

  preencherFiltro();
  renderizarLocais();
  iniciarMapa();
});
