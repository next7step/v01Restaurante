// Dados do catálogo são texto, nunca HTML executável.
function escapeHtml(text) {
  return String(text ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function productImage(name) {
  return /^[a-zA-Z0-9_-]+$/.test(String(name))
    ? `../assets/${name}.webp`
    : "../assets/burger.webp";
}
function logoImage(path) {
  // Logos locais somente. Exemplo no config: assets/logo.webp.
  return /^assets\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpg|jpeg|svg)$/.test(path) &&
    !path.includes("..")
    ? "../" + path
    : "";
}