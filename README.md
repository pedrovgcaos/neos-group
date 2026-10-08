# Neos Group — Site institucional (EN / ES) + painel admin

Site renderizado no servidor (bom para SEO) com painel de edição em `/admin`.
Feito em Node.js puro. Localmente não precisa de `npm install` (a única dependência, `@vercel/blob`, só é usada na Vercel).

## Rodar localmente

Requisito: Node.js 20 ou superior.

```bash
npm start
```

- Site em inglês: http://localhost:3000/
- Site em espanhol: http://localhost:3000/es/
- Painel: http://localhost:3000/admin/

Na primeira execução o servidor cria a pasta `data/` e gera uma senha aleatória para o painel,
mostrada no terminal e salva em `data/admin-password.txt`. Troque a senha em **Painel → Senha de acesso**
(o arquivo é apagado automaticamente quando você troca).

Para definir a senha inicial você mesmo: `ADMIN_PASSWORD=suasenha npm start`.

## O que o painel edita

| Área | O que dá para fazer |
|---|---|
| Páginas | Reordenar seções (arrastar ou ↑ ↓), ligar/desligar, duplicar, excluir, adicionar novas seções (17 tipos), criar/duplicar páginas, SEO por página |
| Textos | Todos os textos em EN e ES lado a lado |
| Imagens | Upload ou URL em qualquer campo de imagem: logo do cabeçalho, logo do rodapé, **logo do hero**, imagem de fundo do hero, imagens dos produtos, galerias, favicon, imagem de compartilhamento |
| Botões | Texto EN/ES, **hiperlink**, estilo e abrir em nova aba, em todos os botões (inclusive o do cabeçalho) |
| Menu e rodapé | Itens do menu e submenu, links rápidos, textos e newsletter do rodapé, copyright |
| Contato | E-mail, telefone, endereço e link do mapa (usados no rodapé, formulários e cartões) |
| Cores | Azul escuro, azul da marca, azul água e cor dos botões principais |
| Rastreamento | ID do Google Tag Manager e nome do evento do dataLayer |
| Leads | Todos os envios dos formulários, com exportação CSV (abre no Excel) e exclusão |
| Histórico | Backup automático a cada salvamento (últimos 40), com botão de restaurar |

Links internos começando com `/` viram automaticamente `/es/...` quando o visitante está em espanhol.

## dataLayer (formulários)

Ao clicar no botão de envio de qualquer formulário (contato, cotação e newsletter), com o formulário válido:

```js
dataLayer.push({
  event: 'form_submit',          // configurável em Painel → Rastreamento
  form_name: 'home_contact',     // configurável por formulário (home_contact, request_a_quote, newsletter)
  form_type: 'contact',          // 'contact' ou 'newsletter'
  form_id: 'home_contact',
  page_path: '/es/',
  page_language: 'es'
});
```

Depois da resposta do servidor dispara também `form_submit_success` ou `form_submit_error` (mesmos campos).
Nenhum dado pessoal (nome, e-mail, telefone) vai para o dataLayer.

No GTM: crie um acionador "Evento personalizado" com o nome `form_submit` (clique) ou `form_submit_success`
(conversão confirmada) e variáveis de camada de dados para `form_name` e `page_language`.

## Para onde vão os formulários

Cada envio é salvo (pasta `data/leads/` local ou no Blob na Vercel) e aparece em **Painel → Leads**. Para receber também por e-mail ou
CRM, configure um webhook em **Painel → Formulários** (Zapier, Make, n8n, HubSpot etc.) — o lead é enviado
por POST em JSON.

## Publicação na Vercel (configuração atual)

- Site: https://neos-group-lyart.vercel.app (painel em `/admin/`)
- Repositório: https://github.com/pedrooliveira-m2z/neos-group
- Projeto Vercel: `neos-group` (time PEDRO M2Z), Blob store privado `neos-group-blob`

O repositório já está pronto para a Vercel:

- `api/index.js` — todas as rotas passam por uma função Node (`server.js`)
- `vercel.json` — `/assets` sai direto da CDN; o resto vai para a função
- **Armazenamento:** a Vercel não tem disco permanente, então conteúdo, leads, backups, senha e imagens
  enviadas ficam num **Vercel Blob privado** (ligado automaticamente quando existe `BLOB_READ_WRITE_TOKEN`).
  As imagens enviadas são servidas pelo próprio site em `/uploads/...` com cache longo na CDN.
- Cada `git push` na branch principal publica uma nova versão.

Variáveis de ambiente no projeto da Vercel:

| Variável | Uso |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Criada automaticamente ao conectar o Blob store ao projeto |
| `ADMIN_PASSWORD` | Senha inicial do painel (obrigatória na Vercel). Depois de trocar a senha pelo painel, ela deixa de ser usada |
| `ADMIN_PASSWORD_RESET` | Opcional: com valor `1`, volta a senha para `ADMIN_PASSWORD` (use só para recuperar acesso e remova depois) |
| `SITE_URL` | Domínio final, ex. `https://neosindustrialsolutions.com` (canonical, hreflang e sitemap) |

Observações:
- As páginas ficam ~10 s em cache na CDN; alterações salvas no painel aparecem no site em até ~1 minuto.
- Fotos enviadas pelo painel são reduzidas no navegador (lado maior até 2400 px) por causa do limite de 4,5 MB por requisição da Vercel.
- Domínio próprio: Vercel → projeto → Settings → Domains.

## Publicação em VPS (alternativa)

Também roda como servidor Node comum (`npm start`) com a pasta `data/` em disco persistente
(VPS, Render, Railway…). Variáveis: `PORT`, `DATA_DIR`, `ADMIN_PASSWORD`, `SITE_URL`. Use um proxy com HTTPS
(Nginx/Caddy) e `pm2` ou `systemd` para manter o processo no ar.

`/sitemap.xml` e `/robots.txt` são gerados automaticamente (o painel fica fora da indexação).

## Estrutura

```
server.js            servidor HTTP, API do painel, leads, uploads, backups
api/index.js         entrada da função na Vercel
vercel.json          rotas e cache na Vercel
lib/storage.js       armazenamento: pasta data/ (local) ou Vercel Blob privado
lib/seed.js          conteúdo inicial (copy EN + tradução ES)
lib/schemas.js       define os campos editáveis de cada tipo de seção (o painel é gerado daqui)
lib/render.js        HTML das páginas
lib/icons.js         ícones de linha
public/assets/       CSS, JS e imagens do site
admin/               painel (HTML/CSS/JS)
data/                criado na primeira execução — NÃO versionar
```

## Pendências antes de publicar

1. **Fotos**: o site de referência não tem fotos acessíveis (os arquivos `images/*.jpg` retornam 404).
   Sem foto, produtos e topos de página mostram uma ilustração técnica; galerias ficam ocultas até receberem imagens.
   Envie as fotos pelo painel.
2. **Número de tanques**: a Home diz 1000+ e a página de tanques diz 5000+ (mantido como na copy). Confirmar.
3. **Dados técnicos**: confirmar 80% de secagem da torta, capacidades/temperaturas dos tanques, normas, passivados e RoHS/REACH.
4. **Endereço**: está "Dallas, Texas". Atualizar em **Painel → Contato** quando definido.
5. **Blog**: estava no menu da copy, mas não há conteúdo — ficou fora do menu. Dá para adicionar o item depois.
6. **Trabalhe conosco**: botão aponta para `mailto:sales@...?subject=Careers`. Trocar se houver e-mail/página de RH.
7. **Tradução ES**: feita a partir da copy em inglês — vale uma revisão de um nativo.
8. **Logos dos clientes**: aparecem como texto; envie os logos (SVG/PNG) em **Home → Logos de clientes**.
9. **Data no copyright**: "© 2026" está fixo no texto do rodapé.
