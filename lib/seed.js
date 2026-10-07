// Conteúdo inicial do site (EN + ES). Usado para criar data/content.json na primeira execução
// e pelo botão "Restaurar conteúdo padrão" do painel.

const T = (en, es) => ({ en, es });
const btn = (en, es, href, style = 'primary') => ({ label: T(en, es), href, style, newTab: false });
const QUOTE = () => btn('Request a Quote', 'Solicitar cotización', '/request-a-quote');

function build() {
  let n = 0;
  const S = (page, type, data, enabled = true) => ({ id: `${page}-${type}-${(++n).toString(36)}`, type, enabled, data });

  const cta = (page, en, es) => S(page, 'cta', {
    anchor: 'quote', theme: 'dark',
    eyebrow: T('', ''),
    title: T('Request a Quote', 'Solicite una cotización'),
    text: T(en, es),
    buttons: [QUOTE()],
  });

  const settings = {
    brand: {
      siteName: 'Neos Group',
      logo: '/assets/img/logo.png',
      logoLight: '/assets/img/logo-white.png',
      favicon: '/assets/img/favicon.svg',
      colorNavy: '#0C1E35',
      colorBrand: '#24508A',
      colorFlow: '#46B3E0',
      colorAccent: '#F2B705',
    },
    contact: {
      email: 'sales@neosindustrialsolutions.com',
      phone: '+1 (682) 470-3573',
      phoneHref: 'tel:+16824703573',
      address: T('Dallas, Texas', 'Dallas, Texas, EE. UU.'),
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dallas%2C+Texas',
    },
    header: {
      nav: [
        { label: T('Home', 'Inicio'), href: '/', children: [] },
        {
          label: T('Products', 'Productos'), href: '/#products', children: [
            { label: T('Effluent Treatment Stations', 'Estaciones de tratamiento de efluentes'), href: '/wastewater-treatment' },
            { label: T('Polypropylene Tanks', 'Tanques de polipropileno'), href: '/polypropylene-tanks' },
            { label: T('Filter Press', 'Filtro prensa'), href: '/filter-press' },
            { label: T('Electrolytic Galvanizing Lines', 'Líneas de galvanizado electrolítico'), href: '/electrolytic-galvanizing' },
            { label: T('Chrome Plating Lines', 'Líneas de cromado'), href: '/chrome-plating-line' },
          ],
        },
        { label: T('About Us', 'Nosotros'), href: '/about', children: [] },
        { label: T('Contact', 'Contacto'), href: '/#contact', children: [] },
        { label: T('Work with us', 'Trabaje con nosotros'), href: '/about#careers', children: [] },
      ],
      cta: btn('Request Quote', 'Solicitar cotización', '/request-a-quote'),
      showLanguageSwitch: true,
    },
    footer: {
      tagline: T('Industrial wastewater treatment and electroplating equipment.', 'Tratamiento de aguas residuales industriales y equipos de galvanoplastia.'),
      quickLinksTitle: T('Quick Links', 'Enlaces rápidos'),
      quickLinks: [
        { label: T('Home', 'Inicio'), href: '/' },
        { label: T('About Us', 'Nosotros'), href: '/about' },
        { label: T('Treatment Stations', 'Estaciones de tratamiento'), href: '/wastewater-treatment' },
        { label: T('Filter Press', 'Filtro prensa'), href: '/filter-press' },
        { label: T('Polypropylene Tanks', 'Tanques de polipropileno'), href: '/polypropylene-tanks' },
        { label: T('Request a Quote', 'Solicitar cotización'), href: '/request-a-quote' },
      ],
      contactTitle: T('Contact', 'Contacto'),
      mapLabel: T('View on map', 'Ver en el mapa'),
      callLabel: T('Call now', 'Llamar ahora'),
      emailLabel: T('Send email', 'Enviar correo'),
      newsletter: {
        show: true,
        title: T('Newsletter', 'Boletín'),
        text: T('Get company updates and articles by email.', 'Reciba novedades de la empresa y artículos por correo electrónico.'),
        placeholder: T('Email address', 'Correo electrónico'),
        button: T('Subscribe', 'Suscribirse'),
        success: T('Thanks! You are subscribed.', '¡Gracias! Su suscripción fue registrada.'),
      },
      legal: T('© 2026 Neos Group. All rights reserved.', '© 2026 Neos Group. Todos los derechos reservados.'),
    },
    forms: {
      labels: {
        name: T('Name', 'Nombre'),
        email: T('Email', 'Correo electrónico'),
        phone: T('Phone', 'Teléfono'),
        state: T('State', 'Estado'),
        city: T('City', 'Ciudad'),
        company: T('Company', 'Empresa'),
        message: T('Message', 'Mensaje'),
      },
      requiredNote: T('Name, email, and message are required.', 'Nombre, correo electrónico y mensaje son obligatorios.'),
      sending: T('Sending…', 'Enviando…'),
      success: T('Thanks — your message was sent. Our team will follow up shortly.', 'Gracias, su mensaje fue enviado. Nuestro equipo se comunicará con usted en breve.'),
      error: T('The message could not be sent. Check your connection and try again, or email us directly.', 'No fue posible enviar el mensaje. Revise su conexión e inténtelo de nuevo, o escríbanos directamente.'),
      invalid: T('Fill in the required fields with a valid email address.', 'Complete los campos obligatorios con un correo electrónico válido.'),
      webhookUrl: '',
    },
    tracking: {
      gtmId: '',
      dataLayerEvent: 'form_submit',
    },
    seo: {
      titleSuffix: ' | Neos Group',
      description: T(
        'Industrial wastewater treatment systems, filter presses, polypropylene tanks, and electroplating lines built around your operation.',
        'Sistemas de tratamiento de aguas residuales industriales, filtros prensa, tanques de polipropileno y líneas de galvanoplastia diseñados para su operación.'
      ),
      ogImage: '',
    },
    ui: {
      learnMore: T('Learn more', 'Ver más'),
      menu: T('Menu', 'Menú'),
      notFoundTitle: T('Page not found', 'Página no encontrada'),
      notFoundText: T('The page you are looking for does not exist or was moved.', 'La página que busca no existe o fue movida.'),
      backHome: T('Back to home', 'Volver al inicio'),
    },
  };

  const home = {
    id: 'home', name: 'Home', slug: '',
    seo: {
      title: T('Industrial Wastewater Treatment & Process Equipment', 'Tratamiento de aguas residuales industriales y equipos de proceso'),
      description: T('', ''),
    },
    sections: [
      S('home', 'hero', {
        anchor: 'top', theme: 'dark',
        eyebrow: T('', ''),
        title: T('Industrial wastewater treatment and process equipment built around your operation.', 'Tratamiento de aguas residuales industriales y equipos de proceso diseñados en torno a su operación.'),
        text: T(
          'For more than 25 years, Neos Group has designed wastewater treatment systems, filter presses, polypropylene tanks, and electroplating lines for industrial manufacturers.',
          'Desde hace más de 25 años, Neos Group diseña sistemas de tratamiento de aguas residuales, filtros prensa, tanques de polipropileno y líneas de galvanoplastia para fabricantes industriales.'
        ),
        buttons: [QUOTE(), btn('Explore Our Products', 'Conozca nuestros productos', '#products', 'secondary')],
        heroLogo: '',
        background: '',
        showDiagram: true,
        diagramLabels: T('Equalization\nReaction\nClarification\nFilter press\nTreated water', 'Ecualización\nReacción\nClarificación\nFiltro prensa\nAgua tratada'),
      }),
      S('home', 'logos', {
        anchor: 'clients', theme: 'white',
        title: T('Trusted by Industrial Brands', 'Marcas industriales que confían en nosotros'),
        items: ['Copacol', 'BENTELER', 'FACCHINI', 'RANDON', 'ERZINGER', 'MAHLE'].map((name) => ({ name, image: '', url: '' })),
      }),
      S('home', 'products', {
        anchor: 'products', theme: 'light',
        eyebrow: T('', ''),
        title: T('Explore Our Products', 'Conozca nuestros productos'),
        text: T('', ''),
        items: [
          {
            title: T('Effluent Treatment Stations', 'Estaciones de tratamiento de efluentes'),
            text: T('Batch and continuous treatment systems designed for your wastewater stream, operating volume, and discharge requirements.', 'Sistemas de tratamiento por lotes y continuos diseñados para su efluente, su volumen de operación y sus requisitos de descarga.'),
            image: '', icon: 'water',
            button: btn('Learn more', 'Ver más', '/wastewater-treatment', 'link'),
          },
          {
            title: T('Polypropylene Tanks', 'Tanques de polipropileno'),
            text: T('Custom polypropylene tanks for chemical storage, process applications, industrial wastewater, and treated water.', 'Tanques de polipropileno a medida para almacenamiento de químicos, aplicaciones de proceso, aguas residuales industriales y agua tratada.'),
            image: '', icon: 'tank',
            button: btn('Learn more', 'Ver más', '/polypropylene-tanks', 'link'),
          },
          {
            title: T('Filter Press', 'Filtro prensa'),
            text: T('Filter presses for industrial sludge dewatering and solid-liquid separation, configured for your process.', 'Filtros prensa para deshidratación de lodos industriales y separación sólido-líquido, configurados para su proceso.'),
            image: '', icon: 'filter',
            button: btn('Learn more', 'Ver más', '/filter-press', 'link'),
          },
          {
            title: T('Electrolytic Galvanizing Lines', 'Líneas de galvanizado electrolítico'),
            text: T('Zinc electroplating for metal components, with corrosion protection and a consistent finish.', 'Cincado electrolítico para componentes metálicos, con protección contra la corrosión y un acabado uniforme.'),
            image: '', icon: 'layers',
            button: btn('Learn more', 'Ver más', '/electrolytic-galvanizing', 'link'),
          },
          {
            title: T('Chrome Plating Lines', 'Líneas de cromado'),
            text: T('Chrome plating lines configured for industrial throughput, finish quality, and process control.', 'Líneas de cromado configuradas para la producción industrial, la calidad del acabado y el control del proceso.'),
            image: '', icon: 'spark',
            button: btn('Learn more', 'Ver más', '/chrome-plating-line', 'link'),
          },
        ],
      }),
      S('home', 'features', {
        anchor: 'why', theme: 'white',
        eyebrow: T('', ''),
        title: T('Why Neos Group?', '¿Por qué Neos Group?'),
        text: T('', ''),
        items: [
          { icon: 'award', title: T('25+ Years of Experience', 'Más de 25 años de experiencia'), text: T('More than 25 years delivering industrial wastewater treatment and equipment solutions.', 'Más de 25 años entregando soluciones de tratamiento de aguas residuales industriales y equipos.') },
          { icon: 'sliders', title: T('Built to Fit Your Process', 'Diseñado para su proceso'), text: T('Custom solutions designed for your operating requirements and budget.', 'Soluciones a medida diseñadas según sus requisitos de operación y su presupuesto.') },
          { icon: 'wrench', title: T('Technical Support', 'Soporte técnico'), text: T('Technical assistance and preventive maintenance to help keep equipment running reliably.', 'Asistencia técnica y mantenimiento preventivo para mantener sus equipos operando de forma confiable.') },
        ],
      }),
      S('home', 'metrics', {
        anchor: 'numbers', theme: 'dark',
        eyebrow: T('By the numbers', 'En cifras'),
        title: T('Our Experience in Numbers', 'Nuestra experiencia en cifras'),
        items: [
          { value: '25+', label: T('Years of experience', 'Años de experiencia') },
          { value: '60+', label: T('Wastewater treatment systems installed', 'Sistemas de tratamiento de aguas residuales instalados') },
          { value: '1000+', label: T('Tanks installed', 'Tanques instalados') },
        ],
      }),
      S('home', 'contact', {
        anchor: 'contact', theme: 'light',
        eyebrow: T('Contact Our Team', 'Hable con nuestro equipo'),
        title: T('Get in Touch', 'Póngase en contacto'),
        text: T('Share a few details. Our team will follow up to discuss your requirements and the right solution for your operation.', 'Compártanos algunos detalles. Nuestro equipo se comunicará con usted para conversar sobre sus requisitos y la solución adecuada para su operación.'),
        formName: 'home_contact',
        submitLabel: T('Send Message', 'Enviar mensaje'),
        showAside: true,
        asideTitle: T('Need a Quick Response?', '¿Necesita una respuesta rápida?'),
        asideText: T('Contact our team to discuss your timeline and requirements.', 'Comuníquese con nuestro equipo para conversar sobre sus plazos y requisitos.'),
        asideButton: btn('Request a Detailed Quote →', 'Solicitar una cotización detallada →', '/request-a-quote'),
      }),
    ],
  };

  const wastewater = {
    id: 'wastewater', name: 'Treatment Stations', slug: 'wastewater-treatment',
    seo: {
      title: T('Industrial Wastewater Treatment Systems', 'Sistemas de tratamiento de aguas residuales industriales'),
      description: T('Batch and continuous treatment systems designed for your wastewater stream, operating volume, and discharge requirements.', 'Sistemas de tratamiento por lotes y continuos diseñados para su efluente, su volumen de operación y sus requisitos de descarga.'),
    },
    sections: [
      S('ww', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('Effluent Treatment Stations', 'Estaciones de tratamiento de efluentes'),
        title: T('Industrial Wastewater Treatment Systems', 'Sistemas de tratamiento de aguas residuales industriales'),
        text: T('Batch and continuous treatment systems designed for your wastewater stream, operating volume, and discharge requirements.', 'Sistemas de tratamiento por lotes y continuos diseñados para su efluente, su volumen de operación y sus requisitos de descarga.'),
        buttons: [QUOTE()], image: '', icon: 'water',
      }),
      S('ww', 'richText', {
        anchor: 'overview', theme: 'white', eyebrow: T('', ''),
        title: T('Treatment Designed Around Your Process', 'Tratamiento diseñado en torno a su proceso'),
        text: T(
          "Neos Group designs industrial wastewater treatment systems for each customer's wastewater characteristics and operating requirements, with a focus on applicable discharge standards.\n\nWe offer batch and continuous systems. The right approach depends on your wastewater volume, variability, and production schedule.\n\nOur designs prioritize efficient operation, water use, and maintainability while accounting for each facility's requirements.",
          'Neos Group diseña sistemas de tratamiento de aguas residuales industriales según las características del efluente y los requisitos de operación de cada cliente, con enfoque en las normas de descarga aplicables.\n\nOfrecemos sistemas por lotes y continuos. El enfoque adecuado depende del volumen de efluente, su variabilidad y su programa de producción.\n\nNuestros diseños priorizan la operación eficiente, el uso del agua y la facilidad de mantenimiento, considerando los requisitos de cada planta.'
        ),
        image: '', imageCaption: T('', ''), metrics: [], reverse: false,
      }),
      S('ww', 'systems', {
        anchor: 'systems', theme: 'light', eyebrow: T('', ''),
        title: T('Explore the Systems', 'Conozca los sistemas'), text: T('', ''),
        items: [
          {
            title: T('Batch Treatment', 'Tratamiento por lotes'),
            text: T('Batch treatment processes wastewater in defined cycles, allowing operators to control each stage from equalization through clarification.', 'El tratamiento por lotes procesa el efluente en ciclos definidos, lo que permite a los operadores controlar cada etapa, desde la ecualización hasta la clarificación.'),
            lists: [
              { label: T('Best for', 'Ideal para'), items: T('Lower wastewater volumes\nVariable wastewater characteristics', 'Menores volúmenes de efluente\nEfluentes de características variables') },
              { label: T('Advantages', 'Ventajas'), items: T('Control over each batch\nOperational flexibility', 'Control de cada lote\nFlexibilidad operativa') },
            ],
            images: [], button: null,
          },
          {
            title: T('Continuous Treatment', 'Tratamiento continuo'),
            text: T('Continuous treatment receives and processes wastewater throughout production. It is suited to facilities with steady, higher-volume flows.', 'El tratamiento continuo recibe y procesa el efluente durante toda la producción. Es adecuado para plantas con caudales constantes y de mayor volumen.'),
            lists: [
              { label: T('Best for', 'Ideal para'), items: T('Higher wastewater volumes\nContinuous production processes', 'Mayores volúmenes de efluente\nProcesos de producción continua') },
              { label: T('Advantages', 'Ventajas'), items: T('Ongoing operation\nHigher treatment capacity', 'Operación ininterrumpida\nMayor capacidad de tratamiento') },
            ],
            images: [], button: null,
          },
        ],
      }),
      S('ww', 'table', {
        anchor: 'compare', theme: 'white', eyebrow: T('', ''),
        title: T('Compare the Systems', 'Compare los sistemas'),
        text: T('See how each approach fits different operating conditions.', 'Vea cómo cada enfoque se adapta a distintas condiciones de operación.'),
        table: T(
          'Characteristic | Batch System | Continuous System\nWastewater Volume | Low to medium | Medium to high\nOperation | Cycle-based | Continuous\nFlexibility | High | Medium\nProcess Control | Batch-by-batch | Ongoing\nSpace Required | Smaller | Larger\nEnergy Consumption | Intermittent | Constant',
          'Característica | Sistema por lotes | Sistema continuo\nVolumen de efluente | Bajo a medio | Medio a alto\nOperación | Por ciclos | Continua\nFlexibilidad | Alta | Media\nControl del proceso | Lote por lote | Permanente\nEspacio requerido | Menor | Mayor\nConsumo de energía | Intermitente | Constante'
        ),
      }),
      S('ww', 'features', {
        anchor: 'benefits', theme: 'light', eyebrow: T('', ''),
        title: T('Common Benefits', 'Beneficios comunes'), text: T('', ''),
        items: [
          { icon: 'recycle', title: T('Water Reuse', 'Reúso de agua'), text: T('Treated water may be reused where the process and applicable requirements allow, reducing freshwater demand and operating costs.', 'El agua tratada puede reutilizarse cuando el proceso y los requisitos aplicables lo permiten, lo que reduce la demanda de agua nueva y los costos de operación.') },
          { icon: 'clipboard', title: T('Regulatory Considerations', 'Consideraciones regulatorias'), text: T('Designed with applicable environmental and discharge requirements in mind; final compliance depends on the site, operation, and permits.', 'Diseñado considerando los requisitos ambientales y de descarga aplicables; el cumplimiento final depende del sitio, la operación y los permisos.') },
          { icon: 'leaf', title: T('Resource Efficiency', 'Eficiencia de recursos'), text: T('Treatment and potential reuse can help reduce water consumption and waste.', 'El tratamiento y el posible reúso pueden ayudar a reducir el consumo de agua y los residuos.') },
          { icon: 'cpu', title: T('Automated Controls', 'Controles automatizados'), text: T('Automation supports repeatable operation and reduces manual intervention.', 'La automatización permite una operación repetible y reduce la intervención manual.') },
          { icon: 'filter', title: T('Contaminant Removal', 'Remoción de contaminantes'), text: T('Treatment is designed around the contaminants and discharge limits relevant to each application.', 'El tratamiento se diseña según los contaminantes y los límites de descarga relevantes para cada aplicación.') },
          { icon: 'compass', title: T('Custom Design', 'Diseño a medida'), text: T('Systems are configured for the facility, wastewater stream, and required treatment capacity.', 'Los sistemas se configuran según la planta, el efluente y la capacidad de tratamiento requerida.') },
        ],
      }),
      cta('ww', 'Tell us about your wastewater stream and operating needs. Our team will follow up to discuss a suitable system.', 'Cuéntenos sobre su efluente y sus necesidades de operación. Nuestro equipo se comunicará con usted para conversar sobre el sistema adecuado.'),
    ],
  };

  const filterPress = {
    id: 'filter-press', name: 'Filter Press', slug: 'filter-press',
    seo: {
      title: T('Filter Press for Industrial Sludge Dewatering', 'Filtro prensa para deshidratación de lodos industriales'),
      description: T('Filter presses for industrial sludge dewatering and solid-liquid separation, configured for your process.', 'Filtros prensa para deshidratación de lodos industriales y separación sólido-líquido, configurados para su proceso.'),
    },
    sections: [
      S('fp', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('Solid-liquid separation', 'Separación sólido-líquido'),
        title: T('Filter Press', 'Filtro prensa'),
        text: T('Filter presses for industrial sludge dewatering and solid-liquid separation, configured for your process.', 'Filtros prensa para deshidratación de lodos industriales y separación sólido-líquido, configurados para su proceso.'),
        buttons: [QUOTE()], image: '', icon: 'filter',
      }),
      S('fp', 'richText', {
        anchor: 'overview', theme: 'white', eyebrow: T('', ''),
        title: T('Filtration for Industrial Processes', 'Filtración para procesos industriales'),
        text: T(
          "Neos Group designs filter presses for solid-liquid separation in industrial applications.\n\nOur plate-and-frame systems separate solids from liquid to support sludge dewatering and other filtration needs.\n\nBuilt with durable components, our presses serve wastewater treatment, chemical processing, mining, electroplating, and other operations that require solid-liquid separation.\n\nEach press is configured for the customer's material, capacity, and operating requirements.",
          'Neos Group diseña filtros prensa para la separación sólido-líquido en aplicaciones industriales.\n\nNuestros sistemas de placas y marcos separan los sólidos del líquido para la deshidratación de lodos y otras necesidades de filtración.\n\nFabricados con componentes duraderos, nuestros filtros prensa atienden el tratamiento de aguas residuales, el procesamiento químico, la minería, la galvanoplastia y otras operaciones que requieren separación sólido-líquido.\n\nCada filtro prensa se configura según el material, la capacidad y los requisitos de operación del cliente.'
        ),
        image: '', imageCaption: T('', ''), metrics: [], reverse: false,
      }),
      S('fp', 'steps', {
        anchor: 'how-it-works', theme: 'light', eyebrow: T('Operating principle', 'Principio de funcionamiento'),
        title: T('How the Press Works', 'Cómo funciona el filtro prensa'),
        text: T('Slurry is pumped into the press. Pressure drives liquid through the filter cloth while solids collect between the plates as a filter cake.', 'El lodo se bombea al filtro prensa. La presión hace pasar el líquido a través de la tela filtrante, mientras los sólidos se acumulan entre las placas formando una torta de filtración.'),
        items: [
          { title: T('Feed', 'Alimentación'), text: T('Slurry is pumped into the filter press.', 'El lodo se bombea al filtro prensa.') },
          { title: T('Filtration', 'Filtración'), text: T('Liquid passes through the filter cloth; solids remain in the chambers.', 'El líquido atraviesa la tela filtrante; los sólidos quedan retenidos en las cámaras.') },
          { title: T('Pressurization', 'Presurización'), text: T('Pressure is maintained to remove more liquid.', 'Se mantiene la presión para extraer más líquido.') },
          { title: T('Cake Discharge', 'Descarga de la torta'), text: T('The plates separate so the filter cake can be removed.', 'Las placas se separan para retirar la torta de filtración.') },
        ],
      }),
      S('fp', 'details', {
        anchor: 'components', theme: 'white', eyebrow: T('', ''),
        title: T('Main Components', 'Componentes principales'),
        text: T('Components selected for durability and reliable operation.', 'Componentes seleccionados por su durabilidad y operación confiable.'),
        items: [
          { title: T('Filter Plates', 'Placas filtrantes'), text: T('High-strength polypropylene plates designed for effective filtration.', 'Placas de polipropileno de alta resistencia diseñadas para una filtración eficaz.') },
          { title: T('Support Frame', 'Estructura de soporte'), text: T('Epoxy-coated carbon steel or stainless steel options for durability and corrosion resistance.', 'Opciones en acero al carbono con recubrimiento epóxico o acero inoxidable, para mayor durabilidad y resistencia a la corrosión.') },
          { title: T('Filter Cloths', 'Telas filtrantes'), text: T('Available in materials and pore sizes selected for the application.', 'Disponibles en materiales y tamaños de poro seleccionados según la aplicación.') },
        ],
      }),
      S('fp', 'features', {
        anchor: 'benefits', theme: 'light', eyebrow: T('', ''),
        title: T('Benefits', 'Beneficios'), text: T('', ''),
        items: [
          { icon: 'drop', title: T('Effective Dewatering', 'Deshidratación eficaz'), text: T('Separates solids from liquids and can achieve up to 80% dryness in the filter cake, depending on the material and operating conditions.', 'Separa los sólidos de los líquidos y puede alcanzar hasta un 80 % de sequedad en la torta, según el material y las condiciones de operación.') },
          { icon: 'recycle', title: T('Water Recovery', 'Recuperación de agua'), text: T('Filtered water may be recovered for reuse where appropriate, reducing freshwater demand and operating costs.', 'El agua filtrada puede recuperarse para reúso cuando corresponda, lo que reduce la demanda de agua nueva y los costos de operación.') },
          { icon: 'truck', title: T('Lower Disposal Volume', 'Menor volumen de disposición'), text: T('Drier solids can be easier to handle and may reduce transportation and disposal costs.', 'Los sólidos más secos son más fáciles de manejar y pueden reducir los costos de transporte y disposición.') },
          { icon: 'cpu', title: T('Automated Controls', 'Controles automatizados'), text: T('Available automated controls reduce manual intervention and support safe operation.', 'Los controles automatizados disponibles reducen la intervención manual y favorecen una operación segura.') },
          { icon: 'gauge', title: T('Operating Efficiency', 'Eficiencia operativa'), text: T('Energy and chemical use depends on the application; the system is configured to support efficient dewatering.', 'El consumo de energía y químicos depende de la aplicación; el sistema se configura para una deshidratación eficiente.') },
          { icon: 'sliders', title: T('Adaptable Design', 'Diseño adaptable'), text: T('Configured for different sludges and industrial processes.', 'Configurado para distintos tipos de lodos y procesos industriales.') },
        ],
      }),
      S('fp', 'applications', {
        anchor: 'applications', theme: 'white', eyebrow: T('', ''),
        title: T('Applications', 'Aplicaciones'), text: T('', ''),
        groups: [
          { title: T('Wastewater Treatment', 'Tratamiento de aguas residuales'), items: T('Dewatering of wastewater treatment sludge\nSolids separation in industrial wastewater\nWater recovery for reuse', 'Deshidratación de lodos de tratamiento de aguas residuales\nSeparación de sólidos en aguas residuales industriales\nRecuperación de agua para reúso') },
          { title: T('Chemical Processing', 'Procesamiento químico'), items: T('Filtration of chemical products\nRecovery of raw materials\nSeparation of crystals and precipitates', 'Filtración de productos químicos\nRecuperación de materias primas\nSeparación de cristales y precipitados') },
          { title: T('Electroplating', 'Galvanoplastia'), items: T('Treatment of metal-bearing wastewater\nRecovery of valuable metals\nReduction of waste volume for disposal', 'Tratamiento de efluentes con metales\nRecuperación de metales valiosos\nReducción del volumen de residuos para disposición') },
          { title: T('Mining', 'Minería'), items: T('Tailings dewatering', 'Deshidratación de relaves') },
        ],
      }),
      cta('fp', 'Tell us about your material and capacity requirements. Our team will follow up to discuss a suitable press.', 'Cuéntenos sobre su material y sus requisitos de capacidad. Nuestro equipo se comunicará con usted para conversar sobre el filtro prensa adecuado.'),
    ],
  };

  const tanks = {
    id: 'tanks', name: 'Polypropylene Tanks', slug: 'polypropylene-tanks',
    seo: {
      title: T('Polypropylene Tanks', 'Tanques de polipropileno'),
      description: T('Custom polypropylene tanks for chemical storage, process applications, industrial wastewater, and treated water.', 'Tanques de polipropileno a medida para almacenamiento de químicos, aplicaciones de proceso, aguas residuales industriales y agua tratada.'),
    },
    sections: [
      S('pp', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('Chemical storage and process tanks', 'Tanques de almacenamiento químico y de proceso'),
        title: T('Polypropylene Tanks', 'Tanques de polipropileno'),
        text: T('Custom polypropylene tanks for chemical storage, process applications, industrial wastewater, and treated water.', 'Tanques de polipropileno a medida para almacenamiento de químicos, aplicaciones de proceso, aguas residuales industriales y agua tratada.'),
        buttons: [QUOTE()], image: '', icon: 'tank',
      }),
      S('pp', 'richText', {
        anchor: 'overview', theme: 'white', eyebrow: T('Designed for chemical resistance, durability, and the requirements of your facility.', 'Diseñados para resistencia química, durabilidad y los requisitos de su planta.'),
        title: T('Polypropylene Tanks Built for Your Process', 'Tanques de polipropileno fabricados para su proceso'),
        text: T(
          'Neos Group designs and manufactures polypropylene (PP) tanks for storing and processing chemicals, industrial wastewater, and treated water. Configurations are tailored to the application.\n\nPolypropylene offers chemical resistance for many acids, bases, and solvents. Material compatibility should be confirmed for the specific chemical and operating conditions.',
          'Neos Group diseña y fabrica tanques de polipropileno (PP) para almacenar y procesar químicos, aguas residuales industriales y agua tratada. Las configuraciones se adaptan a cada aplicación.\n\nEl polipropileno ofrece resistencia química a muchos ácidos, bases y solventes. La compatibilidad del material debe confirmarse para cada químico y condición de operación.'
        ),
        image: '', imageCaption: T('', ''), reverse: false,
        metrics: [
          { value: '25+', label: T('Years of experience', 'Años de experiencia') },
          { value: '5000+', label: T('Tanks installed', 'Tanques instalados') },
        ],
      }),
      S('pp', 'features', {
        anchor: 'benefits', theme: 'light', eyebrow: T('', ''),
        title: T('Features and Benefits', 'Características y beneficios'),
        text: T('Choose the tank configuration that fits your chemical, volume, and installation requirements.', 'Elija la configuración de tanque que se adapte a su químico, volumen y requisitos de instalación.'),
        items: [
          { icon: 'flask', title: T('Chemical Resistance', 'Resistencia química'), text: T('Polypropylene resists many acids, bases, salts, and organic solvents; confirm compatibility for each stored chemical.', 'El polipropileno resiste muchos ácidos, bases, sales y solventes orgánicos; confirme la compatibilidad para cada químico almacenado.') },
          { icon: 'clock', title: T('Long Service Life', 'Larga vida útil'), text: T('Impact and fatigue resistance can reduce maintenance and replacement needs under suitable operating conditions.', 'La resistencia al impacto y a la fatiga puede reducir las necesidades de mantenimiento y reemplazo en condiciones de operación adecuadas.') },
          { icon: 'feather', title: T('Lighter Construction', 'Construcción más liviana'), text: T('Lighter than comparable metal or concrete tanks, which can simplify transportation and installation.', 'Más liviano que tanques comparables de metal o concreto, lo que puede simplificar el transporte y la instalación.') },
          { icon: 'compass', title: T('Custom Configurations', 'Configuraciones a medida'), text: T('Specify the shape, size, connections, and accessories for your application.', 'Especifique la forma, el tamaño, las conexiones y los accesorios para su aplicación.') },
          { icon: 'wrench', title: T('Easy Maintenance', 'Fácil mantenimiento'), text: T('Corrosion-resistant surfaces require no painting and are easy to clean.', 'Las superficies resistentes a la corrosión no requieren pintura y son fáciles de limpiar.') },
          { icon: 'trend', title: T('Lifecycle Value', 'Valor a lo largo del ciclo de vida'), text: T('Low maintenance and long service life can improve the value of the initial investment.', 'El bajo mantenimiento y la larga vida útil pueden mejorar el retorno de la inversión inicial.') },
        ],
      }),
      S('pp', 'systems', {
        anchor: 'types', theme: 'white', eyebrow: T('', ''),
        title: T('Types of Polypropylene Tanks', 'Tipos de tanques de polipropileno'),
        text: T('Explore configurations for different storage and process needs.', 'Conozca configuraciones para distintas necesidades de almacenamiento y proceso.'),
        items: [
          {
            title: T('Horizontal Tanks', 'Tanques horizontales'),
            text: T('Horizontal tanks store larger volumes where installation height is limited. Support cradles, dimensions, and connections can be configured.', 'Los tanques horizontales almacenan mayores volúmenes donde la altura de instalación es limitada. Las cunas de soporte, las dimensiones y las conexiones son configurables.'),
            lists: [{ label: T('', ''), items: T('Capacity: 1,000–50,000 L (about 264–13,209 U.S. gal)\nOptional internal compartments\nUnderground installation option\nCustom connections and accessories', 'Capacidad: 1,000–50,000 L (aprox. 264–13,209 gal EE. UU.)\nCompartimentos internos opcionales\nOpción de instalación subterránea\nConexiones y accesorios a medida') }],
            images: [], button: btn('Request Information →', 'Solicitar información →', '/request-a-quote', 'link'),
          },
          {
            title: T('Vertical Tanks', 'Tanques verticales'),
            text: T('Vertical tanks make efficient use of floor space. Flat, conical, or sloped bottoms and lid options can be specified.', 'Los tanques verticales aprovechan de forma eficiente el espacio en planta. Se pueden especificar fondos planos, cónicos o inclinados y opciones de tapa.'),
            lists: [{ label: T('', ''), items: T('Capacity: 100–25,000 L (about 26–6,604 U.S. gal)\nLadders and access platforms available\nAgitation and mixing systems available\nLevel indicators and automated controls available', 'Capacidad: 100–25,000 L (aprox. 26–6,604 gal EE. UU.)\nEscaleras y plataformas de acceso disponibles\nSistemas de agitación y mezcla disponibles\nIndicadores de nivel y controles automatizados disponibles') }],
            images: [], button: btn('Request Information →', 'Solicitar información →', '/request-a-quote', 'link'),
          },
          {
            title: T('Process and Specialty Tanks', 'Tanques de proceso y especiales'),
            text: T('Designed for neutralization, flocculation, settling, and controlled chemical reactions, with custom options for specialized applications.', 'Diseñados para neutralización, floculación, sedimentación y reacciones químicas controladas, con opciones a medida para aplicaciones especializadas.'),
            lists: [{ label: T('', ''), items: T('Instrumentation options\nInternal baffles and partitions\nIntegrated filtration options\nApplication-specific designs', 'Opciones de instrumentación\nDeflectores y divisiones internas\nOpciones de filtración integrada\nDiseños específicos para cada aplicación') }],
            images: [], button: btn('Request Information →', 'Solicitar información →', '/request-a-quote', 'link'),
          },
        ],
      }),
      S('pp', 'table', {
        anchor: 'specifications', theme: 'light', eyebrow: T('', ''),
        title: T('Technical Specifications', 'Especificaciones técnicas'),
        text: T('Specifications vary by configuration and operating conditions.', 'Las especificaciones varían según la configuración y las condiciones de operación.'),
        table: T(
          'Item | Specification | Notes\nMaterial | Virgin polypropylene (PP) | Industrial grade; UV additives when needed\nWall thickness | 6–25 mm (about 0.24–0.98 in.) | Varies by dimensions and application\nOperating temperature | 0–90°C (32–194°F) | Consult us about your operating temperature\nChemical resistance | Acids, bases, salts, and solvents | Confirm compatibility for the specific chemical\nAvailable capacities | 100–50,000 L (about 26–13,209 U.S. gal) | Larger volumes on request\nManufacturing methods | Extrusion welding and thermofusion | Per applicable standards\nApplicable standards | ASTM, DVS, ISO | Certification details available on request',
          'Ítem | Especificación | Notas\nMaterial | Polipropileno (PP) virgen | Grado industrial; aditivos UV cuando se requieran\nEspesor de pared | 6–25 mm (aprox. 0.24–0.98 in) | Varía según las dimensiones y la aplicación\nTemperatura de operación | 0–90 °C (32–194 °F) | Consúltenos sobre su temperatura de operación\nResistencia química | Ácidos, bases, sales y solventes | Confirme la compatibilidad con el químico específico\nCapacidades disponibles | 100–50,000 L (aprox. 26–13,209 gal EE. UU.) | Mayores volúmenes bajo pedido\nMétodos de fabricación | Soldadura por extrusión y termofusión | Según las normas aplicables\nNormas aplicables | ASTM, DVS, ISO | Detalles de certificación disponibles bajo pedido'
        ),
      }),
      cta('pp', 'Tell us what you need to store or process. Our team will follow up about the right tank configuration.', 'Cuéntenos qué necesita almacenar o procesar. Nuestro equipo se comunicará con usted sobre la configuración de tanque adecuada.'),
    ],
  };

  const chrome = {
    id: 'chrome', name: 'Chrome Plating Line', slug: 'chrome-plating-line',
    seo: {
      title: T('Chrome Plating Line', 'Línea de cromado'),
      description: T('Chrome plating lines configured for industrial throughput, finish quality, and process control.', 'Líneas de cromado configuradas para la producción industrial, la calidad del acabado y el control del proceso.'),
    },
    sections: [
      S('cr', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('Electroplating lines', 'Líneas de galvanoplastia'),
        title: T('Chrome Plating Line', 'Línea de cromado'),
        text: T('Chrome plating lines configured for industrial throughput, finish quality, and process control.', 'Líneas de cromado configuradas para la producción industrial, la calidad del acabado y el control del proceso.'),
        buttons: [QUOTE()], image: '', icon: 'spark',
      }),
      S('cr', 'richText', {
        anchor: 'overview', theme: 'white', eyebrow: T('', ''),
        title: T('Chrome Plating Lines for Your Production Needs', 'Líneas de cromado para sus necesidades de producción'),
        text: T(
          "Neos Group designs chrome plating lines around each customer's production requirements and finish specifications.\n\nOur lines incorporate process controls for efficient operation, operator safety, and responsible handling of water and chemicals. Applicable requirements depend on the facility and process.\n\nWe support the project from design through installation and maintenance to help keep the line operating reliably.",
          'Neos Group diseña líneas de cromado según los requisitos de producción y las especificaciones de acabado de cada cliente.\n\nNuestras líneas incorporan controles de proceso para una operación eficiente, la seguridad del operador y el manejo responsable del agua y los químicos. Los requisitos aplicables dependen de la planta y del proceso.\n\nAcompañamos el proyecto desde el diseño hasta la instalación y el mantenimiento para que la línea opere de forma confiable.'
        ),
        image: '', imageCaption: T('', ''), metrics: [], reverse: false,
      }),
      S('cr', 'features', {
        anchor: 'benefits', theme: 'light', eyebrow: T('', ''),
        title: T('Features and Benefits', 'Características y beneficios'), text: T('', ''),
        items: [
          { icon: 'factory', title: T('Production Capacity', 'Capacidad de producción'), text: T('Line configurations are designed around throughput and workflow requirements.', 'Las configuraciones de línea se diseñan según los requisitos de producción y flujo de trabajo.') },
          { icon: 'spark', title: T('Consistent Finish', 'Acabado uniforme'), text: T('Process control supports uniform, bright finishes that meet the specified quality requirements.', 'El control del proceso permite acabados brillantes y uniformes que cumplen los requisitos de calidad especificados.') },
          { icon: 'drop', title: T('Resource Use', 'Uso de recursos'), text: T('Process design can help manage water and energy consumption.', 'El diseño del proceso ayuda a gestionar el consumo de agua y energía.') },
          { icon: 'cpu', title: T('Automation', 'Automatización'), text: T('Automated controls can improve process consistency and reduce manual intervention.', 'Los controles automatizados mejoran la consistencia del proceso y reducen la intervención manual.') },
          { icon: 'shield', title: T('Operator Safety', 'Seguridad del operador'), text: T('Equipment can be configured with safeguards appropriate to the process and site.', 'Los equipos pueden configurarse con protecciones adecuadas al proceso y al sitio.') },
          { icon: 'bolt', title: T('Energy Efficiency', 'Eficiencia energética'), text: T('System design considers energy demand and operating costs.', 'El diseño del sistema considera la demanda de energía y los costos de operación.') },
        ],
      }),
      S('cr', 'gallery', {
        anchor: 'gallery', theme: 'white', eyebrow: T('', ''),
        title: T('Gallery', 'Galería'), text: T('', ''),
        images: [],
      }),
      S('cr', 'steps', {
        anchor: 'process', theme: 'light', eyebrow: T('Chrome Plating Process', 'Proceso de cromado'),
        title: T('Process Steps', 'Etapas del proceso'),
        text: T('The line follows a controlled sequence to prepare the parts, deposit the finish, and inspect the result.', 'La línea sigue una secuencia controlada para preparar las piezas, depositar el acabado e inspeccionar el resultado.'),
        items: [
          { title: T('Surface Preparation', 'Preparación de la superficie'), text: T('Clean and prepare parts to remove oil, oxides, and other contaminants that can affect adhesion.', 'Limpiar y preparar las piezas para eliminar aceite, óxidos y otros contaminantes que pueden afectar la adherencia.') },
          { title: T('Nickel Bath', 'Baño de níquel'), text: T('Deposit a nickel base layer to support adhesion and corrosion resistance.', 'Depositar una capa base de níquel para favorecer la adherencia y la resistencia a la corrosión.') },
          { title: T('Chromium Plating', 'Cromado'), text: T('Electrodeposit chromium over the nickel layer in tanks with controlled temperature, current, and immersion time.', 'Electrodepositar cromo sobre la capa de níquel en tanques con temperatura, corriente y tiempo de inmersión controlados.') },
          { title: T('Rinsing and Neutralization', 'Enjuague y neutralización'), text: T('Rinse and neutralize residual chemicals on the parts.', 'Enjuagar y neutralizar los químicos residuales en las piezas.') },
          { title: T('Drying and Final Inspection', 'Secado e inspección final'), text: T('Dry the parts and inspect finish quality, brightness, and coating uniformity.', 'Secar las piezas e inspeccionar la calidad del acabado, el brillo y la uniformidad del recubrimiento.') },
        ],
      }),
      cta('cr', 'Tell us about the parts, finish requirements, and target throughput. Our team will follow up to discuss your line.', 'Cuéntenos sobre las piezas, los requisitos de acabado y la producción objetivo. Nuestro equipo se comunicará con usted para conversar sobre su línea.'),
    ],
  };

  const galv = {
    id: 'galvanizing', name: 'Electrolytic Galvanizing', slug: 'electrolytic-galvanizing',
    seo: {
      title: T('Electrolytic Galvanizing', 'Galvanizado electrolítico'),
      description: T('Zinc electroplating for metal components, with corrosion protection and a consistent finish.', 'Cincado electrolítico para componentes metálicos, con protección contra la corrosión y un acabado uniforme.'),
    },
    sections: [
      S('gv', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('Electroplating lines', 'Líneas de galvanoplastia'),
        title: T('Electrolytic Galvanizing', 'Galvanizado electrolítico'),
        text: T('Zinc electroplating for metal components, with corrosion protection and a consistent finish.', 'Cincado electrolítico para componentes metálicos, con protección contra la corrosión y un acabado uniforme.'),
        buttons: [QUOTE()], image: '', icon: 'layers',
      }),
      S('gv', 'richText', {
        anchor: 'overview', theme: 'white', eyebrow: T('', ''),
        title: T('Electrolytic Zinc Plating', 'Cincado electrolítico'),
        text: T(
          "Electrolytic galvanizing deposits a zinc coating on metal through an electroplating process to help protect components from corrosion and provide a consistent finish.\n\nNeos Group uses controlled processes to support coating adhesion and uniformity according to the project's technical requirements.",
          'El galvanizado electrolítico deposita un recubrimiento de zinc sobre el metal mediante un proceso de electrodeposición, que ayuda a proteger los componentes contra la corrosión y ofrece un acabado uniforme.\n\nNeos Group utiliza procesos controlados para asegurar la adherencia y la uniformidad del recubrimiento según los requisitos técnicos del proyecto.'
        ),
        image: '', imageCaption: T('', ''), metrics: [], reverse: false,
      }),
      S('gv', 'features', {
        anchor: 'benefits', theme: 'light', eyebrow: T('', ''),
        title: T('Features and Benefits', 'Características y beneficios'), text: T('', ''),
        items: [
          { icon: 'shield', title: T('Corrosion Protection', 'Protección contra la corrosión'), text: T('Zinc coating helps extend the service life of metal components.', 'El recubrimiento de zinc ayuda a prolongar la vida útil de los componentes metálicos.') },
          { icon: 'layers', title: T('Uniform Coating', 'Recubrimiento uniforme'), text: T('Process control supports consistent coating thickness across each part.', 'El control del proceso permite un espesor de recubrimiento uniforme en cada pieza.') },
          { icon: 'grid', title: T('Range of Parts', 'Variedad de piezas'), text: T('Suitable for a variety of components, from small fasteners to larger parts, subject to process capacity.', 'Adecuado para diversos componentes, desde pequeños sujetadores hasta piezas más grandes, según la capacidad del proceso.') },
          { icon: 'palette', title: T('Passivation Options', 'Opciones de pasivado'), text: T('Blue, yellow, black, and clear passivation options for different appearance and performance requirements.', 'Pasivados azul, amarillo, negro y transparente para distintos requisitos de apariencia y desempeño.') },
          { icon: 'leaf', title: T('Environmental Requirements', 'Requisitos ambientales'), text: T('Hexavalent chromium-free process options are available; confirm the applicable RoHS and REACH requirements for the finished part.', 'Hay opciones de proceso libres de cromo hexavalente; confirme los requisitos RoHS y REACH aplicables a la pieza terminada.') },
          { icon: 'check', title: T('Quality Control', 'Control de calidad'), text: T('Inspection throughout the process supports consistent results against agreed specifications.', 'La inspección a lo largo del proceso asegura resultados consistentes con las especificaciones acordadas.') },
        ],
      }),
      S('gv', 'steps', {
        anchor: 'process', theme: 'white', eyebrow: T('', ''),
        title: T('The Zinc Electroplating Process', 'El proceso de cincado electrolítico'), text: T('', ''),
        items: [
          { title: T('Surface Preparation', 'Preparación de la superficie'), text: T('Clean, degrease, and pickle parts to prepare the surface for coating adhesion.', 'Limpiar, desengrasar y decapar las piezas para preparar la superficie para la adherencia del recubrimiento.') },
          { title: T('Electrodeposition', 'Electrodeposición'), text: T('Immerse parts in a zinc-salt electrolyte and apply current to deposit the coating.', 'Sumergir las piezas en un electrolito de sales de zinc y aplicar corriente para depositar el recubrimiento.') },
          { title: T('Passivation', 'Pasivado'), text: T('Apply a chemical treatment to improve corrosion resistance and achieve the specified finish color.', 'Aplicar un tratamiento químico para mejorar la resistencia a la corrosión y lograr el color de acabado especificado.') },
          { title: T('Drying and Finishing', 'Secado y acabado'), text: T('Dry and inspect the parts against coating requirements.', 'Secar e inspeccionar las piezas según los requisitos de recubrimiento.') },
        ],
      }),
      S('gv', 'gallery', {
        anchor: 'equipment', theme: 'light', eyebrow: T('', ''),
        title: T('Our Equipment', 'Nuestros equipos'), text: T('', ''),
        images: [
          { src: '', caption: T('Rotating barrel for plating small parts in bulk', 'Tambor rotativo para el recubrimiento de piezas pequeñas a granel') },
          { src: '', caption: T('Detail of the rotating barrel system', 'Detalle del sistema de tambor rotativo') },
        ],
      }),
      S('gv', 'applications', {
        anchor: 'applications', theme: 'white', eyebrow: T('', ''),
        title: T('Applications', 'Aplicaciones'), text: T('', ''),
        groups: [
          { title: T('Automotive Industry', 'Industria automotriz'), items: T('Fastening components\nStructural parts\nBrake systems', 'Componentes de fijación\nPiezas estructurales\nSistemas de frenos') },
          { title: T('Construction', 'Construcción'), items: T('Screws and nuts\nSupports and fasteners\nStructural elements', 'Tornillos y tuercas\nSoportes y sujetadores\nElementos estructurales') },
          { title: T('Appliances', 'Electrodomésticos'), items: T('Internal components\nFastening elements\nStructural parts', 'Componentes internos\nElementos de fijación\nPiezas estructurales') },
        ],
      }),
      cta('gv', 'Tell us about the components and coating requirements. Our team will follow up with a quote.', 'Cuéntenos sobre los componentes y los requisitos de recubrimiento. Nuestro equipo le enviará una cotización.'),
    ],
  };

  const about = {
    id: 'about', name: 'About Us', slug: 'about',
    seo: {
      title: T('About Us', 'Nosotros'),
      description: T("Explore Neos Group's history, people, and approach to industrial solutions.", 'Conozca la historia, el equipo y el enfoque de Neos Group en soluciones industriales.'),
    },
    sections: [
      S('ab', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('', ''),
        title: T('About Us', 'Nosotros'),
        text: T("Explore Neos Group's history, people, and approach to industrial solutions.", 'Conozca la historia, el equipo y el enfoque de Neos Group en soluciones industriales.'),
        buttons: [], image: '', icon: 'factory',
      }),
      S('ab', 'richText', {
        anchor: 'history', theme: 'white', eyebrow: T('', ''),
        title: T('Our History', 'Nuestra historia'),
        text: T(
          "Founded more than 25 years ago, Neos Group develops industrial equipment and wastewater treatment solutions with a focus on quality and reliability.\n\nToday, our work spans industrial wastewater treatment, polypropylene tanks, filter presses, and electroplating lines.\n\nOur team continues to develop solutions around each customer's process requirements and resource needs.",
          'Fundada hace más de 25 años, Neos Group desarrolla equipos industriales y soluciones de tratamiento de aguas residuales con enfoque en la calidad y la confiabilidad.\n\nHoy, nuestro trabajo abarca el tratamiento de aguas residuales industriales, tanques de polipropileno, filtros prensa y líneas de galvanoplastia.\n\nNuestro equipo sigue desarrollando soluciones según los requisitos de proceso y las necesidades de recursos de cada cliente.'
        ),
        image: '', imageCaption: T('', ''), metrics: [], reverse: false,
      }),
      S('ab', 'mvv', {
        anchor: 'mission', theme: 'light',
        title: T('Mission, Vision, and Values', 'Misión, visión y valores'),
        text: T('These principles guide how we work with customers, employees, and partners.', 'Estos principios guían nuestra forma de trabajar con clientes, colaboradores y socios.'),
        missionTitle: T('Mission', 'Misión'),
        mission: T('To develop industrial solutions that bring together sustainability, productivity, and innovation while supporting our customers, employees, and long-term growth.', 'Desarrollar soluciones industriales que unan sostenibilidad, productividad e innovación, apoyando a nuestros clientes, a nuestros colaboradores y el crecimiento a largo plazo.'),
        visionTitle: T('Vision', 'Visión'),
        vision: T('To be recognized internationally as a trusted partner in industrial solutions, advancing technology, productivity, sustainability, and people.', 'Ser reconocidos internacionalmente como un socio confiable en soluciones industriales, impulsando la tecnología, la productividad, la sostenibilidad y a las personas.'),
        valuesTitle: T('Values', 'Valores'),
        values: [
          { title: T('Reliability', 'Confiabilidad'), text: T('We follow through on commitments to customers and employees.', 'Cumplimos nuestros compromisos con clientes y colaboradores.') },
          { title: T('Ethics', 'Ética'), text: T('We work with respect and transparency.', 'Trabajamos con respeto y transparencia.') },
          { title: T('Sustainability', 'Sostenibilidad'), text: T('We consider environmental, human, and business outcomes.', 'Consideramos los resultados ambientales, humanos y de negocio.') },
          { title: T('Continuous Improvement', 'Mejora continua'), text: T('We pursue quality, excellence, and innovation in our products and services.', 'Buscamos calidad, excelencia e innovación en nuestros productos y servicios.') },
        ],
      }),
      S('ab', 'details', {
        anchor: 'team', theme: 'white', eyebrow: T('', ''),
        title: T('Our Team', 'Nuestro equipo'),
        text: T('Our engineers, technicians, and specialists bring together the skills needed to address a range of industrial challenges.', 'Nuestros ingenieros, técnicos y especialistas reúnen las capacidades necesarias para resolver una amplia variedad de desafíos industriales.'),
        items: [
          { title: T('Engineering and Technical Expertise', 'Experiencia técnica y de ingeniería'), text: T("Our team designs, develops, and implements solutions tailored to each customer's requirements.", 'Nuestro equipo diseña, desarrolla e implementa soluciones adaptadas a los requisitos de cada cliente.') },
          { title: T('Support Throughout the Project', 'Acompañamiento durante todo el proyecto'), text: T('We provide technical support from project planning through implementation and maintenance.', 'Brindamos soporte técnico desde la planificación del proyecto hasta la implementación y el mantenimiento.') },
        ],
      }),
      S('ab', 'cta', {
        anchor: 'careers', theme: 'light', eyebrow: T('', ''),
        title: T('Join Our Team', 'Únase a nuestro equipo'),
        text: T('We welcome professionals who share our values and want to work on industrial solutions.', 'Damos la bienvenida a profesionales que comparten nuestros valores y quieren trabajar en soluciones industriales.'),
        buttons: [btn('Work With Us', 'Trabaje con nosotros', 'mailto:sales@neosindustrialsolutions.com?subject=Careers', 'secondary')],
      }),
      S('ab', 'gallery', {
        anchor: 'facilities', theme: 'white', eyebrow: T('', ''),
        title: T('Our Facilities', 'Nuestras instalaciones'),
        text: T('Our facilities support product development, manufacturing, and customer service.', 'Nuestras instalaciones apoyan el desarrollo de productos, la fabricación y la atención al cliente.'),
        images: [
          { src: '', caption: T('Neos Group Booth at the Metallurgy Fair', 'Stand de Neos Group en la Feria de Metalurgia') },
          { src: '', caption: T('Neos Group Industrial Facility', 'Planta industrial de Neos Group') },
        ],
      }),
      S('ab', 'cta', {
        anchor: 'solutions', theme: 'dark', eyebrow: T('', ''),
        title: T('Explore Our Solutions', 'Conozca nuestras soluciones'),
        text: T('See how Neos Group can support your industrial process with equipment and treatment solutions.', 'Descubra cómo Neos Group puede apoyar su proceso industrial con equipos y soluciones de tratamiento.'),
        buttons: [btn('View Our Solutions', 'Ver nuestras soluciones', '/#products', 'secondary'), QUOTE()],
      }),
    ],
  };

  const quote = {
    id: 'quote', name: 'Request a Quote', slug: 'request-a-quote',
    seo: {
      title: T('Request a Quote', 'Solicitar cotización'),
      description: T('Tell us about your project. Our team will follow up to discuss your requirements and prepare a quote.', 'Cuéntenos sobre su proyecto. Nuestro equipo se comunicará con usted para conversar sobre sus requisitos y preparar una cotización.'),
    },
    sections: [
      S('rq', 'pageHero', {
        anchor: 'top', theme: 'dark', eyebrow: T('', ''),
        title: T('Request a Quote', 'Solicite una cotización'),
        text: T('Tell us about your project. Our team will follow up to discuss your requirements and prepare a quote.', 'Cuéntenos sobre su proyecto. Nuestro equipo se comunicará con usted para conversar sobre sus requisitos y preparar una cotización.'),
        buttons: [], image: '', icon: 'clipboard', compact: true,
      }),
      S('rq', 'contact', {
        anchor: 'inquiry', theme: 'light', eyebrow: T('', ''),
        title: T('Project Inquiry', 'Consulta de proyecto'),
        text: T('', ''),
        formName: 'request_a_quote',
        submitLabel: T('Send Request', 'Enviar solicitud'),
        showAside: false,
        asideTitle: T('', ''), asideText: T('', ''), asideButton: null,
      }),
      S('rq', 'contactCards', {
        anchor: 'reach-us', theme: 'white',
        title: T('Other Ways to Reach Us', 'Otras formas de contactarnos'),
        cards: [
          { kind: 'phone', title: T('Phone', 'Teléfono'), buttonLabel: T('Call Us', 'Llámenos') },
          { kind: 'email', title: T('Email', 'Correo electrónico'), buttonLabel: T('Email Us', 'Escríbanos') },
          { kind: 'address', title: T('Address', 'Dirección'), buttonLabel: T('View on Map', 'Ver en el mapa') },
        ],
      }),
    ],
  };

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings,
    pages: [home, wastewater, tanks, filterPress, galv, chrome, about, quote],
  };
}

module.exports = build;
