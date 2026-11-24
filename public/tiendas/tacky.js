/* Fork · plugin de tienda: Tacky
   Estilo fuerte y divertido: rosa, naranja y amarillo, títulos gritones.
   Un plugin trae la estética, los textos, las notas rápidas para la cocina,
   un menú de ejemplo con pasos y opciones, mesas y pedidos de muestra.
   El menú de ejemplo es de hamburguesas: plancha, freidora y barra,
   extras con precio, "sacar" ingredientes y tamaño de papas. */
(function () {
  var plancha = function (m) {
    return [{ n: 'Plancha', min: m, est: 'Plancha' }, { n: 'Armado', min: 2, est: 'Armado' }, { n: 'Empaque', min: 1, est: 'Armado' }];
  };
  var extras = [
    { id: 'extras', n: 'Extras', t: 'varios', max: 4, items: [
      { n: 'Extra cheddar', precio: 900 }, { n: 'Panceta', precio: 1200 }, { n: 'Huevo frito', precio: 800 },
      { n: 'Cebolla caramelizada', precio: 700 }, { n: 'Medallón extra', precio: 2500 }] },
    { id: 'sin', n: 'Sacar', t: 'varios', items: [{ n: 'Sin cebolla' }, { n: 'Sin pepinos' }, { n: 'Sin tomate' }, { n: 'Sin salsa' }] }
  ];

  ForkHub.tienda({
    id: 'tacky',
    nombre: 'Tacky',
    rubro: 'Hamburguesería',
    emoji: '🍔',
    lema: 'Colores fuertes y comida con onda',
    ejemplo: 'hamburguesas, papas y bebidas, con plancha, freidora y barra',
    tema: {
      color: '#ff2d87',
      oscuro: { bg: '#160a24', pn: '#221036', pn2: '#2d1747', pn3: '#3a1f5a', bd: '#4a2a70', tx: '#fff6fb', mu: '#c3a8dc' },
      claro: { bg: '#fff8d6', pn: '#ffffff', pn2: '#ffeeb0', pn3: '#ffe38a', bd: '#f5cf5e', tx: '#2a0f3a', mu: '#7d5a8f' },
      titulos: 'Impact, Haettenschweiler, "Arial Narrow Bold", "Franklin Gothic Bold", sans-serif',
      css: '[data-tienda="tacky"] .hero2{background:linear-gradient(135deg,#ff2d87,#ff7a1a 55%,#ffd21f)}' +
        '[data-tienda="tacky"] .hero2 h1{text-transform:uppercase;font-weight:400;letter-spacing:.01em;text-shadow:3px 3px 0 #2a0f3a}' +
        '[data-tienda="tacky"] .pared header{background:linear-gradient(90deg,#ff2d87,#ff7a1a)}' +
        '[data-tienda="tacky"] .pared header h1{text-transform:uppercase;font-weight:400}'
    },
    textos: {
      paredPrep: '¡Marchando!',
      paredListo: '¡Salió! Retirá',
      prepTit: '¡Tu pedido está marchando!',
      listoTit: '¡Salió tu pedido!',
      cocinaVacia: '🔥 Nada en espera. A esperar el próximo.',
      resena: '¿Cómo estuvo todo?'
    },
    notas: ['Sin sal', 'Sin picante', 'Bien cocido', 'Salsa aparte', 'Cortado al medio', 'Para compartir'],
    cfg: {
      direccion: 'Av. San Martín 1234', whatsapp: '5492954000000', instagram: 'tacky.demo',
      alias: 'tacky.demo', cbu: '0000003100012345678901', titular: 'Tacky',
      mpLink: 'https://link.mercadopago.com.ar/tackydemo', medios: { efectivo: true, alias: true, mp: true },
      placeId: 'ChIJ_ejemplo_place_id', pedidosYa: 'https://www.pedidosya.com.ar',
      demora: 8, capacidad: 3, ciudad: 'Santa Rosa, La Pampa',
      envio: { activo: true, minimo: 9000, extra: 15, pyLink: 'https://envios.pedidosya.com', uberLink: 'https://m.uber.com/go/connect/',
        zonas: [{ n: 'Centro', costo: 1500 }, { n: 'Barrio Norte', costo: 2000 }, { n: 'Villa del Parque', costo: 2200 }, { n: 'Zona Sur', costo: 2500 }] },
      impresion: { ancho: '80', pie: '¡Gracias por venir! Volvé pronto' },
      modulos: { mesas: true, pared: true, ventana: true, online: true }
    },
    menu: {
      cats: ['Burgers', 'Para acompañar', 'Bebidas', 'Postres'],
      items: [
        { id: 'clasica', cat: 'Burgers', nombre: 'Clásica', desc: 'Medallón smash, cheddar, lechuga, tomate y salsa de la casa.', precio: 8900, emoji: '🍔', pasos: plancha(5), opciones: extras },
        { id: 'doble', cat: 'Burgers', nombre: 'Doble cheddar', desc: 'Dos medallones smash, doble cheddar, cebolla y pepinos.', precio: 11500, emoji: '🧀', pasos: plancha(6), opciones: extras },
        { id: 'bacon', cat: 'Burgers', nombre: 'Bacon BBQ', desc: 'Doble medallón, panceta crocante, cheddar y barbacoa.', precio: 12800, emoji: '🥓', pasos: plancha(7), opciones: extras },
        { id: 'veggie', cat: 'Burgers', nombre: 'Veggie', desc: 'Medallón de garbanzos y hongos, rúcula y alioli.', precio: 9800, emoji: '🥬', pasos: plancha(6), opciones: extras },
        { id: 'triple', cat: 'Burgers', nombre: 'Smash triple', desc: 'Tres medallones, triple cheddar. Para los que vienen con hambre.', precio: 14500, emoji: '🔥', pasos: plancha(8), opciones: extras },
        { id: 'papas', cat: 'Para acompañar', nombre: 'Papas fritas', desc: 'Bastón con cáscara y sal de la casa.', precio: 4500, emoji: '🍟',
          pasos: [{ n: 'Freidora', min: 6, est: 'Freidora' }, { n: 'Emplatado', min: 1, est: 'Armado' }],
          opciones: [{ id: 'tam', n: 'Tamaño', t: 'uno', req: true, items: [{ n: 'Regular' }, { n: 'Grande', precio: 1800 }] }] },
        { id: 'papascb', cat: 'Para acompañar', nombre: 'Papas cheddar y bacon', desc: 'Papas fritas con salsa cheddar y panceta.', precio: 6800, emoji: '🧀',
          pasos: [{ n: 'Freidora', min: 6, est: 'Freidora' }, { n: 'Gratinado', min: 2, est: 'Armado' }] },
        { id: 'aros', cat: 'Para acompañar', nombre: 'Aros de cebolla', desc: 'Rebozados en cerveza, con dip de barbacoa.', precio: 5200, emoji: '🧅',
          pasos: [{ n: 'Freidora', min: 5, est: 'Freidora' }, { n: 'Emplatado', min: 1, est: 'Armado' }] },
        { id: 'gaseosa', cat: 'Bebidas', nombre: 'Gaseosa 500 ml', desc: 'Bien fría.', precio: 2500, emoji: '🥤', pasos: [{ n: 'Servir', min: 1, est: 'Barra' }],
          opciones: [{ id: 'sabor', n: 'Sabor', t: 'uno', req: true, items: [{ n: 'Cola' }, { n: 'Cola sin azúcar' }, { n: 'Lima limón' }, { n: 'Naranja' }] }] },
        { id: 'limonada', cat: 'Bebidas', nombre: 'Limonada', desc: 'Con menta y jengibre.', precio: 3200, emoji: '🍋', pasos: [{ n: 'Preparar', min: 2, est: 'Barra' }] },
        { id: 'ipa', cat: 'Bebidas', nombre: 'Pinta IPA', desc: 'Cerveza artesanal local.', precio: 5500, emoji: '🍺', pasos: [{ n: 'Tirar', min: 2, est: 'Barra' }] },
        { id: 'brownie', cat: 'Postres', nombre: 'Brownie con helado', desc: 'Tibio, con una bocha de americana.', precio: 4200, emoji: '🍫',
          pasos: [{ n: 'Calentar', min: 2, est: 'Armado' }, { n: 'Emplatado', min: 1, est: 'Armado' }] }
      ]
    },
    // [número, x %, y %, lugares]
    mesas: [['1', 12, 22, 4], ['2', 32, 22, 4], ['3', 52, 22, 4], ['4', 72, 22, 4], ['5', 12, 62, 4], ['6', 32, 62, 4], ['7', 52, 62, 4], ['8', 80, 66, 6]],
    // Pedidos de la demo: "hace" son minutos atrás, "avance" cuántos pasos ya están hechos
    muestra: [
      { hace: 44, v: { origen: 'M', mesa: 'm5', items: [{ p: 'clasica', q: 2 }, { p: 'papas', q: 1, op: { tam: ['Grande'] } }, { p: 'gaseosa', q: 2, op: { sabor: ['Cola'] } }] }, avance: 'todo', estado: 'entregado' },
      { hace: 26, v: { origen: 'W', nombre: 'Lucía', items: [{ p: 'clasica', q: 2, op: { sin: ['Sin cebolla'] } }, { p: 'papas', q: 1, op: { tam: ['Regular'] } }], pago: { m: 'alias', ok: true } }, avance: 'todo', estado: 'entregado' },
      { hace: 17, v: { origen: 'V', nombre: 'Tomás', items: [{ p: 'doble', q: 1, op: { extras: ['Panceta'] } }, { p: 'gaseosa', q: 1, op: { sabor: ['Lima limón'] } }], pago: { m: 'efectivo', ok: true } }, avance: 'todo' },
      { hace: 14, v: { origen: 'M', mesa: 'm2', items: [{ p: 'bacon', q: 2 }, { p: 'papascb', q: 1 }, { p: 'ipa', q: 2 }] }, avance: 4 },
      { hace: 9, v: { origen: 'E', items: [{ p: 'triple', q: 1, op: { extras: ['Huevo frito'] } }, { p: 'aros', q: 1 }], ext: { app: 'PedidosYa', cadete: '2954 55-1234' }, pago: { m: 'app', ok: true } }, avance: 1 },
      { hace: 21, v: { origen: 'D', nombre: 'Caro', tel: '2954 112233', items: [{ p: 'doble', q: 2 }, { p: 'papas', q: 1, op: { tam: ['Grande'] } }], envio: { zona: 'Barrio Norte', dir: 'Pampa 845', ref: 'Portón negro, timbre 2' }, pago: { m: 'efectivo' } }, avance: 'todo', salir: { cadete: 'Nico' } },
      { hace: 12, v: { origen: 'D', nombre: 'Germán', tel: '2954 998877', items: [{ p: 'clasica', q: 1 }, { p: 'gaseosa', q: 1, op: { sabor: ['Cola'] } }], envio: { zona: 'Centro', dir: 'Rivadavia 320, 4° B', ref: 'Edificio con farmacia abajo' }, pago: { m: 'alias', ok: true } }, avance: 'todo' },
      { hace: 5, v: { origen: 'W', nombre: 'Martín', items: [{ p: 'veggie', q: 1 }, { p: 'limonada', q: 1 }], pago: { m: 'efectivo' } } },
      { hace: 2, publico: true, v: { origen: 'W', nombre: 'Sofi', tel: '2954 123456', items: [{ p: 'clasica', q: 1, op: { extras: ['Extra cheddar'] } }, { p: 'brownie', q: 1 }], pago: { m: 'alias' } } }
    ],
    muestraMesas: { m5: { estado: 'cuenta', hace: 3 }, m4: { estado: 'ocupada', hace: 6, llamado: true } }
  });
})();
