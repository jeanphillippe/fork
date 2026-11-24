/* Fork · plugin de tienda: Blue Clean
   Estilo limpio y prolijo: azul, mucho aire y tipografía liviana.
   El menú de ejemplo es de sushi: barra fría y cocina caliente separadas,
   combinados con rolls a elección y salsas por pedido, barra (B1 a B4) y mesas. */
(function () {
  var rolls = ['Philadelphia', 'New York', 'California', 'Blue roll', 'Veggie', 'Tempura roll'];
  var salsas = { id: 'salsas', n: 'Salsas', t: 'varios', max: 3, items: [{ n: 'Soja' }, { n: 'Agridulce' }, { n: 'Teriyaki' }, { n: 'Spicy mayo', precio: 600 }] };
  var sacar = { id: 'sin', n: 'Sacar', t: 'varios', items: [{ n: 'Sin palta' }, { n: 'Sin queso' }, { n: 'Sin sésamo' }] };
  var fria = function (arroz, armado, corte) {
    return [{ n: 'Arroz y alga', min: arroz, est: 'Barra fría' }, { n: 'Armado', min: armado, est: 'Barra fría' }, { n: 'Corte', min: corte, est: 'Barra fría' }];
  };
  var combinado = function (cant) {
    return [{ id: 'rolls', n: 'Rolls a elección', t: 'surtido', total: cant, prod: 'Rolls', items: rolls.map(function (r) { return { n: r }; }) }, salsas];
  };

  ForkHub.tienda({
    id: 'blue',
    nombre: 'Blue Clean',
    rubro: 'Sushi',
    emoji: '🍣',
    lema: 'Simple, fresco y prolijo',
    ejemplo: 'sushi con combinados a elección, barra fría, cocina caliente y salón',
    tema: {
      color: '#3d7bff',
      oscuro: { bg: '#070b14', pn: '#0d1424', pn2: '#131d33', pn3: '#1b2842', bd: '#22324f', tx: '#eef3ff', mu: '#8d9bb8' },
      claro: { bg: '#f3f6fc', pn: '#ffffff', pn2: '#e9eef8', pn3: '#dde5f3', bd: '#d3dcec', tx: '#0c1424', mu: '#5d6b86' },
      titulos: '"Avenir Next", Avenir, "Segoe UI", system-ui, sans-serif',
      css: '[data-tienda="blue"] .hero2{background:radial-gradient(120% 90% at 100% 0%,#3d7bff 0%,#123072 45%,#060b18 100%)}' +
        '[data-tienda="blue"] .hero2 h1{font-weight:600;letter-spacing:.01em}' +
        '[data-tienda="blue"] .pared header{background:linear-gradient(90deg,#0d1f4d,#3d7bff)}' +
        '[data-tienda="blue"] .pared .cl+.cl{background:#0b2a5c}' +
        '[data-tienda="blue"] .pared .cl+.cl .nn{color:#9cc2ff}'
    },
    textos: {
      paredPrep: 'En preparación',
      paredListo: 'Listo para retirar',
      prepTit: 'Estamos preparando tu pedido',
      listoTit: '¡Tu pedido está listo!',
      listoRetira: 'Retiralo en la barra con tu número.',
      cocinaVacia: 'Todo tranquilo. Nada en espera.',
      resena: '¿Qué tal estuvo?'
    },
    notas: ['Salsas aparte', 'Sin sésamo', 'Sin picante', 'Sin cubiertos', 'Alergia: avisar al cliente'],
    cfg: {
      direccion: 'Pellegrini 210', whatsapp: '5492954000002', instagram: 'blueclean.demo',
      alias: 'blueclean.demo', cbu: '0000003100098765432109', titular: 'Blue Clean',
      mpLink: 'https://link.mercadopago.com.ar/bluecleandemo', medios: { efectivo: true, alias: true, mp: true },
      placeId: 'ChIJ_ejemplo_place_id', pedidosYa: 'https://www.pedidosya.com.ar', uberEats: 'https://www.ubereats.com',
      demora: 12, capacidad: 3, ciudad: 'Santa Rosa, La Pampa',
      envio: { activo: true, minimo: 15000, extra: 20, pyLink: 'https://envios.pedidosya.com', uberLink: 'https://m.uber.com/go/connect/',
        zonas: [{ n: 'Centro', costo: 1800 }, { n: 'Barrio Norte', costo: 2200 }, { n: 'Villa del Parque', costo: 2500 }, { n: 'Zona Sur', costo: 2800 }] },
      impresion: { ancho: '80', pie: 'Gracias. Contanos qué te pareció en Google' },
      horarios: [[['20:00', '00:30']], [], [['20:00', '00:30']], [['20:00', '00:30']], [['20:00', '00:30']], [['20:00', '01:00']], [['20:00', '01:00']]],
      modulos: { mesas: true, pared: true, ventana: true, online: true }
    },
    menu: {
      cats: ['Combinados', 'Rolls', 'Nigiri y sashimi', 'Calientes', 'Bebidas', 'Postres'],
      items: [
        { id: 'combi16', cat: 'Combinados', nombre: 'Combinado 16 piezas', desc: 'Dos rolls a elección, 8 piezas cada uno.', precio: 17500, emoji: '🍱', pasos: fria(3, 6, 4), opciones: combinado(2) },
        { id: 'combi32', cat: 'Combinados', nombre: 'Combinado 32 piezas', desc: 'Cuatro rolls a elección. Para compartir.', precio: 33000, emoji: '🍱', pasos: fria(5, 10, 6), opciones: combinado(4) },
        { id: 'phila', cat: 'Rolls', nombre: 'Philadelphia', desc: 'Salmón, queso crema y palta. 8 piezas.', precio: 9800, emoji: '🍣', pasos: fria(2, 3, 2), opciones: [salsas, sacar] },
        { id: 'ny', cat: 'Rolls', nombre: 'New York', desc: 'Salmón y palta. 8 piezas.', precio: 9200, emoji: '🍣', pasos: fria(2, 3, 2), opciones: [salsas, sacar] },
        { id: 'cali', cat: 'Rolls', nombre: 'California', desc: 'Kanikama, palta, pepino y sésamo. 8 piezas.', precio: 8400, emoji: '🥢', pasos: fria(2, 3, 2), opciones: [salsas, sacar] },
        { id: 'blue', cat: 'Rolls', nombre: 'Blue roll', desc: 'Langostino tempura, queso y palta, cubierto de salmón flameado.', precio: 12500, emoji: '🔵',
          pasos: [{ n: 'Langostinos', min: 4, est: 'Cocina caliente' }, { n: 'Armado', min: 3, est: 'Barra fría' }, { n: 'Soplete y corte', min: 3, est: 'Barra fría' }], opciones: [salsas, sacar] },
        { id: 'veggie', cat: 'Rolls', nombre: 'Veggie', desc: 'Palta, pepino, zanahoria y queso. 8 piezas.', precio: 7600, emoji: '🥒', pasos: fria(2, 3, 2), opciones: [salsas, sacar] },
        { id: 'tempura', cat: 'Rolls', nombre: 'Tempura roll', desc: 'Frito, de salmón y queso, con teriyaki.', precio: 10200, emoji: '🍤',
          pasos: [{ n: 'Armado', min: 3, est: 'Barra fría' }, { n: 'Freidora', min: 4, est: 'Cocina caliente' }, { n: 'Corte', min: 2, est: 'Barra fría' }], opciones: [salsas, sacar] },
        { id: 'nigiri', cat: 'Nigiri y sashimi', nombre: 'Nigiri de salmón x2', desc: 'Arroz y salmón fresco.', precio: 4200, emoji: '🍣', pasos: [{ n: 'Moldeado', min: 2, est: 'Barra fría' }] },
        { id: 'sashimi', cat: 'Nigiri y sashimi', nombre: 'Sashimi de salmón x5', desc: 'Cortes finos, sin arroz.', precio: 6900, emoji: '🐟', pasos: [{ n: 'Corte', min: 3, est: 'Barra fría' }] },
        { id: 'gyozas', cat: 'Calientes', nombre: 'Gyozas x6', desc: 'De cerdo y verdeo.', precio: 6200, emoji: '🥟',
          pasos: [{ n: 'Cocción', min: 7, est: 'Cocina caliente' }, { n: 'Emplatado', min: 1, est: 'Cocina caliente' }],
          opciones: [{ id: 'coccion', n: 'Cocción', t: 'uno', req: true, items: [{ n: 'Al vapor' }, { n: 'Selladas' }] }] },
        { id: 'langos', cat: 'Calientes', nombre: 'Langostinos tempura x5', desc: 'Con salsa agridulce.', precio: 8900, emoji: '🍤', pasos: [{ n: 'Freidora', min: 5, est: 'Cocina caliente' }] },
        { id: 'miso', cat: 'Calientes', nombre: 'Sopa miso', desc: 'Tofu, algas y verdeo.', precio: 3200, emoji: '🍜', pasos: [{ n: 'Servir', min: 3, est: 'Cocina caliente' }] },
        { id: 'te', cat: 'Bebidas', nombre: 'Té verde frío', desc: 'Sin azúcar.', precio: 2800, emoji: '🍵', pasos: [{ n: 'Servir', min: 1, est: 'Barra' }] },
        { id: 'agua', cat: 'Bebidas', nombre: 'Agua 500 ml', desc: 'Con o sin gas.', precio: 1800, emoji: '💧', pasos: [{ n: 'Servir', min: 1, est: 'Barra' }],
          opciones: [{ id: 'gas', n: 'Tipo', t: 'uno', req: true, items: [{ n: 'Sin gas' }, { n: 'Con gas' }] }] },
        { id: 'cerveza', cat: 'Bebidas', nombre: 'Cerveza rubia', desc: 'Lata de 473 ml.', precio: 4500, emoji: '🍺', pasos: [{ n: 'Servir', min: 1, est: 'Barra' }] },
        { id: 'mochi', cat: 'Postres', nombre: 'Mochis x2', desc: 'De té verde y frutilla.', precio: 4600, emoji: '🍡', pasos: [{ n: 'Emplatado', min: 1, est: 'Barra fría' }] }
      ]
    },
    mesas: [['B1', 14, 6, 1], ['B2', 28, 6, 1], ['B3', 42, 6, 1], ['B4', 56, 6, 1], ['1', 10, 52, 4], ['2', 30, 52, 4], ['3', 50, 52, 4], ['4', 70, 52, 2], ['5', 82, 14, 6]],
    muestra: [
      { hace: 40, v: { origen: 'W', nombre: 'Belén', items: [{ p: 'combi16', q: 1, op: { rolls: { 'Philadelphia': 1, 'California': 1 }, salsas: ['Soja'] } }], pago: { m: 'mp', ok: true } }, avance: 'todo', estado: 'entregado' },
      { hace: 38, v: { origen: 'M', mesa: 'm8', items: [{ p: 'phila', q: 1 }, { p: 'sashimi', q: 1 }, { p: 'te', q: 2 }] }, avance: 'todo', estado: 'entregado' },
      { hace: 22, v: { origen: 'M', mesa: 'm7', items: [{ p: 'combi32', q: 1, op: { rolls: { 'Philadelphia': 2, 'Blue roll': 1, 'Tempura roll': 1 }, salsas: ['Soja', 'Teriyaki'] } }, { p: 'gyozas', q: 1, op: { coccion: ['Selladas'] } }, { p: 'cerveza', q: 2 }] }, avance: 4 },
      { hace: 16, v: { origen: 'V', nombre: 'Kevin', items: [{ p: 'phila', q: 1, op: { salsas: ['Soja'] } }, { p: 'nigiri', q: 2 }], pago: { m: 'efectivo', ok: true } }, avance: 'todo' },
      { hace: 11, v: { origen: 'E', items: [{ p: 'combi16', q: 2, op: { rolls: { 'New York': 1, 'Veggie': 1 }, salsas: ['Agridulce'] } }, { p: 'langos', q: 1 }], ext: { app: 'Uber Eats', cadete: '2954 22-3344' }, pago: { m: 'app', ok: true } }, avance: 2 },
      { hace: 18, v: { origen: 'D', nombre: 'Agus', tel: '2954 445566', items: [{ p: 'combi32', q: 1, op: { rolls: { 'Philadelphia': 2, 'California': 1, 'Veggie': 1 }, salsas: ['Soja', 'Agridulce'] } }], envio: { zona: 'Zona Sur', dir: 'Raúl B. Díaz 1020', ref: 'Dúplex del fondo' }, pago: { m: 'mp', ok: true } }, avance: 'todo', salir: { cadete: 'PedidosYa Envíos', link: 'https://envios.pedidosya.com' } },
      { hace: 6, v: { origen: 'M', mesa: 'm1', items: [{ p: 'blue', q: 1, op: { salsas: ['Spicy mayo'] } }, { p: 'miso', q: 1 }, { p: 'te', q: 1 }] } },
      { hace: 2, publico: true, v: { origen: 'W', nombre: 'Lu', tel: '2954 667788', items: [{ p: 'tempura', q: 1, op: { salsas: ['Teriyaki'], sin: ['Sin sésamo'] } }, { p: 'mochi', q: 1 }], pago: { m: 'mp' } } }
    ],
    muestraMesas: { m8: { estado: 'cuenta', hace: 4 }, m5: { estado: 'ocupada', hace: 3, llamado: true } }
  });
})();
