// Esquemas que descrevem cada tipo de seção e as configurações globais.
// O painel admin monta os formulários a partir daqui; o servidor usa para criar seções novas.
//
// Tipos de campo:
//   text      texto simples (não traduzido)        url     link / href
//   i18n      texto curto EN + ES                   i18nText texto longo EN + ES (parágrafos separados por linha em branco)
//   lines     lista EN + ES, um item por linha      table   tabela EN + ES, células separadas por "|", 1ª linha = cabeçalho
//   image     imagem (upload ou URL)                button  { label{en,es}, href, style, newTab }
//   buttons   lista de botões                       list    lista de objetos (fields)
//   object    grupo de campos (fields)              select  opções fixas (options)
//   bool      liga/desliga                          color   cor hex
//   icon      ícone da biblioteca
(function (root, factory) {
  const s = factory();
  if (typeof module === 'object' && module.exports) module.exports = s;
  else root.NEOS_SCHEMAS = s;
})(typeof self !== 'undefined' ? self : this, function () {
  const I = (key, label, extra) => Object.assign({ key, type: 'i18n', label }, extra);
  const IT = (key, label, extra) => Object.assign({ key, type: 'i18nText', label }, extra);

  const base = [
    { key: 'anchor', type: 'text', label: 'Âncora (id)', help: 'Usado em links como /#contact. Sem espaços.' },
    { key: 'theme', type: 'select', label: 'Fundo da seção', options: [['white', 'Branco'], ['light', 'Cinza claro'], ['dark', 'Azul escuro']] },
  ];
  const head = [I('eyebrow', 'Texto de apoio acima do título'), I('title', 'Título'), IT('text', 'Texto de introdução')];

  const types = {
    hero: {
      label: 'Hero (topo da home)',
      summary: 'title',
      fields: [
        ...base,
        { key: 'heroLogo', type: 'image', label: 'Logo do hero', help: 'Opcional. Aparece acima do título.' },
        ...head,
        { key: 'buttons', type: 'buttons', label: 'Botões' },
        { key: 'background', type: 'image', label: 'Imagem de fundo', help: 'Opcional. Recebe uma camada azul por cima para manter a leitura.' },
        { key: 'showDiagram', type: 'bool', label: 'Mostrar diagrama animado do processo' },
        { key: 'diagramLabels', type: 'lines', label: 'Legendas do diagrama (5 linhas)' },
      ],
      defaults: { theme: 'dark', showDiagram: true },
    },
    pageHero: {
      label: 'Topo de página interna',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'buttons', type: 'buttons', label: 'Botões' },
        { key: 'image', type: 'image', label: 'Imagem lateral', help: 'Sem imagem, mostra o ícone abaixo como ilustração.' },
        { key: 'icon', type: 'icon', label: 'Ícone (quando não há imagem)' },
        { key: 'compact', type: 'bool', label: 'Versão compacta (sem ilustração)' },
      ],
      defaults: { theme: 'dark', icon: 'factory' },
    },
    logos: {
      label: 'Logos de clientes',
      summary: 'title',
      fields: [
        ...base, I('title', 'Título'),
        { key: 'items', type: 'list', label: 'Clientes', itemLabel: 'name', fields: [
          { key: 'name', type: 'text', label: 'Nome' },
          { key: 'image', type: 'image', label: 'Logo (opcional — sem logo, mostra o nome)' },
          { key: 'url', type: 'url', label: 'Link (opcional)' },
        ] },
      ],
      defaults: { theme: 'white', items: [] },
    },
    products: {
      label: 'Produtos (lista com imagens)',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'items', type: 'list', label: 'Produtos', itemLabel: 'title', fields: [
          I('title', 'Nome do produto'), IT('text', 'Descrição curta'),
          { key: 'image', type: 'image', label: 'Imagem' },
          { key: 'icon', type: 'icon', label: 'Ícone (quando não há imagem)' },
          { key: 'button', type: 'button', label: 'Botão' },
        ] },
      ],
      defaults: { theme: 'light', items: [] },
    },
    features: {
      label: 'Diferenciais / benefícios (ícones)',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'items', type: 'list', label: 'Itens', itemLabel: 'title', fields: [
          { key: 'icon', type: 'icon', label: 'Ícone' }, I('title', 'Título'), IT('text', 'Texto'),
        ] },
      ],
      defaults: { theme: 'white', items: [] },
    },
    richText: {
      label: 'Texto + imagem',
      summary: 'title',
      fields: [
        ...base, I('eyebrow', 'Texto de apoio acima do título'), I('title', 'Título'), IT('text', 'Parágrafos'),
        { key: 'image', type: 'image', label: 'Imagem (opcional)' },
        I('imageCaption', 'Legenda da imagem'),
        { key: 'reverse', type: 'bool', label: 'Imagem à esquerda' },
        { key: 'metrics', type: 'list', label: 'Números em destaque (opcional)', itemLabel: 'value', fields: [
          { key: 'value', type: 'text', label: 'Número (ex.: 25+)' }, I('label', 'Legenda'),
        ] },
      ],
      defaults: { theme: 'white', metrics: [] },
    },
    systems: {
      label: 'Sistemas / tipos (blocos detalhados)',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'items', type: 'list', label: 'Blocos', itemLabel: 'title', fields: [
          I('title', 'Título'), IT('text', 'Texto'),
          { key: 'lists', type: 'list', label: 'Listas', itemLabel: 'label', fields: [
            I('label', 'Título da lista (opcional)'), { key: 'items', type: 'lines', label: 'Itens (um por linha)' },
          ] },
          { key: 'images', type: 'list', label: 'Galeria de imagens', itemLabel: 'caption', fields: [
            { key: 'src', type: 'image', label: 'Imagem' }, I('caption', 'Legenda'),
          ] },
          { key: 'button', type: 'button', label: 'Botão (opcional)' },
        ] },
      ],
      defaults: { theme: 'light', items: [] },
    },
    table: {
      label: 'Tabela (comparativo / especificações)',
      summary: 'title',
      fields: [...base, ...head, { key: 'table', type: 'table', label: 'Tabela' }],
      defaults: { theme: 'white', table: { en: 'Column A | Column B\nValue | Value', es: 'Columna A | Columna B\nValor | Valor' } },
    },
    steps: {
      label: 'Etapas do processo (numeradas)',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'items', type: 'list', label: 'Etapas', itemLabel: 'title', fields: [I('title', 'Título'), IT('text', 'Texto')] },
      ],
      defaults: { theme: 'light', items: [] },
    },
    details: {
      label: 'Lista de itens com descrição',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'items', type: 'list', label: 'Itens', itemLabel: 'title', fields: [I('title', 'Título'), IT('text', 'Texto')] },
      ],
      defaults: { theme: 'white', items: [] },
    },
    applications: {
      label: 'Aplicações (grupos de lista)',
      summary: 'title',
      fields: [
        ...base, ...head,
        { key: 'groups', type: 'list', label: 'Grupos', itemLabel: 'title', fields: [I('title', 'Título'), { key: 'items', type: 'lines', label: 'Itens (um por linha)' }] },
      ],
      defaults: { theme: 'white', groups: [] },
    },
    gallery: {
      label: 'Galeria de imagens',
      summary: 'title',
      help: 'A seção só aparece no site quando tiver pelo menos uma imagem.',
      fields: [
        ...base, ...head,
        { key: 'images', type: 'list', label: 'Imagens', itemLabel: 'caption', fields: [{ key: 'src', type: 'image', label: 'Imagem' }, I('caption', 'Legenda')] },
      ],
      defaults: { theme: 'white', images: [] },
    },
    metrics: {
      label: 'Números (contador animado)',
      summary: 'title',
      fields: [
        ...base, I('eyebrow', 'Texto de apoio acima do título'), I('title', 'Título'),
        { key: 'items', type: 'list', label: 'Números', itemLabel: 'value', fields: [{ key: 'value', type: 'text', label: 'Número (ex.: 1000+)' }, I('label', 'Legenda')] },
      ],
      defaults: { theme: 'dark', items: [] },
    },
    mvv: {
      label: 'Missão, visão e valores',
      summary: 'title',
      fields: [
        ...base, I('title', 'Título'), IT('text', 'Introdução'),
        I('missionTitle', 'Título — Missão'), IT('mission', 'Missão'),
        I('visionTitle', 'Título — Visão'), IT('vision', 'Visão'),
        I('valuesTitle', 'Título — Valores'),
        { key: 'values', type: 'list', label: 'Valores', itemLabel: 'title', fields: [I('title', 'Valor'), IT('text', 'Descrição')] },
      ],
      defaults: { theme: 'light', values: [] },
    },
    cta: {
      label: 'Chamada para ação (faixa)',
      summary: 'title',
      fields: [...base, ...head, { key: 'buttons', type: 'buttons', label: 'Botões' }],
      defaults: { theme: 'dark', buttons: [] },
    },
    contact: {
      label: 'Formulário de contato',
      summary: 'title',
      help: 'Os rótulos dos campos ficam em Configurações > Formulários. Ao clicar em enviar, o site faz um dataLayer.push.',
      fields: [
        ...base, ...head,
        { key: 'formName', type: 'text', label: 'Nome do formulário (enviado no dataLayer)', help: 'Ex.: home_contact. Use letras minúsculas e _.' },
        I('submitLabel', 'Texto do botão de envio'),
        { key: 'showAside', type: 'bool', label: 'Mostrar quadro lateral de contato rápido' },
        I('asideTitle', 'Quadro lateral — título'), IT('asideText', 'Quadro lateral — texto'),
        { key: 'asideButton', type: 'button', label: 'Quadro lateral — botão' },
      ],
      defaults: { theme: 'light', formName: 'contact_form', showAside: true },
    },
    contactCards: {
      label: 'Cartões de contato (telefone, e-mail, endereço)',
      summary: 'title',
      help: 'Os dados (telefone, e-mail, endereço) vêm de Configurações > Contato.',
      fields: [
        ...base, I('title', 'Título'),
        { key: 'cards', type: 'list', label: 'Cartões', itemLabel: 'title', fields: [
          { key: 'kind', type: 'select', label: 'Tipo', options: [['phone', 'Telefone'], ['email', 'E-mail'], ['address', 'Endereço']] },
          I('title', 'Título'), I('buttonLabel', 'Texto do botão'),
        ] },
      ],
      defaults: { theme: 'white', cards: [] },
    },
  };

  const settings = [
    { key: 'brand', type: 'object', label: 'Marca e identidade', fields: [
      { key: 'siteName', type: 'text', label: 'Nome do site' },
      { key: 'logo', type: 'image', label: 'Logo do cabeçalho' },
      { key: 'logoLight', type: 'image', label: 'Logo do rodapé (versão clara)' },
      { key: 'favicon', type: 'image', label: 'Favicon', help: 'PNG ou SVG quadrado, mínimo 64×64.' },
      { key: 'colorNavy', type: 'color', label: 'Cor — azul escuro (fundos)' },
      { key: 'colorBrand', type: 'color', label: 'Cor — azul da marca' },
      { key: 'colorFlow', type: 'color', label: 'Cor — azul água (destaques e diagrama)' },
      { key: 'colorAccent', type: 'color', label: 'Cor — botões principais' },
    ] },
    { key: 'contact', type: 'object', label: 'Contato', fields: [
      { key: 'email', type: 'text', label: 'E-mail' },
      { key: 'phone', type: 'text', label: 'Telefone (como aparece no site)' },
      { key: 'phoneHref', type: 'url', label: 'Link do telefone', help: 'Formato tel:+16824703573' },
      I('address', 'Endereço'),
      { key: 'mapUrl', type: 'url', label: 'Link do mapa' },
    ] },
    { key: 'header', type: 'object', label: 'Cabeçalho e menu', fields: [
      { key: 'nav', type: 'list', label: 'Itens do menu', itemLabel: 'label', fields: [
        I('label', 'Texto'), { key: 'href', type: 'url', label: 'Link' },
        { key: 'children', type: 'list', label: 'Submenu', itemLabel: 'label', fields: [I('label', 'Texto'), { key: 'href', type: 'url', label: 'Link' }] },
      ] },
      { key: 'cta', type: 'button', label: 'Botão do cabeçalho' },
      { key: 'showLanguageSwitch', type: 'bool', label: 'Mostrar seletor de idioma EN / ES' },
    ] },
    { key: 'footer', type: 'object', label: 'Rodapé', fields: [
      IT('tagline', 'Frase abaixo do logo'),
      I('quickLinksTitle', 'Título — links rápidos'),
      { key: 'quickLinks', type: 'list', label: 'Links rápidos', itemLabel: 'label', fields: [I('label', 'Texto'), { key: 'href', type: 'url', label: 'Link' }] },
      I('contactTitle', 'Título — contato'),
      I('mapLabel', 'Texto do botão do mapa'), I('callLabel', 'Texto do botão de ligar'), I('emailLabel', 'Texto do botão de e-mail'),
      { key: 'newsletter', type: 'object', label: 'Newsletter', fields: [
        { key: 'show', type: 'bool', label: 'Mostrar newsletter' },
        I('title', 'Título'), IT('text', 'Texto'), I('placeholder', 'Texto do campo'), I('button', 'Texto do botão'), I('success', 'Mensagem de sucesso'),
      ] },
      I('legal', 'Texto legal / copyright'),
    ] },
    { key: 'forms', type: 'object', label: 'Formulários', fields: [
      { key: 'labels', type: 'object', label: 'Rótulos dos campos', fields: [
        I('name', 'Nome'), I('email', 'E-mail'), I('phone', 'Telefone'), I('state', 'Estado'), I('city', 'Cidade'), I('company', 'Empresa'), I('message', 'Mensagem'),
      ] },
      I('requiredNote', 'Aviso de campos obrigatórios'),
      I('sending', 'Texto durante o envio'),
      IT('success', 'Mensagem de sucesso'), IT('error', 'Mensagem de erro'), IT('invalid', 'Mensagem de campos inválidos'),
      { key: 'webhookUrl', type: 'url', label: 'Webhook (opcional)', help: 'Cada lead também é enviado por POST (JSON) para esta URL — ex.: Zapier, Make, n8n, HubSpot.' },
    ] },
    { key: 'tracking', type: 'object', label: 'Rastreamento (GTM / dataLayer)', fields: [
      { key: 'gtmId', type: 'text', label: 'ID do Google Tag Manager', help: 'Ex.: GTM-XXXXXXX. Vazio = GTM desativado (o dataLayer.push continua funcionando).' },
      { key: 'dataLayerEvent', type: 'text', label: 'Nome do evento no dataLayer', help: 'Disparado no clique do botão de envio (formulário válido). Após o envio com sucesso dispara também "<evento>_success".' },
    ] },
    { key: 'seo', type: 'object', label: 'SEO', fields: [
      { key: 'titleSuffix', type: 'text', label: 'Sufixo do título das páginas' },
      IT('description', 'Descrição padrão'),
      { key: 'ogImage', type: 'image', label: 'Imagem de compartilhamento (1200×630)' },
    ] },
    { key: 'ui', type: 'object', label: 'Textos gerais da interface', fields: [
      I('learnMore', 'Texto "Saiba mais"'), I('menu', 'Texto do botão de menu (celular)'),
      I('notFoundTitle', 'Página 404 — título'), IT('notFoundText', 'Página 404 — texto'), I('backHome', 'Página 404 — botão'),
    ] },
  ];

  const page = [
    { key: 'name', type: 'text', label: 'Nome interno da página' },
    { key: 'slug', type: 'text', label: 'Endereço (slug)', help: 'Vazio = página inicial. Ex.: filter-press → /filter-press e /es/filter-press' },
    { key: 'seo', type: 'object', label: 'SEO da página', fields: [I('title', 'Título (aba do navegador / Google)'), IT('description', 'Descrição (Google)')] },
  ];

  return { types, settings, page };
});
