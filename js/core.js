/* =========================================================
   ConectaLSA · Núcleo
   Perfiles (familia / aula en un mismo dispositivo), progreso, puntos, estrellas,
   logros, avatares, ajustes, sonido/vibración y utilidades.
   Todo queda en el dispositivo. Sin cuentas, sin servidores, sin terceros.
   Mejora sobre ComuSeñas: el progreso no se pierde (almacenamiento persistente +
   copia de seguridad exportable) y los ajustes se aplican de verdad.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";

  var KEY = "conectalsa-v1";
  App.VERSION = "1.1.1";

  function defaultSettings() {
    return { sound: true, vibration: true, theme: "auto", fs: "100", contrast: "normal", motion: "auto",
             vision: "estandar", mirrorVideos: false, videoSpeed: 1, camera: true };
  }
  /* Perfiles visuales pensados para distintas discapacidades.
     "oscuro" y "contraste" también se reflejan en data-theme / data-contrast. */
  App.VISIONES = [
    { id: "estandar",  name: "Estándar",       ico: "sol",       desc: "Claro y colorido. Para la mayoría.", col: ["#F0F5FC", "#1553C4", "#12A3E3"] },
    { id: "oscuro",    name: "Oscuro",         ico: "luna",      desc: "Menos luz de pantalla, ideal de noche.", col: ["#0A1322", "#7FB2FF", "#6FD0F5"] },
    { id: "contraste", name: "Alto contraste", ico: "contraste", desc: "Negro sobre blanco. Baja visión, cataratas.", col: ["#FFFFFF", "#000000", "#0A3F94"] },
    { id: "daltonico", name: "Daltonismo",     ico: "daltonico", desc: "Sin rojo ni verde: azul, ocre y violeta.", col: ["#F2F5F9", "#0072B2", "#E69F00"] },
    { id: "calma",     name: "Calma",          ico: "calma",     desc: "Tonos suaves y sin movimiento. Autismo y TDAH.", col: ["#F5F2EA", "#33556E", "#6E93A8"] }
  ];
  function newProfile(name, avatar, hand, goal) {
    return { id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name || "Yo", avatar: avatar || "fox",
             hand: hand || "right", goal: goal || 30, created: Date.now(), pin: null, xp: 0, days: {}, stars: {}, items: {}, aiOk: 0,
             spelled: 0, written: { ok: 0, fail: 0 }, reviews: 0, badges: {}, seconds: 0 };
  }
  function defaults() { return { version: 1, profiles: {}, order: [], current: null, locked: false, settings: defaultSettings(), ref: { enabled: false, pin: "" } }; }

  function merge(base, extra) {
    if (!extra || typeof extra !== "object") return base;
    Object.keys(extra).forEach(function (k) {
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])) merge(base[k], extra[k]);
      else base[k] = extra[k];
    });
    return base;
  }

  var S = defaults();
  try { var raw = localStorage.getItem(KEY); if (raw) S = merge(defaults(), JSON.parse(raw)); } catch (e) {}
  // Compatibilidad: versiones anteriores guardaban solo theme/contrast, sin perfil visual.
  (function migrarVision() {
    var st = S.settings;
    if (App.VISIONES.some(function (v) { return v.id === st.vision; })) return;
    st.vision = st.contrast === "high" ? "contraste" : (st.theme === "dark" ? "oscuro" : "estandar");
  })();
  // Pedimos almacenamiento persistente: el navegador no borra el progreso para liberar espacio.
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  var listeners = [];
  App.state = function () { return S; };
  App.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { App.toast("No se pudo guardar: el almacenamiento está lleno"); }
    listeners.forEach(function (fn) { try { fn(S); } catch (e) {} });
  };
  App.onChange = function (fn) { listeners.push(fn); };

  /* ---------- Perfiles ---------- */
  App.P = function () { return S.current && S.profiles[S.current] || null; };
  App.profiles = function () { return S.order.map(function (id) { return S.profiles[id]; }).filter(Boolean); };
  App.createProfile = function (o) {
    var p = newProfile(o.name, o.avatar, o.hand, o.goal);
    S.profiles[p.id] = p; S.order.push(p.id);
    App.unlock(p.id);   // quien crea el perfil entra directo
    return p;
  };
  App.switchProfile = function (id) { if (S.profiles[id]) { S.current = id; App.save(); } };
  App.deleteProfile = function (id) {
    delete S.profiles[id]; S.order = S.order.filter(function (x) { return x !== id; });
    if (S.current === id) S.current = S.order[0] || null; App.save();
  };
  App.resetProfile = function (id) {
    var p = S.profiles[id]; if (!p) return;
    var fresh = newProfile(p.name, p.avatar, p.hand, p.goal); fresh.id = p.id; fresh.created = p.created;
    S.profiles[id] = fresh; App.save();
  };
  /** Copia de seguridad del perfil (archivo). Corrige el «progreso perdido» reportado en ComuSeñas. */
  App.exportProfile = function (id) {
    var p = S.profiles[id || S.current]; if (!p) return;
    App.download("conectalsa-respaldo-" + p.name.replace(/[^\wñÑáéíóúÁÉÍÓÚ-]+/g, "_") + "-" + App.today() + ".json",
      JSON.stringify({ app: "conectalsa", type: "profile-backup", version: 1, exported: new Date().toISOString(), profile: p }), "application/json");
  };
  App.importProfile = function (text) {
    var m = JSON.parse(text);
    if (!m || m.type !== "profile-backup" || !m.profile) throw new Error("Archivo no válido");
    var p = merge(newProfile(), m.profile);
    if (S.profiles[p.id] && !confirm("Ya existe este perfil en el dispositivo. ¿Reemplazarlo por la copia?")) p.id = newProfile().id;
    if (!S.profiles[p.id]) S.order.push(p.id);
    S.profiles[p.id] = p; S.current = p.id; App.save(); return p;
  };

  /* ---------- Fechas, tiempo y racha ---------- */
  function dkey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  App.today = function () { return dkey(new Date()); };
  App.todayXp = function (p) { p = p || App.P(); return p ? (p.days[App.today()] || 0) : 0; };
  App.streak = function (p) {
    p = p || App.P(); if (!p) return 0;
    var n = 0, d = new Date();
    if (!p.days[dkey(d)]) d.setDate(d.getDate() - 1);
    while (p.days[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };
  // tiempo de práctica (para el panel de familias y docentes)
  var lastTick = Date.now();
  setInterval(function () {
    var p = App.P(); var now = Date.now();
    if (p && document.visibilityState === "visible" && now - lastTick < 20000) { p.seconds = (p.seconds || 0) + Math.round((now - lastTick) / 1000); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
    lastTick = now;
  }, 15000);

  /* ---------- Puntos, señas y estrellas ---------- */
  App.addXp = function (n) {
    var p = App.P(); if (!p || !n) return;
    p.xp += n; p.days[App.today()] = (p.days[App.today()] || 0) + n;
    App.checkBadges(); App.save();
  };
  /** Registro por seña: vista, escritura, práctica, IA, repaso. Alimenta el repaso inteligente. */
  App.track = function (id, ev) {
    var p = App.P(); if (!p) return;
    var r = p.items[id] = p.items[id] || { seen: 0, wOk: 0, wFail: 0, self: "", ai: 0, box: 0, due: 0, last: 0 };
    r.last = Date.now();
    if (ev === "seen") r.seen++;
    else if (ev === "write-ok") { r.wOk++; p.written.ok++; }
    else if (ev === "write-fail") { r.wFail++; p.written.fail++; }
    else if (ev === "ai") { r.ai++; p.aiOk++; }
    else if (ev === "ok" || ev === "casi" || ev === "rep") r.self = ev;
    // Repaso espaciado (cajas de Leitner): lo que cuesta vuelve pronto, lo que sale se espacia.
    if (ev === "ok" || ev === "ai" || ev === "write-ok") { r.box = Math.min(5, (r.box || 0) + 1); }
    if (ev === "casi") { r.box = Math.max(1, r.box || 1); }
    if (ev === "rep" || ev === "write-fail") { r.box = 0; }
    var days = [0, 1, 2, 4, 7, 14][r.box || 0];
    r.due = Date.now() + days * 864e5;
    App.save();
  };
  App.dueItems = function () {
    var p = App.P(); if (!p) return [];
    var now = Date.now();
    return Object.keys(p.items).filter(function (id) { var r = p.items[id]; return App.CONTENT.ITEMS[id] && r.due <= now && (r.seen > 0); })
      .sort(function (a, b) { return (p.items[a].box - p.items[b].box) || (p.items[a].due - p.items[b].due); });
  };
  App.mastered = function (id) { var p = App.P(), r = p && p.items[id]; return !!(r && (r.box >= 3 || r.ai > 0)); };
  App.setStars = function (key, n) {
    var p = App.P(); if (!p) return false;
    var first = !p.stars[key];
    p.stars[key] = Math.max(p.stars[key] || 0, n); App.checkBadges(); App.save(); return first;
  };
  App.totalStars = function (p) { p = p || App.P(); return p ? Object.keys(p.stars).reduce(function (s, k) { return s + p.stars[k]; }, 0) : 0; };

  /* ---------- Aviso de versión de prueba ----------
     Se muestra mientras falten videos validados. Desaparece solo cuando están todos. */
  App.betaNote = function (ids, compact) {
    if (!App.Media || !App.Media.status) return "";
    var s = App.Media.status(ids);
    if (s.complete) return "";
    var cuenta = s.videos + " de " + s.total + (s.total === 1 ? " seña" : " señas") + " con video" + (s.videos ? " (" + s.validated + " validadas)" : "");
    if (compact) return '<div class="beta-note compact" role="note"><strong><span class="ico">' + App.ico("alerta") + '</span> Versión de prueba.</strong> ' +
      (ids ? "En este nivel hay " : "Hay ") + cuenta + '. Sin video, el desafío es de memoria: pedile a una persona sorda o a tu docente que te muestre las señas.</div>';
    return '<div class="beta-note" role="note"><strong><span class="ico">' + App.ico("alerta") + '</span> Versión de prueba</strong><p>Los videos de las señas los están grabando y validando <strong>referentes sordos</strong>. Por ahora hay ' + cuenta + '.</p>' +
      '<p>Mientras tanto podés recorrer los niveles, practicar el deletreo y autoevaluarte. Para aprender cada seña, pedile a una persona sorda o a tu docente que te la muestre.</p>' +
      '<a class="link small" href="#/acerca">Ver el estado del contenido</a></div>';
  };

  /* ---------- Avatares (se desbloquean con estrellas) ---------- */
  App.AVATARS = [
    { id: "fox", ico: "🦊", name: "Zorro", stars: 0 }, { id: "cat", ico: "🐱", name: "Gato", stars: 0 },
    { id: "owl", ico: "🦉", name: "Búho", stars: 0 }, { id: "llama", ico: "🦙", name: "Llama", stars: 0 },
    { id: "frog", ico: "🐸", name: "Rana", stars: 3 }, { id: "panda", ico: "🐼", name: "Panda", stars: 6 },
    { id: "puma", ico: "🐆", name: "Puma", stars: 10 }, { id: "condor", ico: "🦅", name: "Cóndor", stars: 15 },
    { id: "octo", ico: "🐙", name: "Pulpo", stars: 20 }, { id: "unicorn", ico: "🦄", name: "Unicornio", stars: 30 },
    { id: "dragon", ico: "🐉", name: "Dragón", stars: 45 }, { id: "rocket", ico: "🚀", name: "Cohete", stars: 60 }
  ];
  App.avatar = function (id) { for (var i = 0; i < App.AVATARS.length; i++) if (App.AVATARS[i].id === id) return App.AVATARS[i]; return App.AVATARS[0]; };

  /* ---------- Logros ---------- */
  App.BADGES = [
    { id: "inicio", ico: "meta", name: "Primer paso", desc: "Terminá tu primera lección", test: function (p) { return Object.keys(p.stars).length >= 1; } },
    { id: "vocales", ico: "letras", name: "Vocales", desc: "Completá el nivel Vocales", test: function () { return App.levelProgress("vocales").pct >= 1; } },
    { id: "abc", ico: "letras", name: "Abecedario", desc: "Completá los 4 niveles de consonantes", test: function () { return ["cons1", "cons2", "cons3", "cons4"].every(function (l) { return App.levelProgress(l).pct >= 1; }); } },
    { id: "colores", ico: "paleta", name: "Arcoíris", desc: "Completá el nivel Colores", test: function () { return App.levelProgress("colores").pct >= 1; } },
    { id: "calendario", ico: "calendario", name: "Calendario", desc: "Completá Días y Meses", test: function () { return App.levelProgress("dias").pct >= 1 && App.levelProgress("meses").pct >= 1; } },
    { id: "cortes", ico: "mano-dos", name: "Buena onda", desc: "Completá los 2 niveles de saludos y cortesía", test: function () { return App.levelProgress("saludos1").pct >= 1 && App.levelProgress("saludos2").pct >= 1; } },
    { id: "ia", ico: "mano", name: "Mano firme", desc: "10 señas reconocidas por la cámara", test: function (p) { return p.aiOk >= 10; } },
    { id: "escritura", ico: "texto", name: "Buena letra", desc: "20 respuestas escritas correctas", test: function (p) { return p.written.ok >= 20; } },
    { id: "deletreo", ico: "dado", name: "Deletreador/a", desc: "Deletreá 3 palabras", test: function (p) { return p.spelled >= 3; } },
    { id: "repaso", ico: "repaso", name: "Memoria de elefante", desc: "Hacé 3 sesiones de repaso", test: function (p) { return p.reviews >= 3; } },
    { id: "racha3", ico: "fuego", name: "Constancia", desc: "Racha de 3 días", test: function (p) { return App.streak(p) >= 3; } },
    { id: "estrellas", ico: "estrella-llena", name: "Coleccionista", desc: "Juntá 30 estrellas", test: function (p) { return App.totalStars(p) >= 30; } }
  ];
  App.checkBadges = function () {
    var p = App.P(); if (!p || !App.CONTENT) return;
    App.BADGES.forEach(function (b) {
      var ok = false; try { ok = b.test(p); } catch (e) {}
      if (!p.badges[b.id] && ok) {
        p.badges[b.id] = Date.now();
        setTimeout(function () { App.toast("Logro desbloqueado: " + b.name); App.fx("win"); }, 400);
      }
    });
  };

  /* ---------- Utilidades DOM ---------- */
  App.$ = function (s, r) { return (r || document).querySelector(s); };
  App.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  App.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  App.el = function (html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  App.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  App.sample = function (a, n) { return App.shuffle(a).slice(0, n); };
  App.toast = function (msg, ms) {
    var z = document.getElementById("toasts"); if (!z) return;
    var t = App.el('<div class="toast" role="status"></div>'); t.textContent = msg; z.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2600);
  };
  /** Compara respuestas escritas con tolerancia: mayúsculas, tildes, signos y espacios no importan.
   *  Corrige el «escribo bien y me pone mal» reportado en ComuSeñas. */
  App.norm = function (s) {
    return String(s || "").toLowerCase().replace(/ñ/g, "\u0001").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0001/g, "ñ").replace(/[¿?¡!.,;:"'()\-]/g, " ").replace(/\s+/g, " ").trim();
  };
  /** Error de tipeo de una letra en palabras largas (≥5 letras): se acepta y se muestra la forma correcta. */
  App.nearMiss = function (typed, item) {
    var a = App.norm(typed).replace(/ /g, ""); if (!a) return false;
    return [item.write].concat(item.alt || []).some(function (w) {
      var b = App.norm(w).replace(/ /g, ""); if (b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
      var prev = [], i, j; for (j = 0; j <= b.length; j++) prev[j] = j;
      for (i = 1; i <= a.length; i++) { var cur = [i]; for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
      return prev[b.length] === 1;
    });
  };
  App.answerOk = function (typed, item) {
    var t = App.norm(typed); if (!t) return false;
    return [item.write || item.label].concat(item.alt || []).some(function (a) { return App.norm(a) === t; });
  };

  /* ---------- Sonido y vibración (respetan los ajustes de verdad) ---------- */
  var actx = null;
  function tone(freq, dur, when, type, vol) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      var t0 = actx.currentTime + (when || 0);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  App.fx = function (kind) {
    var st = S.settings;
    if (st.sound) {
      if (kind === "ok") { tone(660, .12); tone(880, .16, .1); }
      else if (kind === "bad") tone(220, .18, 0, "triangle", .08);
      else if (kind === "win") { tone(523, .12); tone(659, .12, .1); tone(784, .2, .2); }
      else if (kind === "tick") tone(1200, .04, 0, "sine", .05);
    }
    if (st.vibration && navigator.vibrate) { try { navigator.vibrate(kind === "ok" ? 30 : kind === "bad" ? [40, 60, 40] : kind === "win" ? [30, 50, 30, 50, 60] : 10); } catch (e) {} }
  };

  /* ---------- Apariencia ---------- */
  App.applySettings = function () {
    var st = S.settings, r = document.documentElement;
    var vision = App.VISIONES.some(function (v) { return v.id === st.vision; }) ? st.vision : "estandar";
    // Cada perfil visual implica tema y contraste; el perfil "auto" ya no existe:
    // se conserva el modo del sistema solo si la persona eligió "estandar" y el sistema está en oscuro.
    var sigueSistema = st.theme === "auto" && (vision === "estandar" || vision === "contraste");
    var prefiereOscuro = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = vision === "oscuro" || (sigueSistema && prefiereOscuro);
    var alto = vision === "contraste" || st.contrast === "high";
    r.dataset.theme = dark ? "dark" : "light";
    r.dataset.contrast = alto ? "high" : "normal";
    r.dataset.vision = (vision === "oscuro" || vision === "contraste") ? "estandar" : vision;
    r.dataset.fs = st.fs; r.dataset.motion = st.motion;
    var colores = { estandar: dark ? "#0A1322" : "#0A3F94", oscuro: "#0A1322", contraste: dark ? "#000000" : "#FFFFFF",
                    daltonico: dark ? "#0B1420" : "#0B4F8A", calma: dark ? "#15140F" : "#33556E" };
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = colores[vision] || "#0A3F94";
  };
  App.visionActual = function () { return S.settings.vision || "estandar"; };
  App.setVision = function (id) {
    var ok = App.VISIONES.some(function (v) { return v.id === id; }); if (!ok) return;
    S.settings.vision = id;
    // mantenemos sincronizados los ajustes clásicos para que nada viejo quede inconsistente
    S.settings.theme = id === "oscuro" ? "dark" : "light";
    S.settings.contrast = id === "contraste" ? "high" : "normal";
    App.save(); App.applySettings();
  };

  /* ---------- Acceso local con PIN (no es una cuenta: nada sale del equipo) ---------- */
  /* Hash con 4.000 vueltas: no se guarda el PIN en texto plano. Es una traba local,
     no seguridad de servidor: sirve para que otra persona del mismo equipo no entre. */
  function hashPin(pin, salt) {
    var txt = salt + "|" + pin, h1 = 0x811c9dc5, h2 = 0x01000193, i, k, x;
    for (k = 0; k < 4000; k++) {
      for (i = 0; i < txt.length; i++) {
        x = txt.charCodeAt(i);
        h1 = Math.imul(h1 ^ x, 16777619) >>> 0;
        h2 = Math.imul(h2 ^ x, 2246822519) >>> 0;
        h2 = ((h2 << 13) | (h2 >>> 19)) >>> 0;
      }
      h1 = (h1 + h2) >>> 0;
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }
  App.hasPin = function (p) { p = p || App.P(); return !!(p && p.pin && p.pin.h); };
  App.setPin = function (pin, id) {
    var p = id ? S.profiles[id] : App.P(); if (!p) return false;
    if (!/^\d{4}$/.test(String(pin))) return false;
    var salt = Math.random().toString(36).slice(2, 10);
    p.pin = { h: hashPin(String(pin), salt), salt: salt, at: Date.now() };
    App.save(); return true;
  };
  App.clearPin = function (id) {
    var p = id ? S.profiles[id] : App.P(); if (!p) return;
    p.pin = null; App.save();
  };
  App.checkPin = function (pin, id) {
    var p = id ? S.profiles[id] : App.P(); if (!p || !p.pin) return true;
    return hashPin(String(pin), p.pin.salt) === p.pin.h;
  };
  /* La app vuelve a preguntar quién sos cada vez que se abre (cada carga de la
     página): con elegir el perfil alcanza para entrar, y si tiene números
     secretos, se piden en ese momento. Nada de esto sale del equipo. */
  App.lock = function () { S.locked = true; App.save(); };
  App.unlock = function (id) {
    if (id && S.profiles[id]) S.current = id;
    S.locked = false; App.save();
  };
  App.isLocked = function () { return !!S.locked; };
  App.profileById = function (id) { return S.profiles[id] || null; };

  /* ---------- Archivos ---------- */
  App.download = function (filename, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || "text/plain;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  App.toCSV = function (rows) {
    return "\uFEFF" + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? "" : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";"); }).join("\n");
  };
  /** Almacén clave-valor para datos técnicos (modelo de IA, preferencias del modo referente). */
  App.data = {
    get: function (k, def) { try { var v = localStorage.getItem("conectalsa-" + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem("conectalsa-" + k, JSON.stringify(v)); } catch (e) { App.toast("No se pudo guardar: almacenamiento lleno"); } }
  };
})(window.App);
