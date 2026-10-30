// Edite os produtos aqui. Valores em reais. Fotos ilustrativas.
const categorias = [
  "Todos",
  "Destaques da casa",
  "Promoções",
  "Hambúrgueres",
  "Pizzas",
  "Pratos",
  "Porções",
  "Bebidas",
];
const produtos = [
  {
    id: 1,
    nome: "Burger da casa",
    categoria: "Hambúrgueres",
    preco: 29.9,
    anterior: 36.9,
    foto: "burger",
    selo: "FAVORITO DA CASA",
    descricao:
      "Pão macio, hambúrguer suculento e uma combinação que nunca falha.",
    ingredientes:
      "Pão de gergelim, hambúrguer bovino de 180 g, queijo cheddar, alface, tomate e molho da casa.",
    porcao: "1 unidade",
    tempo: "20–25 min",
    alergenos: "Contém glúten, leite e ovos.",
  },
  {
    id: 2,
    nome: "Pizza da casa",
    categoria: "Pizzas",
    preco: 59.9,
    foto: "pizza",
    selo: "PARA COMPARTILHAR",
    descricao:
      "Massa artesanal, queijo derretido e aquele encontro de sabores.",
    ingredientes:
      "Massa de fermentação lenta, molho de tomate, muçarela, tomate e ervas frescas.",
    porcao: "8 fatias",
    tempo: "30–40 min",
    alergenos: "Contém glúten e leite.",
  },
  {
    id: 3,
    nome: "Batatas crocantes",
    categoria: "Porções",
    preco: 24.9,
    foto: "fries",
    descricao: "Douradas por fora, macias por dentro. Perfeitas para dividir.",
    ingredientes:
      "Batatas selecionadas, sal e ervas. Acompanha maionese da casa.",
    porcao: "400 g · 2 pessoas",
    tempo: "15–20 min",
    alergenos: "Molho contém ovos. Consulte sobre contaminação cruzada.",
  },
  {
    id: 4,
    nome: "Grelhado especial",
    categoria: "Pratos",
    preco: 54.9,
    foto: "steak",
    descricao: "Carne grelhada no ponto, acompanhada de sabores frescos.",
    ingredientes:
      "Corte bovino de 250 g, batatas e acompanhamentos sazonais. Consulte o garçom sobre o ponto da carne.",
    porcao: "1 pessoa",
    tempo: "25–35 min",
    alergenos: "Consulte os ingredientes dos acompanhamentos com o garçom.",
  },
  {
    id: 5,
    nome: "Salada do jardim",
    categoria: "Pratos",
    preco: 27.9,
    foto: "salad",
    selo: "LEVE E FRESCA",
    descricao: "Uma seleção colorida de folhas e vegetais para o seu dia.",
    ingredientes:
      "Mix de folhas, vegetais da estação, grãos e molho de limão com azeite.",
    porcao: "1 pessoa",
    tempo: "10–15 min",
    alergenos: "Consulte os ingredientes sazonais com o garçom.",
  },
  {
    id: 6,
    nome: "Limonada refrescante",
    categoria: "Bebidas",
    tipo: "sem",
    preco: 12.9,
    foto: "drink",
    descricao: "Limão, gelo e frescor. Simples do jeito que a gente gosta.",
    ingredientes: "Suco de limão, água, gelo e açúcar opcional.",
    porcao: "400 ml",
    tempo: "5–10 min",
    alergenos: "Consulte o garçom em caso de restrições.",
  },
  {
    id: 7,
    nome: "Combo para dois",
    categoria: "Hambúrgueres",
    preco: 69.9,
    anterior: 84.9,
    foto: "burger",
    selo: "PARA DOIS",
    descricao:
      "Dois burgers da casa e uma porção de batatas para compartilhar.",
    ingredientes:
      "2 burgers da casa (180 g cada) e 1 porção de batatas de 400 g. Bebidas não incluídas.",
    porcao: "2 pessoas",
    tempo: "25–30 min",
    alergenos: "Contém glúten, leite e ovos.",
  },
  {
    id: 8,
    nome: "Drink cítrico",
    categoria: "Bebidas",
    tipo: "com",
    preco: 24.9,
    foto: "drink",
    selo: "COM ÁLCOOL · 18+",
    descricao: "Um brinde aos bons encontros, com notas cítricas e gelo.",
    ingredientes:
      "Destilado, limão, gelo e xarope de açúcar. Bebida alcoólica destinada a maiores de 18 anos.",
    porcao: "300 ml",
    tempo: "5–10 min",
    alergenos: "Consulte o garçom em caso de restrições.",
  },
];
// Exemplos de variações e disponibilidade. Os IDs devem permanecer estáveis.
produtos.forEach((p) => {
  p.disponivel = true;
  p.vegetariano = false;
  p.destaque = false;
});
produtos.find((p) => p.id === 2).variantes = [
  { id: "p", nome: "Pequena · 4 fatias", preco: 39.9 },
  { id: "m", nome: "Média · 6 fatias", preco: 49.9 },
  { id: "g", nome: "Grande · 8 fatias", preco: 59.9 },
];
produtos.find((p) => p.id === 3).variantes = [
  { id: "meia", nome: "Meia porção · 200 g", preco: 15.9 },
  { id: "inteira", nome: "Porção inteira · 400 g", preco: 24.9 },
];
produtos.find((p) => p.id === 6).variantes = [
  { id: "300", nome: "300 ml", preco: 10.9 },
  { id: "500", nome: "500 ml", preco: 14.9 },
];
produtos.find((p) => p.id === 5).vegetariano = true;
produtos.find((p) => p.id === 4).disponivel = false;
// Destaques da casa: aparecem no filtro "Destaques da casa". Escolha com o restaurante.
produtos.find((p) => p.id === 1).destaque = true;
produtos.find((p) => p.id === 2).destaque = true;
// Galeria: fotos extras além de "foto" (nome do arquivo em assets/, sem .webp).
// Aceita texto ou { foto, descricao } para descrever a foto a leitores de tela.
produtos.find((p) => p.id === 7).galeria = [
  { foto: "fries", descricao: "Porção de batatas que acompanha o combo" },
];
produtos.find((p) => p.id === 4).galeria = [
  { foto: "fries", descricao: "Batatas servidas como acompanhamento" },
];
