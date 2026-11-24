# Rafael & Laura — Álbum digital

## O que o pacote adiciona

- `album.html` — página de álbum, acessível em `/rafael-e-laura/album.html`
- `album.css` — visual responsivo para celular e computador
- `album.js` — visualização pública, autenticação, cadastro, edição e exclusão de memórias, imagens múltiplas com ampliação
- `supabase-config.js` — onde configurar URL e chave pública do Supabase
- `supabase.sql` — banco, RLS e Storage; leitura pública e gravação limitada aos administradores autorizados

**IMPORTANTE**: não substitua os arquivos `index.html`, `script.js`, `style.css` ou a pasta `fotos` atuais. Eles continuarão funcionando. O álbum exibe as quatro fotos existentes e guardará novas memórias no Supabase.

## 1. Subir arquivos no GitHub

Abra https://github.com/dossantosrafa/rafael-e-laura e use **Add file > Upload files**. Envie estes arquivos na RAIZ do repositório: `album.html`, `album.css`, `album.js`, `supabase-config.js`. O `supabase.sql` e este README podem ser enviados também, mas não são necessários no site.

O álbum terá o link:
https://dossantosrafa.github.io/rafael-e-laura/album.html

## 2. Criar Supabase

1. Abra https://supabase.com/dashboard e crie um projeto novo.
2. No menu **SQL Editor**, abra uma consulta e cole TODO o conteúdo de `supabase.sql`, depois execute.
3. Em **Authentication > Providers**, mantenha a autenticação por Email habilitada. Para evitar novos cadastros públicos, desative a opção de permitir criação de novas contas por usuários, se disponível na versão atual do painel. O site NÃO oferece botão de cadastro.
4. Em **Authentication > Users**, crie dois usuários, um para Rafael e outro para Laura, com e-mails e senhas INDIVIDUAIS. Copie o UUID de cada usuário. Para contas criadas pelo painel, use a opção de confirmar e-mail quando disponível.
5. Volte ao SQL Editor e execute (substitua os UUIDs pelos valores reais):

```sql
insert into public.album_admins(user_id) values
  ('UUID-DO-RAFAEL'),
  ('UUID-DA-LAURA')
on conflict do nothing;
```

6. Em **Project Settings > API Keys** (o nome do menu pode variar), copie apenas a **Publishable key** (ou **anon** legacy); copie também o **Project URL**. Nunca use chave `service_role` nem `sb_secret_...`.
7. No GitHub, edite `supabase-config.js` pelo ícone de lápis e preencha `url` e `anonKey`, salvando com **Commit changes**.

Exemplo (valores fictícios):

```js
window.ALBUM_SUPABASE = {
  url: 'https://exemplo.supabase.co',
  anonKey: 'sb_publishable_EXEMPLO'
};
```

8. Confira em **Authentication > URL Configuration** a URL do site (Site URL: `https://dossantosrafa.github.io/rafael-e-laura/`). Para login por senha não é necessário um redirect especial, mas configure o URL corretamente se futuramente usar recuperação de senha ou confirmação por link.
9. Depois do deploy do GitHub Pages, abra `/album.html` e faça login com uma das duas contas. O botão **+ Nova lembrança** deve aparecer.

## 3. Colocar um botão na página inicial (opcional)

Edite o `index.html` atual. Na seção de botões da capa, junto ao link `Nossa história`, adicione:

```html
<a class="button button-primary" href="album.html">Nosso álbum de memórias ♡</a>
```

Isso mantém intactas todas as seções do site anterior.

## 4. Como usar pelo celular

Abra o mesmo link em iPhone ou Android. Toque em **Entrar**, faça login e depois em **+ Nova lembrança**. Dê título, data, escreva a história e selecione até seis fotos. Toque em **Salvar nossa lembrança**. As memórias ficam disponíveis em outros aparelhos e podem ser editadas ou excluídas pelos dois administradores.

## Observações de segurança e armazenamento

- **O álbum é público para visualização**. Qualquer visitante com o link verá fotos, datas e textos. Somente as duas contas autorizadas podem alterar.
- Não coloque segredos ou dados íntimos no álbum. O repositório GitHub é público, e as quatro fotos atuais também.
- A chave publishable/anon é pública por design: quem protege o banco é o conjunto de políticas RLS do SQL. **Não publique chave secreta**, nem senha de usuário.
- Os dados novos ficam no projeto Supabase, não no GitHub; faça backup/exportação periódica dos dados e imagens. Apagar a conta/projeto Supabase pode apagar as novas memórias.
- O plano gratuito do Supabase tem limites, inclusive de armazenamento, transferência e disponibilidade. Consulte as condições atuais antes de guardar muitos arquivos.
- Se uma foto não carregar, teste se o link público está acessível. O site converte fotos selecionadas em JPEG otimizado antes do upload; HEIC diretamente não é aceito. No iPhone, exporte em JPEG se necessário.
- Se o login funcionar mas o botão de edição não aparecer, revise os UUIDs em `album_admins`.
- Se a página mostrar erro de banco, confirme que `supabase.sql` foi executado com sucesso.
