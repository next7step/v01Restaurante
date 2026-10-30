#!/usr/bin/env node
// Valida config.js e produtos.js antes de publicar.
// Uso: node ferramentas/validar-cardapio.js
// Sai com código 1 se houver ERROS (o GitHub Actions marca o envio como falho).
// AVISOS não bloqueiam, mas devem ser revisados antes de imprimir o QR.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..", "public");
const erros = [];
const avisos = [];
const erro = (onde, msg) => erros.push(`${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`${onde}: ${msg}`);

// Carrega os arquivos como o navegador faz: scripts em sequência, mesmo escopo.
const contexto = vm.createContext({ console });
for (const arquivo of ["js/config.js", "js/produtos.js"]) {
  try {
    vm.runInContext(fs.readFileSync(path.join(raiz, arquivo), "utf8"), contexto, {
      filename: arquivo,
    });
  } catch (e) {
    const linha = (e.stack || "").match(new RegExp(`${arquivo.replace(".", "\\.")}:(\\d+)`));
    console.error(`ERRO ao ler ${arquivo}${linha ? ` (linha ${linha[1]})` : ""}: ${e.message}`);
    if (/find\(/.test(String(e.stack)) || /undefined \(setting/.test(e.message))
      console.error("Provável causa: um produtos.find((p) => p.id === N) aponta para um id que não existe.");
    console.error("Confira vírgulas, aspas e chaves perto da linha indicada.");
    process.exit(1);
  }
}
const { restaurante, categorias, produtos } = vm.runInContext(
  "({ restaurante: typeof restaurante !== 'undefined' ? restaurante : undefined," +
    " categorias: typeof categorias !== 'undefined' ? categorias : undefined," +
    " produtos: typeof produtos !== 'undefined' ? produtos : undefined })",
  contexto,
);

const textoValido = (v) => typeof v === "string" && v.trim() !== "";
const nomeFotoValido = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]+$/.test(v);
const fotoExiste = (nome) => fs.existsSync(path.join(raiz, "assets", `${nome}.webp`));
const precoValido = (v) =>
  typeof v === "number" && Number.isFinite(v) && v > 0 && Math.round(v * 100) === +(v * 100).toFixed(6);
const urlHttps = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
};
const fotosUsadas = new Set();
function conferirFoto(onde, nome) {
  if (!nomeFotoValido(nome))
    return erro(onde, `nome de foto "${nome}" inválido (use letras, números, - ou _, sem extensão)`);
  fotosUsadas.add(nome);
  if (!fotoExiste(nome)) erro(onde, `arquivo public/assets/${nome}.webp não existe`);
}

// --- restaurante (config.js) -------------------------------------------------
if (!restaurante || typeof restaurante !== "object") {
  erro("config.js", "objeto restaurante não encontrado");
} else {
  const r = restaurante;
  if (!/^[a-z0-9-]+$/.test(String(r.id))) erro("config.js › id", "use só letras minúsculas, números e hífen");
  if (!textoValido(r.nome)) erro("config.js › nome", "obrigatório");
  for (const chave of ["fundo", "texto", "destaque"])
    if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(r.cores?.[chave])))
      erro(`config.js › cores.${chave}`, `"${r.cores?.[chave]}" não é uma cor hexadecimal (#rgb ou #rrggbb)`);
  if (!Array.isArray(r.horarios) || !r.horarios.every(textoValido))
    erro("config.js › horarios", "deve ser uma lista de textos");
  for (const chave of ["instagramUrl", "whatsappUrl", "mapaUrl", "siteUrl"])
    if (r[chave] && !urlHttps(r[chave]))
      erro(`config.js › ${chave}`, `"${r[chave]}" precisa ser um endereço https:// válido (ou vazio)`);
  if (r.logo) {
    if (!/^assets\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpg|jpeg|svg)$/.test(r.logo) || r.logo.includes(".."))
      erro("config.js › logo", `"${r.logo}" deve ser um arquivo em assets/ (ex.: assets/logo.webp)`);
    else if (!fs.existsSync(path.join(raiz, r.logo))) erro("config.js › logo", `arquivo public/${r.logo} não existe`);
  }
  if (r.demonstracao) aviso("config.js", "demonstracao: true — o site ainda mostra avisos de demonstração");
  if (!r.siteUrl) aviso("config.js › siteUrl", "vazio — preencha com a URL definitiva antes de gerar o QR");
  if (/exemplo|fictício|a configurar/i.test(`${r.endereco} ${r.whatsapp}`))
    aviso("config.js", "endereço ou contato ainda parecem dados de exemplo");
}

// --- categorias -------------------------------------------------------------
const especiais = ["Todos", "Promoções", "Destaques da casa"];
if (!Array.isArray(categorias) || !categorias.every(textoValido)) {
  erro("produtos.js › categorias", "deve ser uma lista de textos");
} else {
  if (categorias[0] !== "Todos") erro("produtos.js › categorias", 'a primeira categoria deve ser "Todos"');
  const repetidas = categorias.filter((c, i) => categorias.indexOf(c) !== i);
  if (repetidas.length) erro("produtos.js › categorias", `repetidas: ${repetidas.join(", ")}`);
}

// --- produtos ---------------------------------------------------------------
const camposConhecidos = new Set([
  "id", "nome", "categoria", "tipo", "preco", "anterior", "foto", "galeria", "selo",
  "descricao", "ingredientes", "porcao", "tempo", "alergenos", "variantes",
  "disponivel", "vegetariano", "destaque",
]);
if (!Array.isArray(produtos) || !produtos.length) {
  erro("produtos.js", "lista de produtos vazia ou não encontrada");
} else {
  const ids = new Map();
  produtos.forEach((p, i) => {
    const onde = `produto ${p?.id ?? `#${i + 1}`}${textoValido(p?.nome) ? ` (${p.nome})` : ""}`;
    if (!p || typeof p !== "object") return erro(onde, "não é um objeto");

    if (!Number.isInteger(p.id) || p.id < 1) erro(onde, "id deve ser um número inteiro positivo");
    else if (ids.has(p.id)) erro(onde, `id repetido (também usado por "${ids.get(p.id)}")`);
    else ids.set(p.id, p.nome);

    for (const campo of ["nome", "descricao", "ingredientes", "alergenos", "tempo"])
      if (!textoValido(p[campo])) erro(onde, `campo "${campo}" obrigatório`);
    if (!p.variantes && !textoValido(p.porcao)) erro(onde, 'campo "porcao" obrigatório (sem variantes)');
    for (const campo of Object.keys(p))
      if (!camposConhecidos.has(campo)) aviso(onde, `campo desconhecido "${campo}" (erro de digitação?)`);
    for (const campo of ["nome", "descricao", "ingredientes", "alergenos", "selo", "porcao"])
      if (/[<>]/.test(p[campo] ?? "")) aviso(onde, `"${campo}" contém < ou > — será exibido como texto, não como HTML`);

    if (Array.isArray(categorias)) {
      if (especiais.includes(p.categoria)) erro(onde, `"${p.categoria}" é um filtro automático, não uma categoria de produto`);
      else if (!categorias.includes(p.categoria)) erro(onde, `categoria "${p.categoria}" não está na lista de categorias`);
    }
    if (p.categoria === "Bebidas" && !["com", "sem"].includes(p.tipo))
      erro(onde, 'bebidas precisam de tipo "com" ou "sem" (álcool) para aparecer nos filtros');

    if (!precoValido(p.preco)) erro(onde, `preço "${p.preco}" inválido (número maior que zero, até 2 casas: 29.9)`);
    if (p.anterior !== undefined) {
      if (!precoValido(p.anterior)) erro(onde, `preço anterior "${p.anterior}" inválido`);
      else if (p.anterior <= p.preco) erro(onde, "preço anterior deve ser maior que o preço atual (promoção)");
      if (p.variantes) aviso(onde, "promoção com variantes: o preço riscado some ao trocar o tamanho");
    }

    conferirFoto(onde, p.foto);
    if (p.galeria !== undefined) {
      if (!Array.isArray(p.galeria)) erro(onde, "galeria deve ser uma lista");
      else
        p.galeria.forEach((g, j) => {
          const nome = typeof g === "string" ? g : g?.foto;
          conferirFoto(`${onde} › galeria[${j + 1}]`, nome);
          if (typeof g === "object" && g && g.descricao !== undefined && !textoValido(g.descricao))
            erro(`${onde} › galeria[${j + 1}]`, "descricao vazia");
        });
    }

    if (p.variantes !== undefined) {
      if (!Array.isArray(p.variantes) || !p.variantes.length) erro(onde, "variantes deve ser uma lista com pelo menos 1 item");
      else {
        const vids = new Set();
        p.variantes.forEach((v, j) => {
          const ov = `${onde} › variante ${j + 1}`;
          if (!textoValido(String(v?.id ?? ""))) erro(ov, "id obrigatório");
          else if (vids.has(v.id)) erro(ov, `id "${v.id}" repetido`);
          else vids.add(v.id);
          if (v?.id === "unico") erro(ov, 'id "unico" é reservado');
          if (!textoValido(v?.nome)) erro(ov, "nome obrigatório");
          if (!precoValido(v?.preco)) erro(ov, `preço "${v?.preco}" inválido`);
        });
        if (precoValido(p.preco) && !p.variantes.some((v) => v.preco === p.preco))
          aviso(onde, "preco não corresponde a nenhuma variante");
      }
    }

    for (const campo of ["disponivel", "vegetariano", "destaque"])
      if (p[campo] !== undefined && typeof p[campo] !== "boolean") erro(onde, `"${campo}" deve ser true ou false`);
    if (p.selo !== undefined && !textoValido(p.selo)) erro(onde, "selo vazio");
    if (p.selo && p.selo.length > 24) aviso(onde, `selo com ${p.selo.length} caracteres pode quebrar no celular`);
  });

  if (Array.isArray(categorias))
    for (const c of categorias)
      if (!especiais.includes(c) && !produtos.some((p) => p.categoria === c))
        aviso("produtos.js › categorias", `"${c}" não tem nenhum produto`);
  if (categorias?.includes("Destaques da casa") && !produtos.some((p) => p.destaque))
    aviso("produtos.js", '"Destaques da casa" está nas categorias, mas nenhum produto tem destaque: true');
}

// --- fotos sem uso ----------------------------------------------------------
const naoUsadas = fs
  .readdirSync(path.join(raiz, "assets"))
  .filter((f) => f.endsWith(".webp") && !fotosUsadas.has(f.replace(/\.webp$/, "")));
if (naoUsadas.length) aviso("assets", `fotos .webp sem uso: ${naoUsadas.join(", ")}`);

// --- resultado --------------------------------------------------------------
for (const a of avisos) console.log(`AVISO  ${a}`);
for (const e of erros) console.log(`ERRO   ${e}`);
console.log(
  erros.length
    ? `\n✗ ${erros.length} erro(s). Corrija antes de publicar.`
    : `\n✓ Cardápio válido: ${produtos.length} produtos${avisos.length ? `, ${avisos.length} aviso(s) para revisar` : ""}.`,
);
process.exit(erros.length ? 1 : 0);
