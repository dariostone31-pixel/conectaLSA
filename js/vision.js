/* =========================================================
   ConectaLSA · MOTOR DE VISIÓN
   ---------------------------------------------------------
   - Detección de 21 puntos de la mano con MediaPipe Hand Landmarker
     (Apache 2.0), cargado desde /vendor: funciona sin internet.
   - Todo ocurre en el dispositivo. NINGÚN cuadro de la cámara se graba,
     se guarda ni se envía. Solo se calculan números (coordenadas) en memoria.
   - Clasificador k-vecinos entrenado con datos PROPIOS (Modo referente).
   - Devuelve pistas explicables por dedo, no solo "correcto / incorrecto".
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";

  var V = App.Vision = {};
  var BASE = "vendor/mediapipe/";
  var landmarkerPromise = null;

  V.FINGERS = [
    { name: "Pulgar", short: "pulgar", j: [1, 2, 3, 4] },
    { name: "Índice", short: "índice", j: [5, 6, 7, 8] },
    { name: "Medio", short: "medio", j: [9, 10, 11, 12] },
    { name: "Anular", short: "anular", j: [13, 14, 15, 16] },
    { name: "Meñique", short: "meñique", j: [17, 18, 19, 20] }
  ];
  V.CONNECTIONS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

  V.problem = function () {
    if (location.protocol === "file:") return "file";
    if (!window.isSecureContext) return "insecure";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return "nocam";
    return null;
  };

  /** Carga perezosa del modelo (solo la primera vez que se usa la cámara). */
  V.load = function () {
    if (landmarkerPromise) return landmarkerPromise;
    landmarkerPromise = import(new URL(BASE + "vision_bundle.mjs", location.href).href).then(function (mp) {
      return mp.FilesetResolver.forVisionTasks(new URL(BASE, location.href).href.replace(/\/$/, "")).then(function (fileset) {
        var opts = function (delegate) {
          return { baseOptions: { modelAssetPath: new URL(BASE + "hand_landmarker.task", location.href).href, delegate: delegate },
                   runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5 };
        };
        return mp.HandLandmarker.createFromOptions(fileset, opts("GPU")).catch(function () {
          return mp.HandLandmarker.createFromOptions(fileset, opts("CPU"));
        });
      });
    });
    landmarkerPromise.catch(function () { landmarkerPromise = null; });
    return landmarkerPromise;
  };

  /* =======================================================
     CÁMARA
     ======================================================= */
  var MSG = {
    file: "Para usar la cámara con IA, abrí la app desde la web (https) o desde un servidor local. Si abriste el archivo con doble clic, mirá el README.",
    insecure: "El navegador solo permite la cámara en páginas seguras (https).",
    nocam: "Este dispositivo o navegador no permite usar la cámara.",
    denied: "No diste permiso para usar la cámara. Podés habilitarlo desde el candado de la barra de direcciones.",
    notfound: "No encontramos una cámara conectada.",
    busy: "La cámara está siendo usada por otra aplicación.",
    load: "No se pudo cargar la IA en este dispositivo."
  };

  /**
   * new V.Camera(container, { onFrame(info), draw: true, intro: "texto" })
   * info = { hands: [ {pts, world, label, score, canon} ], hint, light, t }
   */
  V.Camera = function (container, opts) {
    this.opts = opts || {};
    this.root = App.el(
      '<div class="cam">' +
        '<video playsinline muted autoplay aria-hidden="true"></video>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<div class="guide" hidden></div>' +
        '<span class="badge-live" hidden>Cámara local · no se graba</span>' +
        '<div class="hud" hidden><span class="bubble" data-hint></span><span></span></div>' +
        '<div class="cam-msg"><div>' +
          '<div style="font-size:2.6em">📷</div>' +
          '<p><strong>' + App.esc(this.opts.intro || "Practicá frente a la cámara") + '</strong></p>' +
          '<p class="small" style="opacity:.85;max-width:38ch;margin:0 auto">La imagen se procesa solo en este dispositivo. No se graba ni se envía a ningún lado.</p>' +
          '<button class="btn" type="button" data-start>Activar cámara</button>' +
        '</div></div>' +
      '</div>');
    container.appendChild(this.root);
    this.video = this.root.querySelector("video");
    this.canvas = this.root.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.msg = this.root.querySelector(".cam-msg");
    this.hintEl = this.root.querySelector("[data-hint]");
    this.running = false; this.raf = 0; this.lastT = 0; this.lastLight = 0; this.light = 1;
    this.lightCanvas = document.createElement("canvas"); this.lightCanvas.width = 32; this.lightCanvas.height = 24;
    var self = this;
    this.root.querySelector("[data-start]").addEventListener("click", function () { self.start(); });
    if (this.opts.autostart) this.start();
  };

  V.Camera.prototype.showMsg = function (html) {
    this.msg.hidden = false;
    this.msg.innerHTML = "<div>" + html + "</div>";
  };

  V.Camera.prototype.start = function () {
    var self = this, p = V.problem();
    if (p) { this.showMsg('<div style="font-size:2.2em">⚠️</div><p>' + MSG[p] + '</p>'); return Promise.resolve(false); }
    this.showMsg('<div style="font-size:2.2em">⏳</div><p><strong>Preparando la IA…</strong></p><p class="small" style="opacity:.8">La primera vez puede tardar unos segundos.</p>');
    var camP = navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    return Promise.all([camP, V.load()]).then(function (r) {
      if (self.destroyed) { r[0].getTracks().forEach(function (t) { t.stop(); }); return false; }
      self.stream = r[0]; self.landmarker = r[1];
      self.video.srcObject = self.stream;
      return self.video.play().then(function () {
        self.canvas.width = self.video.videoWidth || 640; self.canvas.height = self.video.videoHeight || 480;
        self.msg.hidden = true;
        self.root.querySelector(".badge-live").hidden = false;
        self.root.querySelector(".hud").hidden = false;
        self.root.querySelector(".guide").hidden = !!self.opts.noGuide;
        self.running = true;
        App.state().labUsed = App.state().labUsed || !!self.opts.isLab;
        self.loop();
        if (self.opts.onStart) self.opts.onStart();
        return true;
      });
    }).catch(function (e) {
      var name = e && e.name;
      var k = name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" || name === "OverconstrainedError" ? "notfound" : name === "NotReadableError" ? "busy" : "load";
      self.showMsg('<div style="font-size:2.2em">⚠️</div><p>' + MSG[k] + '</p><button class="btn" type="button" data-retry>Reintentar</button>');
      var b = self.msg.querySelector("[data-retry]"); if (b) b.addEventListener("click", function () { self.start(); });
      if (window.console) console.warn("Cámara/IA:", e);
      return false;
    });
  };

  V.Camera.prototype.stop = function () {
    this.running = false; this.destroyed = true;
    cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(function (t) { t.stop(); });
    this.stream = null;
    if (this.video) this.video.srcObject = null;
  };

  V.Camera.prototype.measureLight = function () {
    try {
      var c = this.lightCanvas.getContext("2d", { willReadFrequently: true });
      c.drawImage(this.video, 0, 0, 32, 24);
      var d = c.getImageData(0, 0, 32, 24).data, sum = 0;
      for (var i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      this.light = sum / (d.length / 4) / 255;
    } catch (e) {}
  };

  V.Camera.prototype.loop = function () {
    var self = this;
    if (!this.running) return;
    this.raf = requestAnimationFrame(function () { self.loop(); });
    var now = performance.now();
    if (now - this.lastT < 45) return; // ~20 cuadros por segundo: suficiente y liviano
    this.lastT = now;
    if (this.video.readyState < 2) return;
    if (now - this.lastLight > 1000) { this.measureLight(); this.lastLight = now; }
    var res;
    try { res = this.landmarker.detectForVideo(this.video, now); } catch (e) { return; }
    var W = this.canvas.width, H = this.canvas.height, aspect = W / H;
    var hands = (res.landmarks || []).map(function (pts, i) {
      var h = res.handedness && res.handedness[i] && res.handedness[i][0];
      var label = h ? h.categoryName : "Left";
      return { pts: pts, label: label, score: h ? h.score : 0, isRight: label === "Right", canon: V.canonical(pts, label, aspect) };
    });
    // Mano principal: la más grande en pantalla
    hands.sort(function (a, b) { return b.canon.size - a.canon.size; });
    var hint = V.framingHint(hands[0], this.light);
    this.hintEl.textContent = hint ? hint.text : "";
    this.hintEl.parentElement.style.visibility = hint ? "visible" : "hidden";
    this.ctx.clearRect(0, 0, W, H);
    if (this.opts.draw !== false) hands.forEach(function (h, i) { self.drawHand(h.pts, i === 0 ? (self.color || "#3DDC84") : "rgba(255,255,255,.5)"); });
    if (this.opts.onFrame) this.opts.onFrame({ hands: hands, hint: hint, light: this.light, t: now });
  };

  V.Camera.prototype.drawHand = function (pts, color) {
    var c = this.ctx, W = this.canvas.width, H = this.canvas.height;
    var X = function (p) { return (1 - p.x) * W; }, Y = function (p) { return p.y * H; }; // espejado, igual que el video
    c.lineWidth = Math.max(3, W / 160); c.strokeStyle = color; c.lineCap = "round";
    V.CONNECTIONS.forEach(function (e) { c.beginPath(); c.moveTo(X(pts[e[0]]), Y(pts[e[0]])); c.lineTo(X(pts[e[1]]), Y(pts[e[1]])); c.stroke(); });
    pts.forEach(function (p, i) {
      c.beginPath(); c.arc(X(p), Y(p), i % 4 === 0 ? W / 110 : W / 150, 0, Math.PI * 2);
      c.fillStyle = i === 0 ? "#FFD166" : [4, 8, 12, 16, 20].indexOf(i) >= 0 ? "#FF6B6B" : "#FFFFFF"; c.fill();
    });
  };

  /* =======================================================
     GEOMETRÍA: normalización y rasgos
     ======================================================= */
  function d2(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function d3(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz); }

  /**
   * Lleva la mano a un sistema canónico:
   * - origen en la muñeca, escala = distancia muñeca → nudillo del medio,
   * - corrige la relación de aspecto de la cámara,
   * - espeja la mano izquierda para que diestros y zurdos compartan modelo.
   * NO rota la mano: la orientación es parte de la seña.
   * Verificado con imágenes reales (oct. 2026, tasks-vision 0.10.14): sobre el cuadro
   * crudo de la cámara (sin espejar), la etiqueta de MediaPipe coincide con la mano real
   * de la persona ("Right" = mano derecha). La vista en pantalla se espeja solo con CSS.
   */
  V.canonical = function (pts, label, aspect) {
    var flip = label === "Left"; // mano izquierda real → espejar
    var raw = pts.map(function (p) { return [p.x * aspect, p.y, p.z * aspect]; });
    var w = raw[0], scale = d2(raw[0], raw[9]) || 1e-6;
    var P = raw.map(function (p) { return [(p[0] - w[0]) / scale * (flip ? -1 : 1), (p[1] - w[1]) / scale, (p[2] - w[2]) / scale]; });
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    var bbox = { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
    var ext = V.FINGERS.map(function (f) { return V.extension(P, f.j); });
    var palm = (function () { var a = P[5], b = P[17]; return a[0] * b[1] - a[1] * b[0]; })(); // < 0: palma hacia la cámara
    var thumbIndex = d3(P[4], P[8]);
    return { P: P, ext: ext, palm: palm, thumbIndex: thumbIndex, size: (bbox.x1 - bbox.x0) * (bbox.y1 - bbox.y0), bbox: bbox };
  };

  /** 0 = doblado, 1 = extendido. Rectitud de la cadena de articulaciones. */
  V.extension = function (P, j) {
    var a = P[j[0]], b = P[j[1]], c = P[j[2]], d = P[j[3]];
    var chain = d3(a, b) + d3(b, c) + d3(c, d);
    var r = d3(a, d) / (chain || 1e-6);
    var lo = j[0] === 1 ? 0.62 : 0.45, hi = j[0] === 1 ? 0.95 : 0.92;
    var e = (r - lo) / (hi - lo);
    return Math.max(0, Math.min(1, e));
  };

  /** Vector de rasgos para el clasificador. */
  V.FEATURE_VERSION = 3;
  /**
   * Vector de rasgos (versión 3).
   * [0..59]  coordenadas normalizadas de 20 puntos (forma global y orientación)
   * [60..64] extensión de cada dedo ×2 · [65] palma/dorso · [66] pinza pulgar–índice
   * [67..89] ángulos de flexión de 15 articulaciones, separación entre dedos y posición del pulgar.
   *          Dependen menos del tamaño y las proporciones de cada mano.
   * Medido con fotos reales de 11 personas (oct. 2026): mejora la separación entre formas
   * (relación intra/inter 0,79 → 0,75) sin perder aciertos. Ver informe técnico, sección 6.
   */
  V.features = function (c) {
    var f = [], P = c.P;
    P.forEach(function (p, i) { if (i === 0) return; f.push(p[0], p[1], p[2] * 0.5); });
    c.ext.forEach(function (e) { f.push(e * 2.0); });            // forma de los dedos: peso alto
    f.push(Math.max(-1, Math.min(1, c.palm)) * 1.5);             // orientación
    f.push(Math.min(c.thumbIndex, 2) * 1.2);                     // pinza pulgar–índice
    var CH = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
    CH.forEach(function (ch) { var q = [P[0]].concat(ch.map(function (i) { return P[i]; }));
      for (var k = 1; k <= 3; k++) f.push(angle(sub(q[k], q[k - 1]), sub(q[k + 1], q[k])) * 2.0); });
    var dir = CH.map(function (ch) { return sub(P[ch[3]], P[ch[0]]); });
    for (var i = 0; i < 4; i++) f.push(angle(dir[i], dir[i + 1]) * 1.5);
    [5, 9, 6, 17].forEach(function (j) { f.push(Math.min(d3(P[4], P[j]), 2.5) * 1.2); });
    return f.map(function (v) { return Math.round(v * 1000) / 1000; });
  };
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function angle(u, v) {
    var lu = Math.hypot(u[0], u[1], u[2]) || 1e-6, lv = Math.hypot(v[0], v[1], v[2]) || 1e-6;
    var d = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (lu * lv);
    return Math.acos(Math.max(-1, Math.min(1, d))) / Math.PI;
  }
  /** Reconstruye la mano canónica desde los 21 puntos guardados (para recalcular rasgos). */
  V.fromP = function (P) {
    var ext = V.FINGERS.map(function (f) { return V.extension(P, f.j); });
    var palm = P[5][0] * P[17][1] - P[5][1] * P[17][0];
    return { P: P, ext: ext, palm: palm, thumbIndex: d3(P[4], P[8]) };
  };
  V.EXT_OFFSET = 60; // posición de los 5 valores de extensión dentro del vector (20 puntos × 3)

  /** Consejos de encuadre y luz (lo que ComuSeñas no explica). */
  V.framingHint = function (h, light) {
    if (light < 0.22) return { k: "dark", text: "💡 Hay poca luz: acercate a una ventana o prendé una luz" };
    if (!h) return { k: "nohand", text: "✋ Mostrá tu mano dentro del recuadro" };
    var b = h.canon.bbox;
    if (b.x0 < 0.02 || b.x1 > 0.98 || b.y0 < 0.02 || b.y1 > 0.98) return { k: "edge", text: "↔️ La mano se sale del cuadro: centrala" };
    var s = Math.max(b.x1 - b.x0, b.y1 - b.y0);
    if (s < 0.22) return { k: "far", text: "🔍 Acercá un poco la mano a la cámara" };
    if (s > 0.85) return { k: "near", text: "↩️ Alejá un poco la mano" };
    return null;
  };

  /* =======================================================
     FORMAS GENÉRICAS (Laboratorio, sin entrenamiento)
     No son señas de LSA: sirven para explicar cómo "ve" la IA.
     ======================================================= */
  V.genericShape = function (c) {
    var on = c.ext.map(function (e) { return e > 0.6; });
    var n = on.filter(Boolean).length;
    var T = on[0], I = on[1], M = on[2], A = on[3], Me = on[4];
    if (c.thumbIndex < 0.45 && M && A && Me) return "Círculo con pulgar e índice";
    if (n === 5) return "Mano abierta";
    if (n === 0) return "Puño";
    if (n === 1 && I) return "Solo el índice extendido";
    if (n === 1 && T) return "Solo el pulgar extendido";
    if (n === 1 && Me) return "Solo el meñique extendido";
    if (n === 2 && I && M) return "Índice y medio extendidos";
    if (n === 2 && T && Me) return "Pulgar y meñique extendidos";
    if (n === 2 && I && Me) return "Índice y meñique extendidos";
    if (n === 2 && T && I) return "Pulgar e índice extendidos";
    if (n === 3 && I && M && A) return "Tres dedos (índice, medio y anular)";
    return n + " dedos extendidos";
  };

  /* =======================================================
     CLASIFICADOR k-VECINOS con datos propios
     ======================================================= */
  var MODEL_KEY = "model";
  V.REJECT_FLOOR = 2.5;
  var ZERO_HAND = []; for (var zi = 0; zi < 21; zi++) ZERO_HAND.push([zi * 0.05, -zi * 0.05, 0]);
  V.Model = {
    samples: [],
    load: function () { var m = App.data.get(MODEL_KEY, null); this.samples = this.migrate((m && m.samples) || []); this._cal = null; return this; },
    save: function () { App.data.set(MODEL_KEY, { app: "conectalsa", type: "hand-model", version: 2, fv: V.FEATURE_VERSION, samples: this.samples }); this._cal = null; },
    /**
     * Cada ejemplo guarda los 21 puntos normalizados (P). Si el algoritmo mejora,
     * los rasgos se recalculan y el trabajo de los referentes no se pierde.
     * Ejemplos viejos sin puntos y con otro formato se descartan para no mezclar.
     */
    migrate: function (list) {
      var n = V.features(V.fromP(ZERO_HAND)).length;
      return list.map(function (s) {
        if (s.P && s.fv !== V.FEATURE_VERSION) { s.f = V.features(V.fromP(s.P)); s.fv = V.FEATURE_VERSION; }
        return s;
      }).filter(function (s) { return s.f && s.f.length === n; });
    },
    labels: function () { var s = {}; this.samples.forEach(function (x) { s[x.l] = (s[x.l] || 0) + 1; }); return s; },
    people: function () { var s = {}; this.samples.forEach(function (x) { s[x.w] = (s[x.w] || 0) + 1; }); return Object.keys(s); },
    has: function (label) { var n = 0; for (var i = 0; i < this.samples.length; i++) if (this.samples[i].l === label && ++n >= 5) return true; return false; },
    ready: function () { return Object.keys(this.labels()).filter(function (k) { return this.labels()[k] >= 5; }, this).length >= 2; },
    add: function (label, c, who) {
      var P = c.P.map(function (p) { return [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000, Math.round(p[2] * 1000) / 1000]; });
      this.samples.push({ l: label, w: who || "persona-1", f: V.features(c), P: P, fv: V.FEATURE_VERSION, t: Date.now() }); this._cal = null;
    },
    removeLabel: function (label) { this.samples = this.samples.filter(function (s) { return s.l !== label; }); this._cal = null; this.save(); },
    clear: function () { this.samples = []; this.save(); },
    export: function () { return JSON.stringify({ app: "conectalsa", type: "hand-model", version: 2, fv: V.FEATURE_VERSION, exported: new Date().toISOString(), samples: this.samples }); },
    import: function (text, replace) {
      var m = JSON.parse(text);
      if (!m || m.type !== "hand-model" || !Array.isArray(m.samples)) throw new Error("Archivo no válido");
      var inc = this.migrate(m.samples);
      this.samples = replace ? inc : this.samples.concat(inc); this.save(); return inc.length;
    },
    /**
     * Umbral de rechazo («no reconozco») POR SEÑA, calibrado con los datos.
     * Para cada ejemplo se mide la distancia al ejemplo más parecido de la MISMA seña hecho por
     * OTRA persona (con una sola persona: de otro momento de la captura, ±2 s).
     * Umbral de la seña = percentil 90 de esas distancias × 1,1 (piso REJECT_FLOOR).
     * Si la seña tiene menos de 3 personas se usa el valor combinado de todas las señas.
     *
     * Por qué por seña y no global (medido con fotos reales de 27 personas, oct. 2026):
     *   umbral global anterior → falso rechazo 1,9 %, falsa aceptación 88,7 % (aprobaba formas no entrenadas)
     *   umbral por seña p90×1,1 → falso rechazo 7,5 %, falsa aceptación 9,4 %   (ver informe técnico v3)
     * Se guardan los dos vecinos de personas distintas para poder recalcular el umbral
     * SIN una persona (evaluación honesta) sin repetir todo el cálculo.
     */
    calibration: function () {
      if (this._cal) return this._cal;
      var S = this.samples, by = {}, self = this;
      S.forEach(function (s, i) { (by[s.l] = by[s.l] || []).push(i); });
      var entries = {};
      Object.keys(by).forEach(function (l) {
        var idx = by[l], multi = self.peopleFor(l) >= 2;
        var step = Math.max(1, Math.floor(idx.length / 80)), pool = idx.length > 400 ? idx.filter(function (_, k) { return k % Math.ceil(idx.length / 400) === 0; }) : idx;
        var list = [];
        for (var a = 0; a < idx.length; a += step) {
          var s = S[idx[a]], d1 = Infinity, p1 = null, d2 = Infinity;
          for (var b = 0; b < pool.length; b++) {
            var t = S[pool[b]]; if (t === s) continue;
            if (multi) { if (t.w === s.w) continue; }
            else if (Math.abs((t.t || 0) - (s.t || 0)) < 2000) continue;
            var d = dist(s.f, t.f);
            if (d < d1) { if (t.w !== p1) d2 = d1; p1 = t.w; d1 = d; }
            else if (d < d2 && t.w !== p1) d2 = d;
          }
          if (d1 < Infinity) list.push({ w: s.w, d1: d1, p1: p1, d2: d2 });
        }
        entries[l] = list;
      });
      this._cal = { entries: entries, cache: {} };
      return this._cal;
    },
    REJECT_PCT: 0.9, REJECT_FACTOR: 1.1,
    /** Umbral de una seña; si se pasa excludeWho, se recalcula como si esa persona no existiera. */
    threshold: function (label, excludeWho) {
      var cal = this.calibration(), key = label + "|" + (excludeWho || ""), self = this;
      if (cal.cache[key] != null) return cal.cache[key];
      function vals(l) {
        return (cal.entries[l] || []).filter(function (e) { return e.w !== excludeWho; })
          .map(function (e) { return e.p1 === excludeWho ? e.d2 : e.d1; }).filter(function (d) { return d < Infinity; });
      }
      function q(ds) { ds.sort(function (a, b) { return a - b; }); return ds[Math.min(ds.length - 1, Math.max(0, Math.ceil(self.REJECT_PCT * ds.length) - 1))]; }
      var people = {}; this.samples.forEach(function (s) { if (s.l === label && s.w !== excludeWho) people[s.w] = 1; });
      var own = vals(label), thr;
      if (Object.keys(people).length >= 3 && own.length >= 5) thr = q(own) * this.REJECT_FACTOR;
      else {
        var all = []; Object.keys(cal.entries).forEach(function (l) { all = all.concat(vals(l)); });
        thr = all.length ? q(all) * this.REJECT_FACTOR : V.REJECT_FLOOR;
      }
      return (cal.cache[key] = Math.max(V.REJECT_FLOOR, thr));
    },
    peopleFor: function (label) {
      var w = {}; this.samples.forEach(function (s) { if (s.l === label) w[s.w] = 1; }); return Object.keys(w).length;
    },
    /**
     * Predice comparando con los 3 ejemplos más parecidos DE CADA SEÑA (no un voto global).
     * Así una seña con muchos ejemplos no "gana" a una con pocos: es justo con señas
     * recién entrenadas y con conjuntos desbalanceados.
     * «Desconocido» si la mano queda fuera del umbral de la seña más probable.
     */
    predict: function (f, opts) {
      opts = opts || {}; var kc = opts.k || 3, S = this.samples, exclude = opts.excludeWho, best = {};
      for (var i = 0; i < S.length; i++) {
        var s = S[i];
        if (exclude && s.w === exclude) continue;
        if (opts.excludeLabel && s.l === opts.excludeLabel) continue;
        if (opts.excludeIndex === i) continue;
        if (opts.excludeNear && s.w === opts.excludeNear.w && Math.abs((s.t || 0) - opts.excludeNear.t) < 2000) continue;
        var d = dist(f, s.f), arr = best[s.l] || (best[s.l] = []);
        if (arr.length < kc) { arr.push(d); arr.sort(function (a, b) { return a - b; }); }
        else if (d < arr[kc - 1]) { arr[kc - 1] = d; arr.sort(function (a, b) { return a - b; }); }
      }
      var labels = Object.keys(best);
      if (!labels.length) return { top: [], dmin: Infinity, unknown: true };
      var dmin = Infinity, tot = 0;
      var sc = labels.map(function (l) {
        var arr = best[l], m = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
        if (arr[0] < dmin) dmin = arr[0];
        var w = 1 / Math.pow(m + 0.05, 4); tot += w; return { label: l, w: w, d: arr[0] };
      });
      sc.sort(function (a, b) { return b.w - a.w; });
      var top = sc.map(function (x) { return { label: x.label, p: x.w / tot }; });
      var thr = opts.noReject ? Infinity : this.threshold(sc[0].label, exclude);
      return { top: top, dmin: dmin, dtop: sc[0].d, threshold: thr, unknown: sc[0].d > thr };
    },
    /**
     * Validación honesta.
     * - Señas con 2 o más personas: se deja afuera a la persona completa (como un usuario nuevo),
     *   también al calcular el umbral.
     * - Señas con 1 sola persona: se deja afuera un bloque de ±2 s de su captura. Se marcan como "optimistas".
     * Informa precisión, FALSO RECHAZO (señas correctas que la cámara no aprueba) y
     * FALSA ACEPTACIÓN (formas no entrenadas que aprobaría: se deja afuera cada seña completa).
     */
    evaluate: function () {
      var S = this.samples, self = this;
      var labels = Object.keys(this.labels()).sort(), M = {}, per = {}, ok = 0, n = 0, rej = 0, fa = 0, fn = 0;
      labels.forEach(function (a) { M[a] = { "?": 0 }; labels.forEach(function (b) { M[a][b] = 0; }); per[a] = { n: 0, ok: 0, rej: 0, fa: 0, fn: 0, people: self.peopleFor(a) }; });
      var step = Math.max(1, Math.floor(S.length / 600));
      for (var i = 0; i < S.length; i += step) {
        var x = S[i], multi = per[x.l].people >= 2;
        var r = self.predict(x.f, multi ? { excludeWho: x.w } : { excludeNear: { w: x.w, t: x.t || 0 }, excludeIndex: i });
        if (!r.top.length) continue;
        var pred = r.top[0].label;
        M[x.l][pred]++; n++; per[x.l].n++;
        if (pred === x.l) { ok++; per[x.l].ok++; if (r.unknown) { rej++; per[x.l].rej++; M[x.l]["?"]++; } }
        if (labels.length >= 3) {
          var o = self.predict(x.f, { excludeLabel: x.l, excludeWho: multi ? x.w : null });
          fn++; per[x.l].fn++; if (o.top.length && !o.unknown) { fa++; per[x.l].fa++; }
        }
      }
      var single = labels.filter(function (l) { return per[l].people < 2; });
      return { acc: n ? ok / n : 0, frr: ok ? rej / ok : 0, far: fn ? fa / fn : null, n: n, labels: labels, matrix: M, per: per, single: single,
        method: single.length ? (single.length === labels.length ? "dejando afuera bloques de 2 s (todas las señas tienen una sola persona: resultado optimista)" : "dejando afuera a cada persona; las señas con una sola persona se midieron por bloques (optimista)") : "dejando afuera a cada persona, también al calcular el umbral (exigente y realista)" };
    },
    /** Perfil promedio de una etiqueta: extensión de dedos, orientación, pinza. */
    profile: function (label) {
      var xs = this.samples.filter(function (s) { return s.l === label; });
      if (!xs.length) return null;
      var o = V.EXT_OFFSET, ext = [0, 0, 0, 0, 0], palm = 0, pinch = 0;
      xs.forEach(function (s) { for (var i = 0; i < 5; i++) ext[i] += s.f[o + i] / 2; palm += s.f[o + 5] / 1.5; pinch += s.f[o + 6] / 1.2; });
      return { ext: ext.map(function (v) { return v / xs.length; }), palm: palm / xs.length, pinch: pinch / xs.length, n: xs.length };
    }
  };
  function dist(a, b) { var s = 0; for (var i = 0; i < a.length; i++) { var d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); }

  /** Pistas concretas comparando tu mano con el promedio de la seña objetivo. */
  V.hints = function (c, label) {
    var pr = V.Model.profile(label); if (!pr) return [];
    var out = [];
    V.FINGERS.forEach(function (f, i) {
      var diff = c.ext[i] - pr.ext[i];
      if (diff > 0.38) out.push({ finger: i, text: (i === 0 ? "Doblá el pulgar" : "Doblá el " + f.short) });
      else if (diff < -0.38) out.push({ finger: i, text: (i === 0 ? "Extendé el pulgar" : "Extendé el " + f.short) });
    });
    if (pr.palm < -0.25 && c.palm > 0.25) out.push({ text: "Girá la mano: mostrá la palma a la cámara" });
    if (pr.palm > 0.25 && c.palm < -0.25) out.push({ text: "Girá la mano: mostrá el dorso a la cámara" });
    if (pr.pinch < 0.5 && c.thumbIndex > 0.9) out.push({ text: "Acercá la punta del pulgar al índice" });
    if (pr.pinch > 1.0 && c.thumbIndex < 0.45) out.push({ text: "Separá el pulgar del índice" });
    return out.slice(0, 3);
  };

  /** Suaviza predicciones: evita parpadeos y "aprobados" accidentales. */
  V.Smoother = function (n) { this.n = n || 10; this.buf = []; };
  V.Smoother.prototype.push = function (label, p) {
    this.buf.push({ l: label, p: p || 0 }); if (this.buf.length > this.n) this.buf.shift();
    var c = {}, ps = {};
    this.buf.forEach(function (x) { if (x.l) { c[x.l] = (c[x.l] || 0) + 1; ps[x.l] = (ps[x.l] || 0) + x.p; } });
    var best = null, bc = 0; Object.keys(c).forEach(function (k) { if (c[k] > bc) { bc = c[k]; best = k; } });
    return { label: best, ratio: bc / this.n, p: best ? ps[best] / bc : 0, full: this.buf.length >= this.n };
  };
  V.Smoother.prototype.reset = function () { this.buf = []; };

  /** Dibuja la mano normalizada en un canvas pequeño ("así la ve la IA"). */
  V.drawCanonical = function (canvas, c) {
    var ctx = canvas.getContext("2d"), W = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1), H = canvas.height = W;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(128,128,160,.25)"; ctx.lineWidth = 1;
    for (var g = 1; g < 8; g++) { ctx.beginPath(); ctx.moveTo(g * W / 8, 0); ctx.lineTo(g * W / 8, H); ctx.moveTo(0, g * H / 8); ctx.lineTo(W, g * H / 8); ctx.stroke(); }
    if (!c) return;
    var sc = W / 4.4, ox = W / 2, oy = H * 0.8;
    var X = function (p) { return ox - p[0] * sc; }, Y = function (p) { return oy + p[1] * sc; };
    ctx.lineWidth = W / 90; ctx.strokeStyle = "#3F7DB3"; ctx.lineCap = "round";
    V.CONNECTIONS.forEach(function (e) { ctx.beginPath(); ctx.moveTo(X(c.P[e[0]]), Y(c.P[e[0]])); ctx.lineTo(X(c.P[e[1]]), Y(c.P[e[1]])); ctx.stroke(); });
    c.P.forEach(function (p, i) { ctx.beginPath(); ctx.arc(X(p), Y(p), W / 60, 0, 7); ctx.fillStyle = i === 0 ? "#D99A2B" : [4, 8, 12, 16, 20].indexOf(i) >= 0 ? "#B8472F" : "#17192C"; ctx.fill(); });
  };

  V.Model.load();
})(window.App);
