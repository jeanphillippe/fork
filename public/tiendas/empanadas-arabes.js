/* Fork · plugin de tienda: Empanadas Árabes (rotisería de fatay y sfiha)
   Todo para llevar: sin mesas. Se vende por docena y media docena surtidas,
   así que la cocina ve cuántas de cada sabor tiene que armar y hornear. */
(function () {
  var sabores = function (total) {
    return [{ id: 'sabores', n: 'Sabores', t: 'surtido', total: total, items: [
      { n: 'Carne' }, { n: 'Carne picante' }, { n: 'Espinaca' }, { n: 'Queso y za\'atar' }, { n: 'Pollo' }] }];
  };
  var horno = function (armado) {
    return [{ n: 'Armado', min: armado, est: 'Mesada' }, { n: 'Horno', min: 12, est: 'Horno' }, { n: 'Empaque', min: 1, est: 'Mostrador' }];
  };

  ForkHub.tienda({
    id: 'empanadas',
    nombre: 'Empanadas Árabes',
    rubro: 'Empanadas y rotisería',
    emoji: '🥟',
    lema: 'Fatay y sfiha recién salidos del horno',
    tema: {
      color: '#c4532b',
      oscuro: { bg: '#120d0a', pn: '#1d1511', pn2: '#271c16', pn3: '#33251d', bd: '#3d2d23', tx: '#f7ede2', mu: '#b39f8c' },
      claro: { bg: '#fbf4e8', pn: '#fffaf2', pn2: '#f4e8d6', pn3: '#ecdcc4', bd: '#e6d3b8', tx: '#2a1a10', mu: '#86705c' },
      titulos: 'Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, serif',
      css: '[data-tienda="empanadas"] .hero2{background-color:#a8401c;background-image:linear-gradient(135deg,#ffffff14 25%,transparent 25%),linear-gradient(225deg,#ffffff14 25%,transparent 25%),linear-gradient(45deg,#ffffff14 25%,transparent 25%),linear-gradient(315deg,#ffffff14 25%,transparent 25%);background-size:28px 28px;background-position:14px 0,14px 0,0 0,0 0}' +
        '[data-tienda="empanadas"] .hero2 h1{font-weight:700;letter-spacing:0}' +
        '[data-tienda="empanadas"] .pared header{background:#a8401c}'
    },
    textos: {
      paredPrep: 'En el horno',
      paredListo: '¡Salieron! Retirá',
      prepTit: 'Tus empanadas están en el horno',
      listoTit: '¡Tus empanadas están listas!',
      listoRetira: 'Pasá a retirarlas por el mostrador con tu número.',
      cocinaVacia: 'Horno libre. A esperar el próximo pedido.',
      tocaPedir: 'Tocá para armar tu docena',
      resena: '¿Qué tal estuvieron?'
    },
    notas: ['Bien doradas', 'Limón aparte', 'Sin picante', 'Separar por sabor', 'Para llevar lejos'],
    cfg: {
      direccion: 'Calle Belgrano 560', whatsapp: '5492954000001', instagram: 'empanadasarabes',
      alias: 'empanadas.arabes', titular: 'Empanadas Árabes', medios: { efectivo: true, alias: true, mp: false },
      demora: 10, capacidad: 4, ciudad: 'Santa Rosa, La Pampa',
      envio: { activo: true, minimo: 11500, extra: 20, pyLink: 'https://envios.pedidosya.com', uberLink: 'https://m.uber.com/go/connect/',
        zonas: [{ n: 'Centro', costo: 1500 }, { n: 'Barrio Norte', costo: 1800 }, { n: 'Villa del Parque', costo: 2000 }, { n: 'Zona Sur', costo: 2300 }, { n: 'Afueras', costo: 3500 }] },
      impresion: { ancho: '58', pie: 'Shukran! Gracias por tu compra' },
      horarios: [[['11:30', '14:30'], ['19:30', '23:30']], [], [['11:30', '14:30'], ['19:30', '23:30']], [['11:30', '14:30'], ['19:30', '23:30']],
        [['11:30', '14:30'], ['19:30', '23:30']], [['11:30', '14:30'], ['19:30', '00:00']], [['11:30', '14:30'], ['19:30', '00:00']]],
      modulos: { mesas: false, pared: true, ventana: true, online: true }
    },
    menu: {
      cats: ['Empanadas', 'Para picar', 'Dulces', 'Bebidas'],
      items: [
        { id: 'docena', cat: 'Empanadas', nombre: 'Docena surtida', desc: 'Armala con los sabores que quieras.', precio: 21000, emoji: '🥟', pasos: horno(10), opciones: sabores(12) },
        { id: 'media', cat: 'Empanadas', nombre: 'Media docena surtida', desc: 'Seis, a elección.', precio: 11500, emoji: '🥟', pasos: horno(6), opciones: sabores(6) },
        { id: 'suelta', cat: 'Empanadas', nombre: 'Empanada suelta', desc: 'Para probar o completar.', precio: 2000, emoji: '🥟', pasos: horno(2),
          opciones: [{ id: 'sabor', n: 'Sabor', t: 'uno', req: true, prod: 'Sabores', items: [{ n: 'Carne' }, { n: 'Carne picante' }, { n: 'Espinaca' }, { n: 'Queso y za\'atar' }, { n: 'Pollo' }] }] },
        { id: 'kibbe', cat: 'Para picar', nombre: 'Kibbe frito x4', desc: 'Trigo burgol y carne, crocantes por fuera.', precio: 5200, emoji: '🧆',
          pasos: [{ n: 'Freidora', min: 6, est: 'Freidora' }, { n: 'Emplatado', min: 1, est: 'Mostrador' }],
          opciones: [{ id: 'dip', n: 'Para acompañar', t: 'varios', items: [{ n: 'Yogur con pepino', precio: 800 }, { n: 'Limón' }] }] },
        { id: 'hummus', cat: 'Para picar', nombre: 'Hummus con pan árabe', desc: 'Garbanzos, tahini, limón y oliva.', precio: 4800, emoji: '🫓', pasos: [{ n: 'Emplatado', min: 2, est: 'Mesada' }] },
        { id: 'tabule', cat: 'Para picar', nombre: 'Tabule', desc: 'Perejil, burgol, tomate, menta y limón.', precio: 4500, emoji: '🥗', pasos: [{ n: 'Emplatado', min: 2, est: 'Mesada' }] },
        { id: 'baklava', cat: 'Dulces', nombre: 'Baklava x3', desc: 'Masa filo, nueces y almíbar.', precio: 3900, emoji: '🍯', pasos: [{ n: 'Empaque', min: 1, est: 'Mostrador' }] },
        { id: 'limonada', cat: 'Bebidas', nombre: 'Limonada con menta', desc: 'Hecha en el momento.', precio: 2800, emoji: '🍋', pasos: [{ n: 'Preparar', min: 2, est: 'Mostrador' }] },
        { id: 'ayran', cat: 'Bebidas', nombre: 'Ayran', desc: 'Yogur bebible salado, bien frío.', precio: 2500, emoji: '🥛', pasos: [{ n: 'Servir', min: 1, est: 'Mostrador' }] },
        { id: 'gaseosa', cat: 'Bebidas', nombre: 'Gaseosa 500 ml', desc: 'Bien fría.', precio: 2200, emoji: '🥤', pasos: [{ n: 'Servir', min: 1, est: 'Mostrador' }],
          opciones: [{ id: 'sabor', n: 'Sabor', t: 'uno', req: true, items: [{ n: 'Cola' }, { n: 'Lima limón' }, { n: 'Pomelo' }] }] }
      ]
    },
    mesas: [],
    muestra: [
      { hace: 35, v: { origen: 'W', nombre: 'Ana', items: [{ p: 'docena', q: 1, op: { sabores: { 'Carne': 6, 'Espinaca': 6 } } }], pago: { m: 'alias', ok: true } }, avance: 'todo', estado: 'entregado' },
      { hace: 19, v: { origen: 'V', nombre: 'Raúl', items: [{ p: 'media', q: 1, op: { sabores: { 'Carne picante': 3, 'Queso y za\'atar': 3 } } }, { p: 'ayran', q: 1 }], pago: { m: 'efectivo', ok: true } }, avance: 'todo' },
      { hace: 15, v: { origen: 'W', nombre: 'Clara', items: [{ p: 'docena', q: 2, op: { sabores: { 'Carne': 6, 'Pollo': 4, 'Espinaca': 2 } } }, { p: 'baklava', q: 1 }], pago: { m: 'alias', ok: true } }, avance: 1 },
      { hace: 26, v: { origen: 'D', nombre: 'Marta', tel: '2954 556677', items: [{ p: 'docena', q: 1, op: { sabores: { 'Carne': 8, 'Queso y za\'atar': 4 } } }], envio: { zona: 'Villa del Parque', dir: 'Corrientes 1450', ref: 'Casa con rejas verdes' }, pago: { m: 'efectivo' } }, avance: 'todo', salir: { cadete: 'Lucho' } },
      { hace: 13, v: { origen: 'D', nombre: 'Esteban', tel: '2954 223344', items: [{ p: 'media', q: 1, op: { sabores: { 'Carne': 3, 'Pollo': 3 } } }, { p: 'hummus', q: 1 }], envio: { zona: 'Centro', dir: 'Gil 278', ref: 'Oficina 3, preguntar en recepción' }, pago: { m: 'alias', ok: true } }, avance: 'todo' },
      { hace: 8, v: { origen: 'E', items: [{ p: 'docena', q: 1, op: { sabores: { 'Carne': 12 } } }, { p: 'kibbe', q: 1, op: { dip: ['Yogur con pepino'] } }], ext: { app: 'PedidosYa', cadete: '2954 44-9876' }, pago: { m: 'app', ok: true } } },
      { hace: 4, v: { origen: 'V', nombre: 'Jorge', items: [{ p: 'media', q: 1, op: { sabores: { 'Carne': 2, 'Carne picante': 2, 'Espinaca': 2 } } }, { p: 'suelta', q: 2, op: { sabor: ['Pollo'] } }], pago: { m: 'efectivo' } } },
      { hace: 1, publico: true, v: { origen: 'W', nombre: 'Vale', tel: '2954 334455', items: [{ p: 'docena', q: 1, op: { sabores: { 'Queso y za\'atar': 4, 'Espinaca': 4, 'Pollo': 4 } } }, { p: 'limonada', q: 2 }], pago: { m: 'alias' } } }
    ]
  });
})();
