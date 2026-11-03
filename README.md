# Arte Siqueira — Comunicação Visual

Site institucional responsivo da Arte Siqueira, com galeria de fotos, vídeos com prévias silenciosas, avaliações e formulário de orçamento.

## Publicação

O projeto é estático. O arquivo `index.html` e a pasta `assets/` já estão na raiz, prontos para hospedagem. Não exige instalação de pacotes nem compilação.

Preservar os caminhos relativos dos arquivos CSS, JavaScript e mídia ao publicar. O arquivo `.nojekyll` acompanha a versão preparada para GitHub Pages.

## Edição

- `index.html`: conteúdo e estrutura.
- `style.css`, `refinements.css` e `motion.css`: identidade visual, responsividade e movimentos.
- `app.js` e `motion.js`: interações, galerias e formulário.
- `assets/gallery.json` e `assets/videos.json`: imagens, vídeos e suas legendas.

As prévias dos vídeos não contêm áudio. O vídeo completo é aberto apenas após clicar no play.

## Formulário

O formulário abre uma mensagem de orçamento no WhatsApp e solicita uma cópia por e-mail pelo FormSubmit. O recebimento de e-mails depende da ativação do endereço `artesiqueira1@hotmail.com` no serviço, com cópia para `artesiqueira2@hotmail.com`.

## Visualização local

Com Python instalado, execute `python -m http.server 4173` nesta pasta e acesse http://localhost:4173. As galerias usam arquivos JSON, portanto a visualização deve ser feita por um servidor local.
