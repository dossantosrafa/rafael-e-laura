# Rafael & Laura ♡ — Nosso cantinho

Site romântico personalizado, estático, responsivo, sem dependência de servidor e pronto para hospedagem gratuita no **GitHub Pages**.

## O que tem aqui

- História do pedido de namoro na chuva, com flores e alianças
- Contador de dias, horas, minutos e segundos desde **22/11/2026**
- Calendário automático das bodas dos primeiros 12 meses
- Galeria pronta para 4 fotos (com ilustrações enquanto as fotos não forem adicionadas)
- Carta romântica interativa
- Botão para compartilhar o link pelo celular ou copiar o endereço
- Layout adaptado para celular, tablet e computador

## Publicar pelo site do GitHub (sem instalar nada)

1. Entre em https://github.com/new e crie um repositório **público**. Sugestão de nome: `rafael-e-laura`.
2. Na pasta do projeto, envie `index.html`, `style.css`, `script.js`, `README.md` e a pasta `fotos` (ou envie o conteúdo do ZIP descompactado). O `index.html` precisa ficar na **raiz** do repositório.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione **main** e **/(root)**. Clique em **Save**.
6. Depois da publicação, o endereço normalmente é:
   `https://SEU-USUARIO.github.io/rafael-e-laura/`
   (Substitua `SEU-USUARIO` pelo seu usuário do GitHub.)
7. Abra esse endereço no iPhone, Android ou computador. Compartilhe com a Laura.

Se preferir usar o terminal, crie o repositório e execute nesta pasta:

```bash
git init
git add .
git commit -m "Nosso cantinho ❤️"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/rafael-e-laura.git
git push -u origin main
```

Depois ative o GitHub Pages nas configurações como descrito acima.

## Adicionar suas fotos

Coloque suas fotos reais na pasta `fotos` com os nomes **exatos** abaixo:

- `fotos/01.jpg` — Nosso começo
- `fotos/02.jpg` — De mãos dadas
- `fotos/03.jpg` — Nossas aventuras
- `fotos/04.jpg` — O que vem pela frente

Ao enviar essas imagens ao GitHub, elas substituem automaticamente as ilustrações da galeria. Use JPG, sem trocar as extensões para PNG ou HEIC. Em iPhones, se suas fotos estiverem em HEIC, converta para JPG antes de enviar.

## Personalizar

- **Nomes, textos, história e carta:** altere `index.html`.
- **Data de início:** altere `START_DATE` no começo de `script.js` — os meses usam índice começando em zero (`10` é novembro).
- **Lista e nomes das bodas:** altere `MONTHS` em `script.js`.
- **Cores e visual:** altere `:root` no começo de `style.css`.

## Importante sobre privacidade

Um site publicado no GitHub Pages normalmente é **público**: qualquer pessoa com o endereço poderá visitar, e o conteúdo pode ser encontrado na internet. Não publique telefones, endereços ou fotos íntimas. O site não salva ou sincroniza dados pessoais e não possui login.

## Pré-visualizar no computador

Abra `index.html` no navegador. Para testar com servidor local:

```bash
python -m http.server 8000
```

Acesse http://localhost:8000.
