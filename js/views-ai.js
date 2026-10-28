/* =========================================================
   ConectaLSA · Cámara e IA
   ¿Cómo me ve la cámara? · Entrenar la IA (referentes) · Deletreo
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var C = App.CONTENT, esc = App.esc, VI = App.Vision;
  function nameOf(k) { return C.ITEMS[k] ? App.itemTitle(C.ITEMS[k]) : (/^[A-ZÑ]$/.test(k) ? "Letra " + k : k); }
  function bars(r, target) {
    return r.unknown ? '<li class="muted">No se parece a ninguna seña entrenada</li>' : r.top.slice(0, 3).map(function (x) {
      var nm = C.ITEMS[x.label] ? C.ITEMS[x.label].label : x.label;
      return '<li><span>' + esc(nm) + '</span><span class="bar ' + (x.label === target ? "good" : "") + '"><i style="width:' + Math.round(x.p * 100) + '%"></i></span><span>' + Math.round(x.p * 100) + '%</span></li>';
    }).join("");
  }

  /* =======================================================
     ¿CÓMO ME VE LA CÁMARA? (prueba de encuadre y luz antes de practicar)
     ======================================================= */
  V.camara = function (root) {
    var M = VI.Model;
    root.innerHTML = '<a class="link" href="#/practicar">← Practicar</a><span class="eyebrow" style="margin-top:10px">Prueba de cámara</span><h1>¿Cómo te ve la cámara?</h1>' +
      '<p class="muted" style="max-width:68ch">Antes de practicar, revisá que la cámara vea bien tu mano. La app encuentra <strong>21 puntos</strong> en tu mano y te avisa si hay poca luz, si estás muy lejos o si se sale del recuadro.</p>' +
      '<div class="lab-grid"><div><div data-cam></div><p class="small muted" data-fps style="margin-top:8px"></p></div><div class="stack">' +
        '<div class="card"><span class="eyebrow">Estado</span><ul class="checklist" data-checks>' +
          '<li data-c="hand">Mano visible</li><li data-c="light">Buena luz</li><li data-c="size">Distancia adecuada</li><li data-c="edge">Mano dentro del recuadro</li></ul></div>' +
        '<div class="card"><span class="eyebrow">Extensión de cada dedo</span><div class="fingers" data-fingers>' + VI.FINGERS.map(function (f) { return '<div class="finger"><div class="col"><i style="height:0%"></i></div>' + f.name + '</div>'; }).join("") + '</div><p class="small muted" data-meta style="margin:8px 0 0"></p></div>' +
        (M.ready() ? '<div class="card"><span class="eyebrow">Señas que reconoce</span><ul class="conf-list" data-pred><li class="muted">Mostrá una seña…</li></ul></div>' : '') +
      '</div></div>' +
      '<div class="section-title"><h2>Si la cámara no te reconoce</h2></div><div class="grid three">' +
        why("💡", "Luz de frente", "Una ventana o lámpara delante tuyo, no detrás.") +
        why("📏", "Distancia", "Que se vea tu torso y la mano completa, a unos 50 cm a 1 m.") +
        why("🖐", "Dedos a la vista", "En formas cerradas los dedos se tapan: girá un poco la mano.") +
        why("🙋", "No es tu culpa", "La IA aprende de ejemplos. Si te rechaza haciéndola bien, marcala como lograda: así la mejoramos.") +
      '</div><p class="footer-note">Tecnología: MediaPipe Hand Landmarker (Apache 2.0), ejecutado en este dispositivo. Ninguna imagen se guarda ni se envía.</p>';
    var fingersEl = App.$$("[data-fingers] i", root), metaEl = App.$("[data-meta]", root), predEl = App.$("[data-pred]", root), fpsEl = App.$("[data-fps]", root);
    var frames = 0, t0 = performance.now();
    function check(k, ok) { var li = App.$('[data-c="' + k + '"]', root); if (li) li.className = ok === null ? "" : ok ? "ok" : "bad"; }
    var cam = new VI.Camera(App.$("[data-cam]", root), { intro: "Activá la cámara y mostrá tu mano", autostart: App.camOK, onStart: function () { App.camOK = true; },
      onFrame: function (info) {
        frames++; var now = performance.now();
        if (now - t0 > 1000) { fpsEl.textContent = "⚡ " + frames + " imágenes por segundo analizadas en este equipo"; frames = 0; t0 = now; }
        var h = info.hands[0], hk = info.hint && info.hint.k;
        check("hand", !!h); check("light", hk !== "dark"); check("size", h ? hk !== "far" && hk !== "near" : null); check("edge", h ? hk !== "edge" : null);
        if (!h) { metaEl.textContent = "No veo ninguna mano."; fingersEl.forEach(function (i) { i.style.height = "0%"; }); return; }
        var c = h.canon;
        metaEl.textContent = (h.isRight ? "Mano derecha" : "Mano izquierda") + " · " + (c.palm < -0.15 ? "palma hacia la cámara" : c.palm > 0.15 ? "dorso hacia la cámara" : "de costado") + " · seguridad " + Math.round(h.score * 100) + "%";
        c.ext.forEach(function (e, i) { fingersEl[i].style.height = Math.round(e * 100) + "%"; fingersEl[i].style.background = e > 0.6 ? "var(--good)" : e < 0.35 ? "var(--coral)" : "var(--sun)"; });
        if (predEl) predEl.innerHTML = bars(M.predict(VI.features(c)));
      } });
    return function () { cam.stop(); };
  };
  function why(ico, t, d) { return '<div class="card"><div style="font-size:1.8em">' + ico + '</div><h3>' + t + '</h3><p class="small muted" style="margin:0">' + d + '</p></div>'; }

  /* =======================================================
     ENTRENAR LA IA (solo referentes; guarda números, nunca imágenes)
     ======================================================= */
  V.entrenar = function (root) {
    if (!App.refGate(root)) return;
    var M = VI.Model;
    var who = App.data.get("trainer-who", "persona-1");
    var label = App.data.get("trainer-label", "A");
    var capturing = null, cam = null;
    root.innerHTML = '<a class="link" href="#/referente">← Modo referente</a><span class="eyebrow" style="margin-top:10px">Modo referente</span><h1>Enseñarle señas a la cámara</h1>' +
      '<p class="muted" style="max-width:72ch">Para que la cámara no rechace señas bien hechas necesita ejemplos de <strong>muchas personas distintas</strong> (meta: al menos 3 por seña, idealmente 10), con distintas manos, luces y distancias.</p>' +
      '<div class="note good"><p>🔒 Solo se guardan números (21 puntos de la mano). Nunca imágenes. Pedí consentimiento y usá un código, no el nombre.</p></div>' +
      '<div class="lab-grid" style="margin-top:14px"><div><div data-cam></div></div><div class="stack"><div class="card">' +
        '<label class="field"><span>Código de la persona que hace la seña</span><input type="text" data-who value="' + esc(who) + '" placeholder="persona-1" autocomplete="off"></label>' +
        '<label class="field"><span>Seña a entrenar</span><select data-label>' + C.LEVELS.map(function (lv) {
          return '<optgroup label="' + esc(lv.title) + '">' + lv.items.map(function (id) { var it = C.ITEMS[id]; return '<option value="' + esc(it.aiLabel) + '">' + esc(App.itemTitle(it)) + '</option>'; }).join("") + '</optgroup>';
        }).join("") + '</select></label>' +
        '<p class="small muted" data-mvnote hidden>⚠️ Esta seña tiene movimiento. La cámara aprende la forma de la mano en un instante: capturá la posición más característica. Sirve de apoyo, no de evaluación final.</p>' +
        '<button class="btn big block" type="button" data-cap>⏺ Capturar 30 ejemplos</button><div class="bar" style="margin-top:10px" hidden data-capbar><i style="width:0%"></i></div>' +
        '<p class="small muted" style="margin-top:8px">Durante la captura mové un poco la mano: acercala, alejala y girala levemente.</p></div>' +
        '<div class="card"><span class="eyebrow">Prueba en vivo</span><ul class="conf-list" data-live><li class="muted">Entrená al menos 2 señas con 5 ejemplos cada una.</li></ul></div>' +
      '</div></div>' +
      '<div class="section-title"><h2>Datos de entrenamiento</h2><span class="muted small" data-summary></span></div>' +
      '<div class="card"><div class="table-wrap" data-table></div><div class="row" style="margin-top:14px"><button class="btn alt" type="button" data-eval>📊 Medir precisión</button><button class="btn ghost" type="button" data-export>⬇ Exportar modelo</button>' +
        '<label class="btn ghost">⬆ Importar modelo<input type="file" accept="application/json,.json" data-import hidden></label><button class="btn bad" type="button" data-clear>Borrar todo</button></div>' +
        '<p class="small muted" style="margin-top:10px">Para usar el mismo modelo en todos los equipos, exportalo y después importalo en cada uno.</p></div><div data-evalout></div>';
    var sel = App.$("[data-label]", root), whoEl = App.$("[data-who]", root);
    sel.value = label; if (!sel.value) { sel.selectedIndex = 0; }
    function onSel() { label = sel.value; App.data.set("trainer-label", label); App.$("[data-mvnote]", root).hidden = /^[A-ZÑ]$/.test(label) && "JKÑZ".indexOf(label) < 0; }
    sel.addEventListener("change", onSel); onSel();
    whoEl.addEventListener("change", function () { who = whoEl.value.trim() || "persona-1"; App.data.set("trainer-who", who); });
    function renderTable() {
      var labs = M.labels(), people = M.people();
      App.$("[data-summary]", root).textContent = M.samples.length + " ejemplos · " + Object.keys(labs).length + " señas · " + people.length + " persona" + (people.length === 1 ? "" : "s");
      var keys = Object.keys(labs).sort();
      if (!keys.length) { App.$("[data-table]", root).innerHTML = '<p class="muted">Todavía no hay ejemplos. Elegí una seña y tocá «Capturar».</p>'; return; }
      var h = '<table class="matrix" style="width:100%"><thead><tr><th style="text-align:left">Seña</th><th>Ejemplos</th><th>Personas</th><th>Estado</th><th></th></tr></thead><tbody>';
      keys.forEach(function (k) {
        var ws = {}; M.samples.forEach(function (s) { if (s.l === k) ws[s.w] = 1; });
        var np = Object.keys(ws).length, ok = labs[k] >= 5;
        h += '<tr><td style="text-align:left"><strong>' + esc(nameOf(k)) + '</strong></td><td>' + labs[k] + '</td><td>' + np + '</td><td>' + (np >= 3 ? '<span class="tag good">Robusta</span>' : ok ? '<span class="tag warn">Sumá personas</span>' : '<span class="tag">Faltan ejemplos</span>') + '</td><td><button class="link" type="button" data-del="' + esc(k) + '">Borrar</button></td></tr>';
      });
      App.$("[data-table]", root).innerHTML = h + '</tbody></table>';
      App.$$("[data-del]", root).forEach(function (b) { b.addEventListener("click", function () { if (confirm("¿Borrar todos los ejemplos de esta seña?")) { M.removeLabel(b.dataset.del); renderTable(); } }); });
    }
    renderTable();
    App.$("[data-cap]", root).addEventListener("click", function () {
      if (!cam || !cam.running) { App.toast("Primero activá la cámara"); return; }
      if (capturing) return;
      var btn = this, bar = App.$("[data-capbar]", root), n = 3;
      btn.disabled = true; bar.hidden = false; bar.firstChild.style.width = "0%";
      var tick = setInterval(function () {
        if (n > 0) { btn.textContent = "Preparate… " + n; App.fx("tick"); n--; return; }
        clearInterval(tick); btn.textContent = "Capturando… mové levemente la mano"; capturing = { n: 0, target: 30, last: 0 };
      }, 800);
    });
    cam = new VI.Camera(App.$("[data-cam]", root), { intro: "Activá la cámara para entrenar", autostart: App.camOK, onStart: function () { App.camOK = true; },
      onFrame: function (info) {
        var h = info.hands[0];
        if (capturing && h && !(info.hint && (info.hint.k === "edge" || info.hint.k === "dark")) && info.t - capturing.last > 110) {
          capturing.last = info.t; capturing.n++; M.add(label, h.canon, who);
          App.$("[data-capbar] i", root).style.width = (capturing.n / capturing.target * 100) + "%";
          if (capturing.n >= capturing.target) {
            capturing = null; M.save(); App.fx("ok"); App.toast("✅ 30 ejemplos guardados: " + nameOf(label));
            var b = App.$("[data-cap]", root); b.disabled = false; b.textContent = "⏺ Capturar 30 ejemplos más"; App.$("[data-capbar]", root).hidden = true; renderTable();
          }
        }
        var live = App.$("[data-live]", root);
        if (!M.ready()) return;
        if (!h) { live.innerHTML = '<li class="muted">Mostrá una seña…</li>'; return; }
        live.innerHTML = bars(M.predict(VI.features(h.canon)));
      } });
    App.$("[data-eval]", root).addEventListener("click", function () {
      var out = App.$("[data-evalout]", root);
      if (M.samples.length < 20) { out.innerHTML = '<div class="note warn" style="margin-top:14px"><p>Necesitás al menos 20 ejemplos para medir.</p></div>'; return; }
      var e = M.evaluate();
      var rows = e.labels.map(function (l) { var q = e.per[l]; return '<tr><td style="text-align:left">' + esc(nameOf(l)) + '</td><td>' + q.people + '</td><td>' + (q.n ? Math.round(q.ok / q.n * 100) : 0) + '%</td><td>' + (q.ok ? Math.round(q.rej / q.ok * 100) : 0) + '%</td><td>' + (q.fn ? Math.round(q.fa / q.fn * 100) + '%' : '—') + '</td><td>' + (q.people >= 3 ? '<span class="tag good">Confiable</span>' : q.people === 2 ? '<span class="tag warn">Sumá personas</span>' : '<span class="tag">Optimista</span>') + '</td></tr>'; }).join("");
      out.innerHTML = '<div class="card" style="margin-top:14px"><span class="eyebrow">Resultado</span>' +
        '<div class="stats"><div class="stat"><strong>' + Math.round(e.acc * 100) + '%</strong><small>precisión</small></div><div class="stat"><strong>' + Math.round(e.frr * 100) + '%</strong><small>falso rechazo (meta ≤ 10%)</small></div>' + (e.far != null ? '<div class="stat"><strong>' + Math.round(e.far * 100) + '%</strong><small>falsa aceptación (meta ≤ 10%)</small></div>' : '') + '<div class="stat"><strong>' + e.n + '</strong><small>ejemplos medidos</small></div></div>' +
        '<p class="small muted">Medida ' + esc(e.method) + '. <strong>Falso rechazo</strong>: señas bien hechas a las que la cámara habría respondido «no reconozco». <strong>Falsa aceptación</strong>: formas que la cámara no aprendió y que igual habría aprobado (se deja afuera cada seña completa; necesita 3 señas o más).</p>' +
        (e.single.length ? '<div class="note warn"><p>Con una sola persona el resultado es optimista: ' + e.single.map(function (l) { return esc(nameOf(l)); }).join(", ") + '.</p></div>' : '') +
        '<div class="table-wrap"><table class="matrix" style="width:100%;margin:12px 0"><thead><tr><th style="text-align:left">Seña</th><th>Personas</th><th>Acierto</th><th>Falso rechazo</th><th>Falsa aceptación</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="small muted">Matriz de confusión · Filas: seña real · Columnas: respuesta de la cámara.</p>' + matrixHTML(e.labels, e.matrix) + '</div>';
    });
    App.$("[data-export]", root).addEventListener("click", function () { App.download("conectalsa-modelo-" + App.today() + ".json", M.export(), "application/json"); });
    App.$("[data-import]", root).addEventListener("change", function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { try { var n = M.import(rd.result, confirm("¿Reemplazar los datos actuales? (Aceptar = reemplazar · Cancelar = sumar)")); App.toast("Importados " + n + " ejemplos"); renderTable(); } catch (e) { App.toast("El archivo no es un modelo válido"); } };
      rd.readAsText(f);
    });
    App.$("[data-clear]", root).addEventListener("click", function () { if (confirm("¿Borrar TODOS los datos de entrenamiento de este dispositivo?")) { M.clear(); renderTable(); } });
    return function () { cam && cam.stop(); };
  };
  function matrixHTML(labels, Mx) {
    var h = '<div class="table-wrap"><table class="matrix"><thead><tr><th>Real ↓ · Cámara →</th>' + labels.map(function (l) { return '<th>' + esc(C.ITEMS[l] ? C.ITEMS[l].label : l) + '</th>'; }).join("") + '</tr></thead><tbody>';
    labels.forEach(function (a) {
      var tot = labels.reduce(function (s, b) { return s + (Mx[a] && Mx[a][b] || 0); }, 0) || 1;
      h += '<tr><th>' + esc(C.ITEMS[a] ? C.ITEMS[a].label : a) + '</th>' + labels.map(function (b) {
        var v = Mx[a] && Mx[a][b] || 0, p = v / tot;
        var bg = a === b ? "rgba(46,158,143," + (0.12 + p * 0.6) + ")" : v ? "rgba(240,100,60," + (0.1 + p * 0.6) + ")" : "transparent";
        return '<td style="background:' + bg + '">' + (v || "") + '</td>';
      }).join("") + '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* =======================================================
     DELETREO (juego libre)
     ======================================================= */
  V.deletreo = function (root) {
    var cam = null;
    function menu() {
      if (cam) { cam.stop(); cam = null; }
      root.innerHTML = '<a class="link" href="#/practicar">← Practicar</a><span class="eyebrow" style="margin-top:10px">Juego</span><h1>Deletreá</h1>' +
        '<p class="muted">Elegí una palabra o escribí tu nombre y hacelo con el alfabeto manual.</p>' +
        '<div class="card"><label class="field"><span>Tu nombre o una palabra</span><div class="row"><input type="text" data-word maxlength="14" placeholder="Ej.: ROCÍO" style="flex:1;min-width:160px"><button class="btn" type="button" data-go>Deletrear</button></div></label>' +
        '<span class="eyebrow">Palabras para practicar</span><div class="row" data-words></div></div>' +
        '<div class="note" style="margin-top:14px"><p>Deletrear no es lo mismo que señar: las personas sordas usan señas para la mayoría de las palabras y una <strong>seña personal</strong> en lugar de deletrear su nombre.</p></div>';
      var wl = App.$("[data-words]", root);
      C.DELETREO.forEach(function (w) { var b = App.el('<button class="chip" type="button">' + esc(w) + '</button>'); b.addEventListener("click", function () { play(w); }); wl.appendChild(b); });
      var inp = App.$("[data-word]", root);
      function go() { var w = inp.value.toUpperCase().normalize("NFD").replace(/N\u0303/g, "Ñ").replace(/[\u0300-\u036f]/g, "").replace(/[^A-ZÑ]/g, ""); if (w) play(w); else App.toast("Escribí una palabra"); }
      App.$("[data-go]", root).addEventListener("click", go);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    }
    function play(w) {
      root.innerHTML = '<div><button class="link" type="button" data-back>← Elegir otra palabra</button><h1 style="margin-top:10px">Deletreá: ' + esc(w) + '</h1></div>';
      App.$("[data-back]", root).addEventListener("click", menu);
      cam = App.spellWidget(root.firstChild, w, function () {
        App.P().spelled++; App.addXp(10); App.checkBadges(); App.save();
        root.firstChild.appendChild(App.el('<div class="row" style="margin-top:14px"><button class="btn big" type="button" data-again>Otra palabra</button></div>'));
        App.$("[data-again]", root).addEventListener("click", menu);
      });
    }
    menu();
    return function () { if (cam) cam.stop(); };
  };
})(window.App);
