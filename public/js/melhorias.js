// Funções da versão 2. Sem servidor, checkout ou envio de pedidos.
const storageKey = `cardapio:${restaurante.id}:lista:v2`;
let choices = [];
// Persistência não confiável: valida, limita, agrupa e expira após 24 horas.
try {
  const raw = localStorage.getItem(storageKey);
  const stored = raw && raw.length < 50000 ? JSON.parse(raw) : null;
  if (
    stored &&
    !Array.isArray(stored) &&
    Number.isFinite(stored.savedAt) &&
    Date.now() - stored.savedAt < 86400000 &&
    stored.savedAt <= Date.now() &&
    Array.isArray(stored.items)
  ) {
    for (const x of stored.items.slice(0, 100)) {
      if (
        !x ||
        !Number.isInteger(x.id) ||
        !Number.isInteger(x.qty) ||
        x.qty < 1 ||
        x.qty > 99
      )
        continue;
      const p = produtos.find((p) => p.id === x.id);
      if (
        !p ||
        (p.variantes
          ? !p.variantes.some((v) => v.id === x.variant)
          : x.variant !== "unico")
      )
        continue;
      const existing = choices.find(
        (i) => i.id === x.id && i.variant === x.variant,
      );
      if (existing) existing.qty = Math.min(99, existing.qty + x.qty);
      else choices.push({ id: x.id, variant: x.variant, qty: x.qty });
    }
  }
} catch {
  /* Funciona em memória se o armazenamento estiver bloqueado. */
}
function saveChoices() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ savedAt: Date.now(), items: choices }),
    );
  } catch {}
  updateList();
}
let toastTimer;
function notify(text) {
  const box = document.querySelector("#announcement");
  box.textContent = text;
  box.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("visible"), 2500);
}
// Galeria: foto principal + p.galeria (texto ou { foto, descricao }).
let gallery = [];
let galleryIndex = 0;
function productPhotos(p) {
  const extras = Array.isArray(p.galeria) ? p.galeria : [];
  const photos = [{ foto: p.foto }, ...extras]
    .map((g) => (typeof g === "string" ? { foto: g } : g))
    .filter((g) => g && g.foto);
  return photos.map((g, i) => ({
    src: productImage(g.foto),
    alt:
      (g.descricao ? String(g.descricao) : `Foto ilustrativa de ${p.nome}`) +
      (photos.length > 1 ? ` (foto ${i + 1} de ${photos.length})` : ""),
  }));
}
function showPhoto(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const g = gallery[galleryIndex];
  const photo = document.querySelector(".modal-photo");
  photo.src = g.src;
  photo.alt = g.alt;
  document
    .querySelectorAll(".gallery-thumbs button")
    .forEach((b, i) => b.setAttribute("aria-current", i === galleryIndex));
  const image = document.querySelector("#zoom-image");
  image.src = g.src;
  image.alt = `Ampliada: ${g.alt}`;
  document.querySelector("#zoom-counter").textContent =
    `Foto ${galleryIndex + 1} de ${gallery.length}`;
}
const zoomDialog = document.querySelector("#zoom-dialog");
document
  .querySelector("#zoom-prev")
  .addEventListener("click", () => showPhoto(galleryIndex - 1));
document
  .querySelector("#zoom-next")
  .addEventListener("click", () => showPhoto(galleryIndex + 1));
zoomDialog.addEventListener("keydown", (e) => {
  if (gallery.length < 2) return;
  if (e.key === "ArrowLeft") showPhoto(galleryIndex - 1);
  if (e.key === "ArrowRight") showPhoto(galleryIndex + 1);
});
// Deslizar o dedo na foto ampliada troca de foto.
let touchX = null;
zoomDialog.addEventListener(
  "touchstart",
  (e) => (touchX = e.touches.length === 1 ? e.touches[0].clientX : null),
  { passive: true },
);
zoomDialog.addEventListener("touchend", (e) => {
  if (touchX === null || gallery.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(galleryIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});
function prepareProduct(p) {
  const copy = document.querySelector(".modal-copy");
  const photo = document.querySelector(".modal-photo");
  gallery = productPhotos(p);
  const zoom = document.createElement("button");
  zoom.id = "enlarge-photo";
  zoom.className = "enlarge";
  zoom.textContent = "⤢ Ampliar foto";
  zoom.addEventListener("click", () => {
    showPhoto(galleryIndex);
    zoomDialog.querySelector(".zoom-nav").hidden = gallery.length < 2;
    zoomDialog.showModal();
  });
  photo.after(zoom);
  if (gallery.length > 1) {
    const thumbs = document.createElement("div");
    thumbs.className = "gallery-thumbs";
    thumbs.setAttribute("role", "group");
    thumbs.setAttribute("aria-label", `Fotos de ${p.nome}`);
    gallery.forEach((g, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Ver foto ${i + 1} de ${gallery.length}`);
      const img = document.createElement("img");
      img.src = g.src;
      img.alt = "";
      b.append(img);
      b.addEventListener("click", () => showPhoto(i));
      thumbs.append(b);
    });
    zoom.after(thumbs);
  }
  showPhoto(0);
  const block = document.createElement("div");
  block.className = "choice-block";
  const options = p.variantes || [
    { id: "unico", nome: p.porcao, preco: p.preco },
  ];
  block.innerHTML = `${p.vegetariano ? '<span class="vegetarian-tag">Opção vegetariana</span>' : ""}<label for="variant">${p.variantes ? "Escolha o tamanho" : "Porção"}</label><select id="variant">${options.map((v) => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.nome)} — ${money(v.preco)}</option>`).join("")}</select><div class="choice-actions"><label>Quantidade<input id="quantity" required type="number" min="1" max="99" value="1" inputmode="numeric"></label><button id="add-choice" class="primary" ${p.disponivel ? "" : "disabled"}>${p.disponivel ? "♡ Guardar na lista" : "Indisponível hoje"}</button></div><p class="fineprint">A lista é um lembrete. Nenhum pedido é enviado.</p><p id="choice-feedback" role="status" aria-live="polite"></p>`;
  copy.querySelector(".modal-note").before(block);
  const select = block.querySelector("select");
  const price = copy.querySelector(".price");
  const updatePrice = () => {
    const v = options.find((v) => v.id === select.value);
    price.textContent = money(v.preco);
    copy.querySelector(".modal-meta span").textContent = v.nome;
  };
  select.addEventListener("change", updatePrice);
  if (p.variantes) updatePrice();
  block.querySelector("#add-choice").addEventListener("click", () => {
    const qty = Number(block.querySelector("#quantity").value);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      block.querySelector("#quantity").reportValidity();
      return;
    }
    if (!p.disponivel) return;
    const variant = select.value;
    const item = choices.find((x) => x.id === p.id && x.variant === variant);
    if (item) item.qty = Math.min(99, item.qty + qty);
    else choices.push({ id: p.id, variant, qty });
    saveChoices();
    block.querySelector("#choice-feedback").textContent =
      "✓ Adicionado à sua lista. Mostre ao garçom.";
  });
}
function updateList() {
  let total = 0;
  const container = document.querySelector("#list-items");
  container.replaceChildren();
  choices.forEach((item, index) => {
    const p = produtos.find((p) => p.id === item.id);
    if (!p) return;
    const v = p.variantes?.find((v) => v.id === item.variant) || {
      nome: p.porcao,
      preco: p.preco,
    };
    if (p.disponivel) total += Math.round(v.preco * 100) * item.qty;
    const row = document.createElement("article");
    row.className = "list-item";
    row.innerHTML = `<img src="${productImage(p.foto)}" alt=""><div><h3>${escapeHtml(p.nome)}</h3><p>${escapeHtml(v.nome)}</p><strong>${p.disponivel ? money(v.preco) : "Indisponível hoje"}</strong><div class="quantity-actions"><button data-step="-1" aria-label="Diminuir quantidade de ${escapeHtml(p.nome)}">−</button><span>${item.qty}</span><button data-step="1" aria-label="Aumentar quantidade de ${escapeHtml(p.nome)}" ${item.qty >= 99 ? "disabled" : ""}>+</button><button class="remove-choice">Remover</button></div></div>`;
    row.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        item.qty += Number(b.dataset.step);
        if (item.qty <= 0) choices.splice(index, 1);
        saveChoices();
        container
          .querySelectorAll(".list-item")
          [
            Math.min(index, choices.length - 1)
          ]?.querySelector(`[data-step="${b.dataset.step}"]`)
          ?.focus();
      }),
    );
    row.querySelector(".remove-choice").addEventListener("click", () => {
      choices.splice(index, 1);
      saveChoices();
      (
        container.querySelector(".remove-choice") ||
        document.querySelector("#list-dialog .close")
      ).focus();
    });
    container.append(row);
  });
  if (!choices.length)
    container.innerHTML =
      '<div class="empty-list"><span>♡</span><h3>Sua lista começa com uma boa escolha.</h3><p>Abra um produto e toque em “Guardar na lista”.</p></div>';
  document.querySelector("#list-count").textContent = choices.reduce(
    (sum, x) => sum + x.qty,
    0,
  );
  document.querySelector("#list-total").textContent = choices.length
    ? `Estimativa dos itens disponíveis: ${money(total / 100)}`
    : "";
  document.querySelector("#clear-list").hidden = !choices.length;
}
document.querySelector("#vegetarian").addEventListener("change", render);
// Inverte as cores do botão "Minha lista" quando ele passa sobre o rodapé.
const listFab = document.querySelector("#open-list");
const footer = document.querySelector("footer");
let fabFrame = 0;
function updateFab() {
  fabFrame = 0;
  const fab = listFab.getBoundingClientRect();
  listFab.classList.toggle(
    "sobre-rodape",
    footer.getBoundingClientRect().top < fab.top + fab.height / 2,
  );
}
const scheduleFab = () => (fabFrame ||= requestAnimationFrame(updateFab));
addEventListener("scroll", scheduleFab, { passive: true });
addEventListener("resize", scheduleFab);
updateFab();
document.querySelector("#open-list").addEventListener("click", () => {
  updateList();
  openDialog(document.querySelector("#list-dialog"));
});
document.querySelector("#clear-list").addEventListener("click", () => {
  choices = [];
  saveChoices();
  document.querySelector("#list-total").textContent = "Lista limpa.";
});
function safeLink(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
// Seta ↗ em SVG (ver .seta no CSS); o caractere vira emoji em celulares.
function arrowIcon() {
  const seta = document.createElement("span");
  seta.className = "seta";
  seta.setAttribute("aria-hidden", "true");
  return seta;
}
function contact(label, url) {
  const a = document.createElement(safeLink(url) ? "a" : "span");
  a.textContent = label;
  if (safeLink(url)) {
    a.href = safeLink(url);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}
function configure() {
  document.title = `${restaurante.nome} · Cardápio`;
  document.documentElement.style.setProperty(
    "--page-bg",
    restaurante.cores.fundo,
  );
  document.documentElement.style.setProperty("--ink", restaurante.cores.texto);
  document.documentElement.style.setProperty(
    "--accent",
    restaurante.cores.destaque,
  );
  document.querySelectorAll(".brand").forEach((brand) => {
    const label = brand.lastElementChild;
    label.replaceChildren(document.createTextNode(restaurante.nome));
    const small = document.createElement("small");
    small.textContent = restaurante.slogan;
    label.append(small);
    brand.setAttribute("aria-label", `${restaurante.nome}, início`);
    if (logoImage(restaurante.logo)) {
      const img = document.createElement("img");
      img.src = logoImage(restaurante.logo);
      img.alt = "";
      img.className = "custom-logo";
      brand.querySelector(".logo").replaceWith(img);
    }
  });
  document.querySelector(".demo").hidden = !restaurante.demonstracao;
  document.querySelector(".demo-label").textContent = restaurante.demonstracao
    ? "Estabelecimento de demonstração"
    : restaurante.observacao;
  const foot = document.querySelectorAll(".footer-top > div");
  foot[1].querySelector("p").textContent = restaurante.endereco;
  foot[1].querySelector("small").textContent = restaurante.demonstracao
    ? "Endereço de exemplo"
    : "";
  const contacts = foot[2].querySelector("p");
  contacts.replaceChildren(
    contact(restaurante.instagram, restaurante.instagramUrl),
    document.createElement("br"),
    contact(restaurante.whatsapp, restaurante.whatsappUrl),
  );
  foot[2].querySelector("small").textContent = restaurante.demonstracao
    ? "Contatos de demonstração"
    : "";
  document
    .querySelector(".footer-bottom > span")
    .replaceChildren(
      document.createTextNode(
        `© ${new Date().getFullYear()} ${restaurante.nome}`,
      ),
    );
  const about = document.querySelector("#about-dialog .about-copy");
  about.innerHTML = `<span class="eyebrow">INFORMAÇÕES DO RESTAURANTE</span><h2 id="about-title">${escapeHtml(restaurante.nome)}</h2>${restaurante.demonstracao ? '<p class="info-demo">Dados ilustrativos para apresentação do protótipo.</p>' : ""}<h3>Onde estamos</h3><p>${escapeHtml(restaurante.endereco)}</p><h3>Horários de atendimento</h3><ul class="hours">${restaurante.horarios.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul><h3>Contato</h3><div id="info-contacts"></div><p>${escapeHtml(restaurante.observacao)}</p><p>Consulte o cardápio e faça seu pedido com o garçom.</p>`;
  const c = about.querySelector("#info-contacts");
  c.append(
    contact(restaurante.instagram, restaurante.instagramUrl),
    document.createElement("br"),
    contact(restaurante.whatsapp, restaurante.whatsappUrl),
  );
  if (safeLink(restaurante.mapaUrl)) {
    const mapa = contact("Ver no mapa ", restaurante.mapaUrl);
    mapa.append(arrowIcon());
    c.append(document.createElement("br"), mapa);
  }
  document.querySelector("#about").textContent = "Horários e informações";
  const info = document.createElement("button");
  info.className = "restaurant-info";
  info.append("Horários e informações ", arrowIcon());
  info.addEventListener("click", () =>
    openDialog(document.querySelector("#about-dialog")),
  );
  document.querySelector(".hero-copy").append(info);
  const footerLink = document.createElement("button");
  footerLink.className = "footer-info";
  footerLink.append("Ver horários e informações ", arrowIcon());
  footerLink.addEventListener("click", () =>
    openDialog(document.querySelector("#about-dialog")),
  );
  foot[1].append(footerLink);
}
configure();
updateList();