# Roteiro de testes em celulares reais

Use antes de imprimir o QR e sempre que mudar o layout. Leva cerca de 20 minutos por aparelho.
Teste pelo menos **1 iPhone** (Safari) e **1 Android** (Chrome), de preferência um deles com tela pequena (≈ 320–360 px de largura, como iPhone SE ou Android de entrada).

Anote para cada item: ✅ ok · ⚠️ funciona com dificuldade · ❌ não funciona.

## 1. Básico (todos os aparelhos)

| # | Passo | Esperado |
|---|---|---|
| 1 | Escanear o QR com a câmera nativa | Abre o cardápio em HTTPS (cadeado), sem passar por outro domínio |
| 2 | Rolar até o fim e tentar arrastar além | Rodapé é a última coisa, sem faixa clara abaixo; nada cortado na lateral; botão “Minha lista” fica branco sobre o rodapé e não cobre texto |
| 3 | Buscar “batata” e depois “BATATA” | Mesmo resultado; acentos ignorados (“limao” acha “Limão”) |
| 4 | Tocar em cada categoria, inclusive “Destaques da casa” | Lista muda e o contador “N opções” acompanha |
| 5 | Ordenar por menor e maior preço | Ordem correta; produtos com tamanhos usam o “A partir de” |
| 6 | Trocar grade ↔ lista, fechar e reabrir o navegador | Volta no último modo escolhido |
| 7 | Abrir “Combo para dois”, tocar nas miniaturas | Foto principal troca |
| 8 | “Ampliar foto”, deslizar o dedo para os lados | Troca de foto; contador “Foto 2 de 2” |
| 9 | Escolher tamanho e quantidade, guardar na lista | Contador do botão “Minha lista” aumenta |
| 10 | Abrir a lista, mudar quantidades, remover, limpar | Total recalcula; nada some sem ação do usuário |
| 11 | Modo avião após abrir o site | Lista continua visível (não precisa de internet) |
| 12 | Celular na horizontal | Layout continua usável |
| 12b | Olhar todas as setas ↗ (logo, botão do topo, legenda da foto, cards, rodapé) | Setas finas pretas ou brancas, nunca emoji azul |

## 2. Ampliação de texto e zoom

| # | Configuração | Esperado |
|---|---|---|
| 13 | **iPhone:** Ajustes › Tela e Brilho › Tamanho do Texto no máximo. **Android:** Configurações › Tela › Tamanho da fonte no máximo | ⚠️ Hoje as fontes são fixas em px e **não aumentam** — ver item “Fontes em px” na revisão |
| 14 | Pinça (zoom com dois dedos) até 200% | Permitido; texto legível, sem precisar rolar para os lados para ler uma linha |
| 15 | **Android:** Configurações › Acessibilidade › Ampliação | Cardápio navegável ampliado |
| 16 | Modo escuro do sistema ativado | Cores do site se mantêm legíveis (o site não tem tema escuro próprio) |

## 3. Leitor de tela

**iPhone — VoiceOver:** Ajustes › Acessibilidade › VoiceOver (atalho: clique triplo no botão lateral).
Deslizar 1 dedo para a direita = próximo item · toque duplo = ativar · rotor (girar 2 dedos) › Títulos = pular por títulos.

**Android — TalkBack:** Configurações › Acessibilidade › TalkBack (atalho: segurar as 2 teclas de volume).
Deslizar para a direita = próximo · toque duplo = ativar · deslizar para cima e depois para baixo = mudar navegação.

| # | Passo | Esperado |
|---|---|---|
| 17 | Primeiro item da página | “Ir para o cardápio” é anunciado e leva às categorias |
| 18 | Categorias | Anuncia nome + “selecionado/pressionado” na categoria ativa |
| 19 | Card de produto | ⚠️ Hoje anuncia só “Ver detalhes de Burger da casa” — preço e descrição não são lidos (ver revisão) |
| 20 | Ordenar e Grade/Lista | “Ordenar, Sugestão da casa, menu pop-up” · “Lista, botão, selecionado” |
| 21 | Após mudar filtro/ordem | Anuncia “N opções” |
| 22 | Abrir produto | Foco vai para o botão Fechar; o fundo não é lido; fechar devolve o foco ao card |
| 23 | Miniaturas da galeria | “Ver foto 2 de 2, botão” |
| 24 | Preço promocional | ⚠️ Hoje o preço riscado é lido sem indicar que é o valor antigo (ver revisão) |
| 25 | Guardar na lista | Anuncia “Adicionado à sua lista” |
| 26 | Botão “Minha lista” | ⚠️ Hoje não anuncia quantos itens há na lista (ver revisão) |

## 4. Teclado (notebook ou tablet com teclado)

| # | Passo | Esperado |
|---|---|---|
| 27 | Tab por toda a página | Ordem lógica, contorno de foco sempre visível |
| 28 | Tab até a busca | ⚠️ Hoje o campo de busca não mostra contorno de foco (ver revisão) |
| 29 | Esc em diálogos e no menu | Fecha e devolve o foco |
| 30 | Setas ← → na foto ampliada | Troca de foto |

## O que já foi testado em emulador

Testes automatizados em Chromium emulando iPhone 13, iPhone SE, Pixel 7 e Galaxy S9+:
sem erros de JavaScript, sem rolagem horizontal (inclusive com zoom de 400% = 320 px), novos controles acessíveis por teclado e
anunciados corretamente na árvore de acessibilidade. As falhas de contraste e as fontes que não aumentam estão listadas na revisão.
Emulador **não substitui** os testes acima: Safari/iOS, VoiceOver e TalkBack reais se comportam de forma diferente.
