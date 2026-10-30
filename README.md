# nex7step — protótipo 3

Abra `index.html` na raiz. Ele encaminha para `public/pages/index.html`.

## GitHub Pages

1. Envie o **conteúdo** desta pasta para a raiz do repositório (o index.html deve ficar na raiz, não dentro de outra pasta).
2. Em Settings → Pages, configure a publicação a partir da branch desejada, pasta `/ (root)`.
3. Ative **Enforce HTTPS** quando disponível.
4. Abra a URL publicada e teste imagens, filtros, modal e lista.

Os caminhos relativos também funcionam em `https://usuario.github.io/repositorio/`.
Não use a visualização de arquivos do github.com como hospedagem.

## Personalização

- `public/js/config.js`: marca, cores, contatos HTTPS, logo local e horários.
- `public/js/produtos.js`: itens, preços, disponibilidade e variações.
  - `destaque: true` coloca o produto no filtro “Destaques da casa”.
  - `galeria: ["fries", { foto: "salad", descricao: "..." }]` adiciona fotos extras (arquivos `.webp` em `public/assets/`).
- `public/css/style.css`: aparência e regras responsivas.
- `REVISAO.md`: correções, limites de segurança e melhorias sugeridas.

## Antes de publicar

1. Rode `node ferramentas/validar-cardapio.js` (precisa do Node.js). Ele confere IDs, preços, categorias, fotos, variações e links.
2. No GitHub, o workflow **Validar cardápio** roda o mesmo teste a cada envio; um ✗ vermelho no commit indica erro no cadastro.
3. Siga `TESTES-CELULAR.md` em um iPhone e um Android reais.

O crédito de desenvolvimento nex7step permanece no rodapé.
Não há backend, envio de pedidos ou cobrança. A lista expira em 24h e pode ser apagada pelo cliente.
Atualizações reais exigem editar os arquivos e republicar. Nunca coloque segredos, senhas ou chaves privadas neste repositório.
