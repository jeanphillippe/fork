/* Fork · núcleo compartido
   Este archivo lo usan las pantallas (index.html) y el Worker (worker.js).
   Toda modificación del estado de un local pasa por ForkHub.aplicar(), así
   el navegador (modo demo) y Cloudflare (modo en línea) se comportan igual.
   No tiene nada propio de ningún rubro: eso vive en los plugins de tienda
   (carpeta tiendas/), que se registran con ForkHub.tienda({...}). */
(function () {
  'use strict';

  var ESTADOS = ['nuevo', 'prep', 'listo', 'encamino', 'entregado', 'cancelado'];
  var ORIGENES = { M: 'Mesa', V: 'Ventana', W: 'Web', D: 'Envío', E: 'Externo' };
  var MEDIOS = ['efectivo', 'alias', 'mp', 'tarjeta', 'app', 'mesa'];
  var TIPOS_OP = ['uno', 'varios', 'surtido'];

  function clon(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function rid(n) {
    var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = '';
    for (var i = 0; i < (n || 8); i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function txt(v, max) { return String(v == null ? '' : v).slice(0, max || 200).trim(); }
  function num(v, min, max, def) {
    v = Number(v);
    if (!isFinite(v)) return def;
    return Math.min(max, Math.max(min, v));
  }
  function idDe(v) { return txt(v, 30).toLowerCase().replace(/[^a-z0-9_-]/g, ''); }

  /* ---------- Fecha y horarios en la zona del local ---------- */
  function partes(ahora, tz) {
    try {
      var f = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz || 'America/Argentina/Buenos_Aires', hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short'
      }).formatToParts(new Date(ahora));
      var o = {};
      f.forEach(function (p) { o[p.type] = p.value; });
      var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { dia: o.year + '-' + o.month + '-' + o.day, dow: dias[o.weekday], min: Number(o.hour) * 60 + Number(o.minute) };
    } catch (e) {
      var d = new Date(ahora);
      return { dia: d.toISOString().slice(0, 10), dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function aMin(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  // horarios: 7 elementos (0 = domingo), cada uno una lista de turnos ['19:30','00:30']
  function abierto(cfg, ahora) {
    var h = cfg && cfg.horarios;
    if (!h || !h.length) return true;
    var p = partes(ahora, cfg.tz);
    function dentro(turnos, desplaz) {
      return (turnos || []).some(function (t) {
        var a = aMin(t[0]), c = aMin(t[1]);
        if (a == null || c == null) return false;
        var m = p.min + desplaz;
        if (c <= a) c += 1440; // cruza la medianoche
        return m >= a && m < c;
      });
    }
    return dentro(h[p.dow], 0) || dentro(h[(p.dow + 6) % 7], 1440);
  }

  /* ---------- Plugins de tienda ---------- */
  var tiendas = {};
  function tienda(def) {
    if (!def || !def.id) return;
    tiendas[idDe(def.id)] = def;
  }
  // Convierte un plugin en lo que se importa a un local: configuración, menú y mesas
  // limpio: sin los datos de contacto y pago del ejemplo, para un local real
  var DATOS_EJEMPLO = ['direccion', 'whatsapp', 'instagram', 'alias', 'cbu', 'titular', 'mpLink', 'placeId', 'pedidosYa', 'uberEats'];
  function plantilla(t, nombre, limpio) {
    var base = Object.assign({}, t.cfg || {});
    if (limpio) DATOS_EJEMPLO.forEach(function (k) { delete base[k]; });
    var cfg = Object.assign(base, {
      tienda: t.id, nombre: nombre || t.nombre, emoji: t.emoji || '🍽️', lema: t.lema || '',
      color: (t.tema && t.tema.color) || '#ff6a1a'
    });
    var items = {};
    (t.menu && t.menu.items || []).forEach(function (it, i) { var c = clon(it); c.orden = i; items[it.id] = c; });
    var mesas = {};
    (t.mesas || []).forEach(function (m, i) {
      var id = 'm' + (i + 1);
      mesas[id] = { id: id, n: String(m[0]), x: m[1], y: m[2], lugares: m[3] || 4 };
    });
    return { cfg: cfg, menu: { cats: (t.menu && t.menu.cats) || [], items: items }, mesas: mesas };
  }

  /* ---------- Estado inicial ---------- */
  function nuevo(datos) {
    datos = datos || {};
    var semana = [[], [['12:00', '15:00'], ['19:30', '00:30']], [['12:00', '15:00'], ['19:30', '00:30']],
      [['12:00', '15:00'], ['19:30', '00:30']], [['12:00', '15:00'], ['19:30', '00:30']],
      [['12:00', '15:00'], ['19:30', '01:00']], [['19:30', '01:00']]];
    return {
      v: 3,
      cfg: {
        nombre: txt(datos.nombre, 60) || 'Mi local', tienda: '',
        lema: '', emoji: '🍽️', logo: '', color: '#ff6a1a',
        direccion: '', whatsapp: '', instagram: '', tz: 'America/Argentina/Buenos_Aires',
        horarios: semana, demora: 10, capacidad: 3, pausa: false,
        alias: '', cbu: '', titular: '', mpLink: '',
        medios: { efectivo: true, alias: true, mp: false },
        placeId: '', pedidosYa: '', uberEats: '',
        modulos: { mesas: true, pared: true, ventana: true, online: true },
        paredInicial: false, ciudad: '',
        envio: { activo: false, zonas: [], minimo: 0, extra: 15, pyLink: 'https://envios.pedidosya.com', uberLink: 'https://m.uber.com/go/connect/' },
        impresion: { ancho: '80', pie: '¡Gracias por tu compra!' }
      },
      menu: { cats: [], items: {} },
      mesas: {},
      pedidos: {},
      puestos: { v1: { nombre: 'Ventana 1', carrito: null } },
      seq: { dia: '', n: 0 },
      ult: 0
    };
  }
  function desdePlantilla(t, nombre, ahora, limpio) {
    var E = nuevo({ nombre: nombre || t.nombre });
    var r = aplicar(E, { o: 'importar', v: plantilla(t, nombre, limpio) }, { rol: 'admin', ahora: ahora || Date.now() });
    if (r.err) throw new Error(r.err);
    return E;
  }

  // Local de demostración armado a partir de un plugin, con pedidos en marcha
  function demo(t, ahora) {
    ahora = ahora || Date.now();
    var E = desdePlantilla(t, t.nombre, ahora);
    var ctx = { rol: 'admin', ahora: ahora, ignorarHorario: true };
    (t.muestra || []).forEach(function (m) {
      ctx.rol = m.publico ? 'publico' : 'admin';
      ctx.ahora = ahora - (m.hace || 0) * 60000;
      var r = aplicar(E, { o: 'pedido', v: m.v }, ctx);
      if (r.err) { if (typeof console !== 'undefined') console.warn('Muestra de ' + t.id + ':', r.err); return; }
      var p = r.res;
      ctx.rol = 'admin';
      var hechos = m.avance === 'todo' ? 999 : (m.avance || 0), k = 0;
      p.items.forEach(function (it, i) {
        it.pasos.forEach(function (s, j) { if (k++ < hechos) aplicar(E, { o: 'paso', id: p.id, i: i, j: j, e: 'l' }, ctx); });
      });
      if (m.estado) aplicar(E, { o: 'estado', id: p.id, e: m.estado }, ctx);
      if (m.salir) aplicar(E, { o: 'salir', id: p.id, cadete: m.salir.cadete, link: m.salir.link }, ctx);
    });
    Object.keys(t.muestraMesas || {}).forEach(function (id) {
      var x = t.muestraMesas[id], me = E.mesas[id];
      if (!me) return;
      me.estado = x.estado || 'ocupada';
      me.desde = ahora - (x.hace || 0) * 60000;
      me.llamado = x.llamado ? ahora - 60000 : 0;
    });
    return E;
  }

  /* ---------- Cálculos ---------- */
  function totalItems(items) {
    return items.reduce(function (s, it) { return s + it.precio * it.q; }, 0);
  }
  function restanteItem(it) {
    return it.pasos.reduce(function (s, p) { return s + (p.e === 'l' ? 0 : p.min); }, 0);
  }
  function restante(p) {
    return p.items.reduce(function (m, it) { return Math.max(m, restanteItem(it)); }, 0);
  }
  function activos(E) {
    return Object.keys(E.pedidos).map(function (k) { return E.pedidos[k]; })
      .filter(function (p) { return p.estado === 'nuevo' || p.estado === 'prep' || p.estado === 'listo' || p.estado === 'encamino'; })
      .sort(function (a, b) { return a.creado - b.creado; });
  }
  // Minutos estimados para que un pedido quede listo, contando la cola de cocina
  function eta(E, p) {
    if (p.estado !== 'nuevo' && p.estado !== 'prep') return 0;
    var cap = Math.max(1, E.cfg.capacidad || 3);
    var cola = activos(E).filter(function (o) { return o.estado === 'prep' && o.creado < p.creado; })
      .reduce(function (s, o) { return s + restante(o); }, 0);
    return Math.round(restante(p) + cola / cap);
  }
  function demoraActual(E) {
    var cap = Math.max(1, E.cfg.capacidad || 3);
    var cola = activos(E).filter(function (o) { return o.estado === 'prep' || o.estado === 'nuevo'; })
      .reduce(function (s, o) { return s + restante(o); }, 0);
    return Math.round((E.cfg.demora || 0) + cola / cap);
  }
  function itemsDeMesa(E, mesa) {
    return Object.keys(E.pedidos).map(function (k) { return E.pedidos[k]; })
      .filter(function (p) { return p.mesa === mesa && p.estado !== 'cancelado' && !p.cerrado; });
  }
  // Qué hay que producir ahora: suma lo pendiente de los pedidos en cocina.
  // Los surtidos (docenas, combinados) se abren por sabor o variedad.
  function produccion(E, estacion) {
    var grupos = {}, orden = [];
    function sumar(g, n, c) {
      if (!grupos[g]) { grupos[g] = {}; orden.push(g); }
      grupos[g][n] = (grupos[g][n] || 0) + c;
    }
    activos(E).filter(function (p) { return p.estado === 'prep'; }).forEach(function (p) {
      p.items.forEach(function (it) {
        var pend = it.pasos.some(function (s) { return s.e !== 'l' && (!estacion || s.est === estacion); });
        if (!pend) return;
        var sur = (it.ops || []).filter(function (o) { return o.s; });
        if (sur.length) sur.forEach(function (o) { Object.keys(o.s).forEach(function (n) { sumar(o.pg || o.g, n, o.s[n] * it.q); }); });
        else sumar(it.c || 'Otros', it.n, it.q);
      });
    });
    var cats = (E.menu && E.menu.cats) || [];
    orden.sort(function (a, b) { return cats.indexOf(a) - cats.indexOf(b); });
    return orden.map(function (g) {
      return { g: g, items: Object.keys(grupos[g]).map(function (n) { return { n: n, c: grupos[g][n] }; }).sort(function (a, b) { return b.c - a.c; }) };
    });
  }

  /* ---------- Opciones de producto ----------
     Cada producto puede tener grupos de opciones:
       uno      elegir una (punto de la carne, sabor de una empanada suelta)
       varios   elegir varias, con tope (extras, salsas, "sin cebolla")
       surtido  repartir una cantidad fija (12 sabores en una docena, 2 rolls en un combinado)
     Cada opción puede sumar precio. "prod" agrupa lo elegido en el resumen de
     producción de la cocina (por ejemplo, todos los sabores bajo "Sabores"). El cliente manda op: { idGrupo: [nombres] } o
     { idGrupo: { nombre: cantidad } } para los surtidos. */
  function limpiarOpciones(lista) {
    return (Array.isArray(lista) ? lista : []).slice(0, 8).map(function (g, i) {
      var t = TIPOS_OP.indexOf(g.t) >= 0 ? g.t : 'varios';
      var o = {
        id: idDe(g.id) || 'g' + (i + 1), n: txt(g.n, 40) || 'Opciones', t: t, req: !!g.req,
        items: (Array.isArray(g.items) ? g.items : []).slice(0, 40).map(function (x) {
          return { n: txt(x.n, 40), precio: Math.round(num(x.precio, -1e7, 1e7, 0)), agotado: !!x.agotado };
        }).filter(function (x) { return x.n; })
      };
      if (g.prod) o.prod = txt(g.prod, 40);
      if (t === 'varios') o.max = Math.round(num(g.max, 0, 40, 0));
      if (t === 'surtido') o.total = Math.round(num(g.total, 1, 999, 12));
      return o;
    }).filter(function (g) { return g.items.length; });
  }
  function linea(E, x) {
    var prod = E.menu.items[x && x.p];
    if (!prod) return { err: 'Hay un producto que ya no está en el menú' };
    if (prod.agotado) return { err: prod.nombre + ' está agotado' };
    var extra = 0, ops = [], err = '';
    var sel = (x.op && typeof x.op === 'object') ? x.op : {};
    (prod.opciones || []).forEach(function (g) {
      if (err) return;
      var v = sel[g.id];
      var buscar = function (n) { for (var i = 0; i < g.items.length; i++) if (g.items[i].n === n) return g.items[i]; return null; };
      if (g.t === 'surtido') {
        var s = {}, tot = 0;
        if (v && typeof v === 'object' && !Array.isArray(v)) Object.keys(v).forEach(function (n) {
          var it = buscar(n), c = Math.round(num(v[n], 0, 999, 0));
          if (!it || c <= 0) return;
          if (it.agotado) err = n + ' está agotado';
          s[n] = c; tot += c; extra += (it.precio || 0) * c;
        });
        if (!err && tot !== g.total) err = 'Elegí ' + g.total + ' en "' + g.n + '" de ' + prod.nombre + ' (van ' + tot + ')';
        if (!err) ops.push({ g: g.n, v: Object.keys(s).map(function (n) { return s[n] + ' ' + n; }).join(' · '), s: s, pg: g.prod || g.n });
      } else {
        var arr = Array.isArray(v) ? v : (v ? [v] : []), el = [];
        arr.forEach(function (n) { var it = buscar(n); if (it && el.indexOf(it) < 0) el.push(it); });
        if (g.t === 'uno') el = el.slice(0, 1);
        if (g.t === 'varios' && g.max) el = el.slice(0, g.max);
        if (g.req && !el.length) err = 'Elegí "' + g.n + '" para ' + prod.nombre;
        el.forEach(function (it) { if (it.agotado) err = it.n + ' está agotado'; extra += it.precio || 0; });
        if (!err && el.length) {
          var o2 = { g: g.n, v: el.map(function (it) { return it.n; }).join(', ') };
          if (g.prod && g.t === 'uno') { o2.s = {}; o2.s[el[0].n] = 1; o2.pg = g.prod; }
          ops.push(o2);
        }
      }
    });
    if (err) return { err: err };
    return {
      item: {
        p: prod.id, n: prod.nombre, e: prod.emoji || '', c: prod.cat || '', q: Math.round(num(x.q, 1, 30, 1)),
        precio: Math.max(0, prod.precio + extra), nota: txt(x.nota, 120), ops: ops, op: clon(sel),
        pasos: (prod.pasos && prod.pasos.length ? prod.pasos : [{ n: 'Preparar', min: 5, est: '' }]).map(function (s) {
          return { n: s.n, min: s.min, est: s.est || '', e: 'p', t: 0, f: 0 };
        })
      }
    };
  }

  /* ---------- Aplicar operaciones ----------
     Devuelve { res, cambios: [{c, id, v}], err }. Cada cambio reemplaza un
     documento entero, así los clientes sólo copian lo que llega. */
  var PUBLICAS = { pedido: 1, mozo: 1, cuenta: 1 };
  var ADMIN = { cfg: 1, menu: 1, mesaNueva: 1, mesaBorrar: 1, importar: 1 };

  function aplicar(E, op, ctx) {
    ctx = ctx || {};
    var rol = ctx.rol || 'publico';
    var ahora = ctx.ahora || Date.now();
    var cambios = [];
    function put(c, id) { cambios.push({ c: c, id: id, v: id == null ? clon(E[c]) : clon(E[c][id] == null ? null : E[c][id]) }); }
    function err(m) { return { err: m, cambios: [] }; }
    if (!op || typeof op.o !== 'string') return err('Operación inválida');
    if (rol === 'publico' && !PUBLICAS[op.o]) return err('No autorizado');
    if (ADMIN[op.o] && rol !== 'admin') return err('Sólo el administrador puede hacer esto');
    var cfg = E.cfg, p, m, res = null;

    // Cambio de día: reinicia la numeración y archiva lo viejo
    var hoy = partes(ahora, cfg.tz).dia;
    if (E.seq.dia !== hoy) {
      Object.keys(E.pedidos).forEach(function (k) {
        var x = E.pedidos[k];
        if ((x.estado === 'entregado' || x.estado === 'cancelado') && ahora - x.creado > 36 * 3600000) {
          delete E.pedidos[k]; cambios.push({ c: 'pedidos', id: k, v: null });
        }
      });
      E.seq = { dia: hoy, n: 0 };
      put('seq');
    }
    E.ult = ahora;

    switch (op.o) {
      case 'pedido': {
        var v = op.v || {};
        var origen = String(v.origen || 'W');
        if (!ORIGENES[origen]) return err('Origen inválido');
        if (rol === 'publico' && origen !== 'W' && origen !== 'M' && origen !== 'D') return err('Origen inválido');
        if (rol === 'publico' && (origen === 'W' || origen === 'D')) {
          if (!cfg.modulos.online) return err('Este local no toma pedidos online');
          if (cfg.pausa) return err('Estamos a full: los pedidos online están pausados un rato');
          if (!ctx.ignorarHorario && !abierto(cfg, ahora)) return err('El local está cerrado en este momento');
        }
        var envio = null;
        if (origen === 'D') {
          var ce = cfg.envio || {}, en = v.envio || {};
          if (rol === 'publico' && !ce.activo) return err('Este local no hace envíos');
          var dir = txt(en.dir, 120);
          if (!dir) return err('Falta la dirección de entrega');
          var zona = (ce.zonas || []).filter(function (z) { return z.n === en.zona; })[0];
          if (rol === 'publico' && !zona) return err('Elegí tu zona de envío');
          if (rol === 'publico' && !txt(v.tel)) return err('Dejanos un teléfono para que el cadete pueda avisarte');
          var lat = Number(en.lat), lng = Number(en.lng);
          envio = {
            zona: zona ? zona.n : txt(en.zona, 40), costo: zona ? zona.costo : Math.round(num(en.costo, 0, 1e7, 0)),
            dir: dir, ref: txt(en.ref, 120), lat: isFinite(lat) && Math.abs(lat) <= 90 && lat ? lat : null, lng: isFinite(lng) && Math.abs(lng) <= 180 && lng ? lng : null,
            cadete: '', link: '', salio: 0
          };
        }
        var mesa = null;
        if (origen === 'M') {
          mesa = String(v.mesa || '');
          if (!E.mesas[mesa]) return err('Mesa inexistente');
        }
        var items = [], e1 = '';
        (Array.isArray(v.items) ? v.items : []).slice(0, 40).forEach(function (x) {
          if (e1) return;
          var l = linea(E, x);
          if (l.err) e1 = l.err; else items.push(l.item);
        });
        if (e1) return err(e1);
        if (!items.length) return err('El pedido está vacío');
        if (envio && rol === 'publico' && cfg.envio.minimo && totalItems(items) < cfg.envio.minimo)
          return err('El pedido mínimo para envío es de $' + Number(cfg.envio.minimo).toLocaleString('es-AR'));
        E.seq.n += 1;
        var medio = v.pago && MEDIOS.indexOf(v.pago.m) >= 0 ? v.pago.m : (origen === 'M' ? 'mesa' : 'efectivo');
        var estado = 'prep';
        if (rol === 'publico' || v.autopedido) estado = 'nuevo';
        if (rol === 'publico' && origen === 'M' && E.mesas[mesa].estado !== 'libre') estado = 'prep';
        p = {
          id: rid(10), num: origen + '-' + E.seq.n, origen: origen, mesa: mesa,
          nombre: txt(v.nombre, 40), tel: txt(v.tel, 30), nota: txt(v.nota, 200),
          items: items, total: totalItems(items) + (envio ? envio.costo : 0), estado: estado, envio: envio,
          pago: { m: medio, ok: rol !== 'publico' && !!(v.pago && v.pago.ok) },
          ext: origen === 'E' && v.ext ? { app: txt(v.ext.app, 30), link: txt(v.ext.link, 300), cadete: txt(v.ext.cadete, 60) } : null,
          puesto: v.puesto ? txt(v.puesto, 20) : '',
          creado: ahora, prep: estado === 'prep' ? ahora : 0, listo: 0, entregado: 0, llamado: 0
        };
        E.pedidos[p.id] = p; put('pedidos', p.id);
        if (mesa && estado === 'prep' && E.mesas[mesa].estado === 'libre') {
          E.mesas[mesa].estado = 'ocupada'; E.mesas[mesa].desde = ahora; put('mesas', mesa);
        }
        res = clon(p);
        break;
      }
      case 'confirmar': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        if (p.estado !== 'nuevo') return err('El pedido ya estaba confirmado');
        p.estado = 'prep'; p.prep = ahora;
        if (op.pago) { p.pago.m = MEDIOS.indexOf(op.pago.m) >= 0 ? op.pago.m : p.pago.m; p.pago.ok = !!op.pago.ok; }
        put('pedidos', p.id);
        if (p.mesa && E.mesas[p.mesa] && E.mesas[p.mesa].estado === 'libre') {
          E.mesas[p.mesa].estado = 'ocupada'; E.mesas[p.mesa].desde = ahora; put('mesas', p.mesa);
        }
        break;
      }
      case 'paso': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        var it = p.items[op.i], s = it && it.pasos[op.j];
        if (!s) return err('Paso inexistente');
        var e = op.e === 'h' || op.e === 'l' ? op.e : 'p';
        s.e = e;
        if (e === 'h') { s.t = s.t || ahora; s.f = 0; }
        if (e === 'l') { s.t = s.t || ahora; s.f = ahora; }
        if (e === 'p') { s.t = 0; s.f = 0; }
        if (p.estado === 'nuevo') { p.estado = 'prep'; p.prep = ahora; }
        var todo = p.items.every(function (x) { return x.pasos.every(function (y) { return y.e === 'l'; }); });
        if (todo && p.estado === 'prep') { p.estado = 'listo'; p.listo = ahora; }
        if (!todo && p.estado === 'listo') { p.estado = 'prep'; p.listo = 0; }
        put('pedidos', p.id);
        break;
      }
      case 'estado': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        if (ESTADOS.indexOf(op.e) < 0) return err('Estado inválido');
        p.estado = op.e;
        if (op.e === 'prep') { p.prep = p.prep || ahora; p.listo = 0; }
        if (op.e === 'listo') {
          p.listo = ahora;
          p.items.forEach(function (x) { x.pasos.forEach(function (y) { if (y.e !== 'l') { y.e = 'l'; y.t = y.t || ahora; y.f = ahora; } }); });
        }
        if (op.e === 'entregado') { p.entregado = ahora; p.llamado = 0; }
        put('pedidos', p.id);
        break;
      }
      case 'salir': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        if (p.origen !== 'D' || !p.envio) return err('Ese pedido no es para enviar');
        if (p.estado !== 'listo' && p.estado !== 'encamino') return err('Primero tiene que estar listo');
        p.estado = 'encamino';
        p.envio.cadete = txt(op.cadete, 40) || 'Cadete';
        p.envio.link = txt(op.link, 300);
        p.envio.salio = ahora;
        p.llamado = 0;
        put('pedidos', p.id);
        break;
      }
      case 'pago': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        if (MEDIOS.indexOf(op.m) >= 0) p.pago.m = op.m;
        p.pago.ok = !!op.ok;
        put('pedidos', p.id);
        break;
      }
      case 'llamar': {
        p = E.pedidos[op.id];
        if (!p) return err('Pedido inexistente');
        p.llamado = ahora;
        put('pedidos', p.id);
        break;
      }
      case 'mesa': {
        m = E.mesas[op.id];
        if (!m) return err('Mesa inexistente');
        var pv = op.v || {};
        if (pv.estado && ['libre', 'ocupada', 'cuenta'].indexOf(pv.estado) >= 0) {
          if (pv.estado !== m.estado) m.desde = ahora;
          m.estado = pv.estado;
          if (pv.estado === 'libre') m.llamado = 0;
        }
        if (pv.x != null) m.x = num(pv.x, 0, 94, m.x);
        if (pv.y != null) m.y = num(pv.y, 0, 90, m.y);
        if (pv.n != null) m.n = txt(pv.n, 6) || m.n;
        if (pv.lugares != null) m.lugares = Math.round(num(pv.lugares, 1, 30, m.lugares));
        put('mesas', m.id);
        break;
      }
      case 'mozo': case 'cuenta': case 'atendido': {
        m = E.mesas[op.mesa];
        if (!m) return err('Mesa inexistente');
        if (op.o === 'mozo') m.llamado = ahora;
        if (op.o === 'cuenta') { if (m.estado === 'libre') return err('La mesa figura libre'); m.estado = 'cuenta'; m.desde = ahora; }
        if (op.o === 'atendido') m.llamado = 0;
        put('mesas', m.id);
        break;
      }
      case 'cerrarMesa': {
        m = E.mesas[op.mesa];
        if (!m) return err('Mesa inexistente');
        itemsDeMesa(E, m.id).forEach(function (x) {
          x.cerrado = ahora;
          x.pago = { m: MEDIOS.indexOf(op.m) >= 0 ? op.m : 'efectivo', ok: true };
          if (x.estado === 'nuevo') x.estado = 'cancelado';
          else if (x.estado !== 'cancelado') { x.estado = 'entregado'; x.entregado = x.entregado || ahora; }
          put('pedidos', x.id);
        });
        m.estado = 'libre'; m.llamado = 0; m.desde = ahora;
        put('mesas', m.id);
        break;
      }
      case 'carrito': {
        var pid = String(op.puesto || '');
        if (!E.puestos[pid]) E.puestos[pid] = { nombre: pid, carrito: null };
        var cv = op.v;
        E.puestos[pid].carrito = cv && Array.isArray(cv.items) ? {
          items: cv.items.slice(0, 40).map(function (x) {
            var l = linea(E, x);
            if (l.err) return null;
            delete l.item.pasos; delete l.item.op;
            return l.item;
          }).filter(Boolean),
          medio: txt(cv.medio, 20), fase: txt(cv.fase, 20), num: txt(cv.num, 12), t: ahora
        } : null;
        if (E.puestos[pid].carrito) E.puestos[pid].carrito.total = totalItems(E.puestos[pid].carrito.items);
        put('puestos', pid);
        break;
      }
      case 'pausa': {
        cfg.pausa = !!op.v;
        put('cfg');
        break;
      }
      case 'agotado': {
        var pr = E.menu.items[op.id];
        if (!pr) return err('Producto inexistente');
        if (op.g) {
          // Una opción agotada (un sabor, un roll) se agota en todos los productos que la ofrecen
          var gr = (pr.opciones || []).filter(function (g) { return g.id === op.g; })[0];
          if (!gr || !gr.items.some(function (x) { return x.n === op.n; })) return err('Opción inexistente');
          var clave = gr.prod || gr.n;
          Object.keys(E.menu.items).forEach(function (k) {
            (E.menu.items[k].opciones || []).forEach(function (g) {
              if ((g.prod || g.n) !== clave) return;
              g.items.forEach(function (x) { if (x.n === op.n) x.agotado = !!op.v; });
            });
          });
        } else pr.agotado = !!op.v;
        put('menu');
        break;
      }
      case 'cfg': {
        var nv = op.v || {};
        var permitidas = ['nombre', 'tienda', 'ciudad', 'envio', 'impresion', 'lema', 'emoji', 'logo', 'color', 'direccion', 'whatsapp', 'instagram', 'tz', 'horarios',
          'demora', 'capacidad', 'pausa', 'alias', 'cbu', 'titular', 'mpLink', 'medios', 'placeId', 'pedidosYa', 'uberEats', 'modulos', 'paredInicial'];
        Object.keys(nv).forEach(function (k) {
          if (permitidas.indexOf(k) < 0) return;
          var x = nv[k];
          if (k === 'demora') x = Math.round(num(x, 0, 180, 10));
          else if (k === 'capacidad') x = Math.round(num(x, 1, 20, 3));
          else if (k === 'pausa' || k === 'paredInicial') x = !!x;
          else if (k === 'tienda') x = idDe(x);
          else if (k === 'envio') {
            x = x || {};
            x = {
              activo: !!x.activo, minimo: Math.round(num(x.minimo, 0, 1e9, 0)), extra: Math.round(num(x.extra, 0, 240, 15)),
              pyLink: txt(x.pyLink, 300), uberLink: txt(x.uberLink, 300),
              zonas: (Array.isArray(x.zonas) ? x.zonas : []).slice(0, 40).map(function (z) { return { n: txt(z && z.n, 40), costo: Math.round(num(z && z.costo, 0, 1e7, 0)) }; }).filter(function (z) { return z.n; })
            };
          } else if (k === 'impresion') {
            x = x || {};
            x = { ancho: ['58', '80', 'a4'].indexOf(String(x.ancho)) >= 0 ? String(x.ancho) : '80', pie: txt(x.pie, 200) };
          }
          else if (k === 'horarios') {
            if (!Array.isArray(x) || x.length !== 7) return;
            x = x.map(function (d) { return (Array.isArray(d) ? d : []).slice(0, 4).filter(function (t) { return aMin(t[0]) != null && aMin(t[1]) != null; }).map(function (t) { return [t[0], t[1]]; }); });
          } else if (k === 'medios' || k === 'modulos') {
            var o = {}; Object.keys(x || {}).forEach(function (q) { o[q] = !!x[q]; }); x = Object.assign({}, cfg[k], o);
          } else x = txt(x, k === 'logo' || k === 'mpLink' || k === 'pedidosYa' || k === 'uberEats' ? 400 : 120);
          cfg[k] = x;
        });
        put('cfg');
        break;
      }
      case 'menu': {
        var mv = op.v || {};
        var cats = (Array.isArray(mv.cats) ? mv.cats : []).map(function (c) { return txt(c, 40); }).filter(Boolean).slice(0, 30);
        var its = {};
        Object.keys(mv.items || {}).slice(0, 300).forEach(function (k, i) {
          var x = mv.items[k];
          if (!x || !txt(x.nombre)) return;
          var id = idDe(x.id || k) || rid(6);
          its[id] = {
            id: id, cat: txt(x.cat, 40), nombre: txt(x.nombre, 60), desc: txt(x.desc, 200),
            precio: Math.round(num(x.precio, 0, 1e9, 0)), emoji: txt(x.emoji, 8), foto: txt(x.foto, 400),
            agotado: !!x.agotado, orden: num(x.orden, 0, 1e4, i),
            pasos: (Array.isArray(x.pasos) ? x.pasos : []).slice(0, 12).map(function (s) {
              return { n: txt(s.n, 30) || 'Paso', min: Math.round(num(s.min, 0, 240, 1)), est: txt(s.est, 30) };
            }),
            opciones: limpiarOpciones(x.opciones)
          };
        });
        E.menu = { cats: cats, items: its };
        put('menu');
        break;
      }
      case 'mesaNueva': {
        var n = Object.keys(E.mesas).length + 1, id;
        do { id = 'm' + rid(4); } while (E.mesas[id]);
        E.mesas[id] = { id: id, n: String(n), lugares: 4, x: 10 + (n * 9) % 80, y: 40, estado: 'libre', llamado: 0, desde: 0 };
        put('mesas', id);
        res = id;
        break;
      }
      case 'mesaBorrar': {
        if (!E.mesas[op.id]) return err('Mesa inexistente');
        delete E.mesas[op.id];
        cambios.push({ c: 'mesas', id: op.id, v: null });
        break;
      }
      case 'importar': {
        var x2 = op.v;
        if (!x2 || !x2.cfg || !x2.menu) return err('El archivo no es un respaldo de Fork');
        var base = nuevo({ nombre: x2.cfg.nombre });
        var r1 = aplicar(base, { o: 'cfg', v: x2.cfg }, { rol: 'admin', ahora: ahora });
        var r2 = aplicar(base, { o: 'menu', v: x2.menu }, { rol: 'admin', ahora: ahora });
        if (r1.err || r2.err) return err('Respaldo dañado');
        E.cfg = base.cfg; E.menu = base.menu;
        E.mesas = {};
        Object.keys(x2.mesas || {}).slice(0, 200).forEach(function (k) {
          var q = x2.mesas[k], kid = idDe(k) || 'm' + rid(4);
          E.mesas[kid] = { id: kid, n: txt(q.n, 6), lugares: Math.round(num(q.lugares, 1, 30, 4)), x: num(q.x, 0, 94, 10), y: num(q.y, 0, 90, 10), estado: 'libre', llamado: 0, desde: 0 };
        });
        put('cfg'); put('menu'); put('mesas');
        break;
      }
      case 'limpiar': {
        Object.keys(E.pedidos).forEach(function (k) {
          var x = E.pedidos[k];
          if (x.estado === 'entregado' || x.estado === 'cancelado') { delete E.pedidos[k]; cambios.push({ c: 'pedidos', id: k, v: null }); }
        });
        break;
      }
      default:
        return err('Operación desconocida: ' + op.o);
    }
    return { res: res, cambios: cambios };
  }

  // Aplica un cambio que llegó del servidor o de otra pestaña
  function cambiar(E, ch) {
    if (ch.id == null) E[ch.c] = ch.v;
    else {
      if (!E[ch.c]) E[ch.c] = {};
      if (ch.v === null) delete E[ch.c][ch.id];
      else E[ch.c][ch.id] = ch.v;
    }
  }

  // Lo que puede ver alguien sin PIN: sin nombres, teléfonos ni datos de pago
  function pedidoPublico(p) {
    if (!p) return p;
    return {
      id: p.id, num: p.num, origen: p.origen, mesa: p.mesa, estado: p.estado, total: p.total,
      inicial: p.nombre ? p.nombre.charAt(0).toUpperCase() : '',
      items: p.items, creado: p.creado, prep: p.prep, listo: p.listo, entregado: p.entregado, llamado: p.llamado,
      cerrado: p.cerrado || 0, pago: { m: p.pago.m, ok: p.pago.ok },
      // Del envío sólo va lo que necesita el seguimiento: nunca la dirección
      envio: p.envio ? { zona: p.envio.zona, costo: p.envio.costo, cadete: p.envio.cadete, link: p.envio.link, salio: p.envio.salio } : null
    };
  }
  function publico(E) {
    var o = { v: E.v, cfg: E.cfg, menu: E.menu, mesas: {}, pedidos: {}, puestos: {}, seq: E.seq, ult: 0 };
    Object.keys(E.mesas).forEach(function (k) { var m = E.mesas[k]; o.mesas[k] = { id: m.id, n: m.n, estado: m.estado, llamado: m.llamado }; });
    Object.keys(E.pedidos).forEach(function (k) {
      var p = E.pedidos[k];
      var fin = p.entregado || p.cerrado || (p.estado === 'cancelado' ? p.creado : 0);
      if (fin && Date.now() - fin > 6 * 3600000) return;
      o.pedidos[k] = pedidoPublico(p);
    });
    return o;
  }
  function cambioPublico(ch) {
    if (ch.c === 'puestos') return null;
    if (ch.c === 'pedidos') return { c: ch.c, id: ch.id, v: ch.v ? pedidoPublico(ch.v) : null };
    if (ch.c === 'mesas') return ch.id == null ? null : { c: 'mesas', id: ch.id, v: ch.v ? { id: ch.v.id, n: ch.v.n, estado: ch.v.estado, llamado: ch.v.llamado } : null };
    return ch;
  }

  var ForkHub = {
    version: '1.2.0',
    ORIGENES: ORIGENES, ESTADOS: ESTADOS,
    tienda: tienda, tiendas: tiendas, plantilla: plantilla, desdePlantilla: desdePlantilla,
    nuevo: nuevo, demo: demo, aplicar: aplicar, cambiar: cambiar, linea: linea,
    publico: publico, cambioPublico: cambioPublico, pedidoPublico: pedidoPublico,
    abierto: abierto, partes: partes, eta: eta, demoraActual: demoraActual, restante: restante,
    activos: activos, itemsDeMesa: itemsDeMesa, totalItems: totalItems, produccion: produccion, rid: rid, clon: clon
  };
  (typeof globalThis !== 'undefined' ? globalThis : self).ForkHub = ForkHub;
})();
