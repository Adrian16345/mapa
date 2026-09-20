# Mapa de entretenimento público em São José dos Campos

Projeto acadêmico desenvolvido com HTML, CSS, JavaScript, Leaflet e OpenStreetMap.

## Estrutura

- `index.html` — estrutura da página
- `css/style.css` — toda a formatação visual
- `js/locais.js` — dados dos pontos de lazer
- `js/app.js` — mapa, filtros, pesquisa e interações

## Como executar

### Opção 1 — VS Code instalado
1. Extraia o ZIP.
2. Abra a pasta `mapa-lazer-sjc-corrigido` no VS Code.
3. Instale a extensão **Live Server**.
4. Clique com o botão direito em `index.html`.
5. Selecione **Open with Live Server**.

### Opção 2 — Python
Dentro da pasta do projeto, execute:

`python -m http.server 8000`

Depois abra `http://localhost:8000`.

## Observação

É necessário acesso à internet para carregar a biblioteca Leaflet e os blocos de mapa do OpenStreetMap.
