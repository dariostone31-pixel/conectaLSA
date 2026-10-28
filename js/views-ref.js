/* =========================================================
   ConectaLSA · Modo referente
   Para personas sordas referentes y docentes de LSA: grabar o subir los videos de cada seña,
   validarlos (segunda persona), compartirlos entre equipos y entrenar la cámara.
   Los alumnos nunca son grabados: la grabación existe solo en este modo.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var C = App.CONTENT, esc = App.esc, Md = App.Media;

  /** Puerta del modo referente: PIN opcional. Devuelve true si se puede pasar. */
  App.refGate = function (root) {
    var R = App.state().ref;
    if (!R.pin || App.refUnlocked) return true;
    root.innerHTML = '<a class="link" href="#/perfil">← Perfil</a><section class="stage narrow"><span class="eyebrow">Modo referente</span><h1>Ingresá el PIN</h1><form class="write" data-f><label class="sr" for="pin">PIN</label><input id="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"><button class="btn" type="submit">Entrar</button></form><p class="small muted">El PIN evita que se modifiquen los videos por accidente en equipos compartidos.</p></section>';
    App.$("[data-f]", root).addEventListener("submit", function (e) {
      e.preventDefault();
      if (App.$("#pin", root).value === R.pin) { App.refUnlocked = true; App.route(); } else { App.fx("bad"); App.toast("PIN incorrecto"); }
    });
    setTimeout(function () { var i = App.$("#pin", root); if (i) i.focus(); }, 50);
    return false;
  };

  /* =======================================================
     PANEL DEL REFERENTE
     ======================================================= */
  V.referente = function (root) {
    if (!App.refGate(root)) return;
    var R = App.state().ref, me = App.data.get("ref-name", ""), filter = App.data.get("ref-filter", "todos");
    var total = App.allItems().length;
    root.innerHTML = '<a class="link" href="#/perfil">← Perfil</a><span class="eyebrow" style="margin-top:10px">Modo referente</span><h1>Videos de las señas</h1>' +
      '<p class="muted" style="max-width:72ch">Las señas de ConectaLSA las enseñan <strong>personas sordas</strong>. Desde acá grabás o subís el video de cada seña, otra persona referente lo valida y después lo compartís con todos los equipos.</p>' +
      '<div class="stats"><div class="stat"><span class="stat-ico">🎬</span><strong>' + Md.count() + '/' + total + '</strong><small>con video</small></div><div class="stat"><span class="stat-ico">✔</span><strong>' + Md.validatedCount() + '</strong><small>validados</small></div><div class="stat"><span class="stat-ico">🤖</span><strong>' + Object.keys(App.Vision.Model.labels()).length + '</strong><small>señas en la cámara</small></div></div>' +
      '<div class="grid two" style="margin-top:14px">' +
        '<div class="card"><span class="eyebrow">Quién sos</span><label class="field"><span>Tu nombre o código (aparece en los créditos del video)</span><input type="text" data-me maxlength="40" value="' + esc(me) + '" placeholder="Ej.: María G. — Asociación de Sordos"></label></div>' +
        '<div class="card"><span class="eyebrow">Compartir entre equipos</span><p class="small muted" style="margin-top:0">Descargá un paquete con todos los videos y créditos, y cargalo en los otros equipos.</p><div class="row"><button class="btn" type="button" data-exp>⬇ Exportar paquete</button><label class="btn ghost">⬆ Importar paquete<input type="file" accept=".json,application/json" data-imp hidden></label></div></div>' +
      '</div>' +
      '<details class="card" style="margin-top:14px"><summary><strong>📋 Cómo grabar un buen video</strong></summary><ul>' +
        '<li>Fondo liso y ropa lisa que contraste con la piel. Luz de frente.</li><li>Encuadre de la cabeza a la cintura, con espacio a los costados para el movimiento.</li>' +
        '<li>Empezá y terminá con las manos abajo. Hacé la seña con la expresión facial correspondiente.</li><li>Celular o cámara fija y horizontal. Máximo 6 segundos.</li>' +
        '<li>Antes de grabar, confirmá que la persona dio su consentimiento para publicar el video.</li></ul></details>' +
      '<div class="section-title"><h2>Señas</h2><div class="row chips" data-f></div></div><div data-list></div>' +
      '<div class="grid two" style="margin-top:18px"><a class="card link-card" href="#/entrenar"><span class="tip-ico">🤖</span><strong>Enseñarle señas a la cámara</strong><span class="small muted">Capturá ejemplos de varias personas y medí el falso rechazo.</span></a>' +
        '<div class="card"><span class="eyebrow">PIN del modo referente</span><p class="small muted" style="margin-top:0">' + (R.pin ? "Hay un PIN configurado." : "Sin PIN: cualquiera puede entrar.") + '</p><form class="row" data-pinf><input type="password" inputmode="numeric" maxlength="8" placeholder="Nuevo PIN (vacío = sin PIN)" data-pin style="flex:1;min-width:140px"><button class="btn ghost" type="submit">Guardar PIN</button></form></div></div>';
    App.$("[data-me]", root).addEventListener("change", function () { App.data.set("ref-name", this.value.trim()); App.toast("Guardado"); });
    var fEl = App.$("[data-f]", root);
    [["todos", "Todas"], ["sin", "Sin video"], ["pend", "Por validar"], ["ok", "Validadas"]].forEach(function (f) {
      var b = App.el('<button class="chip" type="button" aria-pressed="' + (f[0] === filter) + '">' + f[1] + '</button>');
      b.addEventListener("click", function () { filter = f[0]; App.data.set("ref-filter", filter); App.$$(".chip", fEl).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); });
      fEl.appendChild(b);
    });
    function draw() {
      var list = App.$("[data-list]", root); list.innerHTML = "";
      C.LEVELS.forEach(function (lv) {
        var rows = lv.items.map(function (id) { return C.ITEMS[id]; }).filter(function (it) {
          var m = Md.info(it.id); return filter === "todos" || (filter === "sin" && !m) || (filter === "pend" && m && !m.validatedBy) || (filter === "ok" && m && m.validatedBy);
        });
        if (!rows.length) return;
        var box = App.el('<div class="card ref-level"><h3>' + lv.ico + ' ' + esc(lv.title) + '</h3><ul class="ref-list"></ul></div>');
        var ul = App.$("ul", box);
        rows.forEach(function (it) {
          var m = Md.info(it.id);
          var st = !m ? '<span class="tag">Sin video</span>' : m.validatedBy ? '<span class="tag good">✔ ' + esc(m.validatedBy) + '</span>' : '<span class="tag warn">Por validar</span>';
          var li = App.el('<li><span class="grow"><strong>' + esc(App.itemTitle(it)) + '</strong> ' + st + (m ? '<br><small class="muted">Seña: ' + esc(m.signer || "—") + (m.source === "file" ? " · archivo de la app" : "") + '</small>' : "") + '</span>' +
            '<a class="btn small" href="#/grabar/' + encodeURIComponent(it.id) + '">' + (m ? "🎬 Ver / regrabar" : "⏺ Grabar") + '</a></li>');
          ul.appendChild(li);
        });
        list.appendChild(box);
      });
      if (!list.children.length) list.innerHTML = '<p class="muted">No hay señas en este filtro.</p>';
    }
    draw();
    App.$("[data-exp]", root).addEventListener("click", function () {
      if (!Md.count()) { App.toast("Todavía no hay videos"); return; }
      App.toast("Preparando paquete…");
      Md.exportPack().then(function (txt) { App.download("conectalsa-videos-" + App.today() + ".json", txt, "application/json"); });
    });
    App.$("[data-imp]", root).addEventListener("change", function () {
      var f = this.files[0]; if (!f) return; App.toast("Importando…");
      f.text().then(Md.importPack).then(function (n) { App.toast(n + " videos importados"); V.referente(root); }).catch(function (e) { App.toast("No se pudo importar: " + e.message); });
    });
    App.$("[data-pinf]", root).addEventListener("submit", function (e) { e.preventDefault(); R.pin = App.$("[data-pin]", root).value.trim(); App.refUnlocked = true; App.save(); App.toast(R.pin ? "PIN guardado" : "PIN quitado"); V.referente(root); });
  };

  /* =======================================================
     GRABAR / SUBIR / VALIDAR EL VIDEO DE UNA SEÑA
     ======================================================= */
  V.grabar = function (root, params) {
    if (!App.refGate(root)) return;
    var it = C.ITEMS[decodeURIComponent(params[0] || "")]; if (!it) return App.go("#/referente", true);
    var stream = null, rec = null, chunks = [], blob = null, timer = 0, me = App.data.get("ref-name", "");
    function stopAll() { clearInterval(timer); if (rec && rec.state !== "inactive") try { rec.stop(); } catch (e) {} if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    function view() {
      stopAll();
      var m = Md.info(it.id);
      root.innerHTML = '<a class="link" href="#/referente">← Videos</a><span class="eyebrow" style="margin-top:10px">' + esc(App.level(it.level).title) + '</span><h1>' + esc(App.itemTitle(it)) + '</h1><p class="muted">' + esc(it.uso) + '</p>' +
        '<div class="grid two"><div data-cur></div><div class="stack" data-act></div></div>';
      var cur = App.$("[data-cur]", root), act = App.$("[data-act]", root);
      if (m) {
        cur.appendChild(App.mediaFor(it));
        act.appendChild(App.el('<div class="card"><span class="eyebrow">Video actual</span><p>Seña: <strong>' + esc(m.signer || "—") + '</strong><br>' + (m.validatedBy ? "Validó: <strong>" + esc(m.validatedBy) + "</strong>" : "Todavía no lo validó otra persona.") + '</p></div>'));
        if (m.source === "local") {
          if (!m.validatedBy) {
            var vb = App.el('<button class="btn block good" type="button">✔ Validar este video</button>');
            vb.addEventListener("click", function () {
              if (!me) { App.toast("Escribí tu nombre en el panel del referente"); return; }
              if (me === m.signer) { App.toast("La validación tiene que hacerla otra persona referente"); return; }
              Md.validate(it.id, me).then(function () { App.fx("ok"); App.toast("Validado"); view(); });
            });
            act.appendChild(vb);
          }
          var dl = App.el('<button class="btn ghost block" type="button">⬇ Descargar video</button>');
          dl.addEventListener("click", function () { Md.blob(it.id).then(function (b) { App.download("conectalsa-" + it.id + (/mp4/.test(b.type) ? ".mp4" : ".webm"), b); }); });
          act.appendChild(dl);
          var del = App.el('<button class="btn bad block" type="button">Borrar video</button>');
          App.confirmBtn(del, function () { Md.remove(it.id).then(function () { App.toast("Video borrado"); view(); }); });
          act.appendChild(del);
        }
      } else cur.appendChild(App.mediaFor(it));
      var recb = App.el('<button class="btn big block" type="button">⏺ ' + (m ? "Grabar de nuevo" : "Grabar con la cámara") + '</button>');
      recb.addEventListener("click", recorder); act.appendChild(recb);
      var up = App.el('<label class="btn ghost block">📁 Subir un archivo de video<input type="file" accept="video/*" hidden></label>');
      App.$("input", up).addEventListener("change", function () { var f = this.files[0]; if (!f) return; if (f.size > 25e6) { App.toast("El archivo es muy grande (máx. 25 MB)"); return; } blob = f; review(); });
      act.appendChild(up);
    }
    function recorder() {
      if (!me) { App.toast("Primero escribí tu nombre en el panel del referente"); App.go("#/referente"); return; }
      root.innerHTML = '<button class="link" type="button" data-back>← Cancelar</button><h1 style="margin-top:10px">Grabar: ' + esc(it.label) + '</h1>' +
        '<div class="recorder"><div class="rec-box"><video playsinline muted autoplay></video><div class="rec-frame" aria-hidden="true"><span>cabeza</span><span>cintura</span></div><div class="rec-count" hidden></div><span class="rec-dot" hidden>● REC</span></div>' +
        '<label class="check"><input type="checkbox" data-ok> La persona que aparece dio su consentimiento para usar este video en ConectaLSA.</label>' +
        '<div class="row"><button class="btn big" type="button" data-go disabled>⏺ Empezar (cuenta 3, graba hasta 6 s)</button><button class="btn ghost" type="button" data-stop hidden>⏹ Terminar</button></div>' +
        '<div class="bar" hidden data-pb><i style="width:0%"></i></div></div>';
      App.$("[data-back]", root).addEventListener("click", view);
      var v = App.$("video", root), go = App.$("[data-go]", root), stopB = App.$("[data-stop]", root), cnt = App.$(".rec-count", root);
      App.$("[data-ok]", root).addEventListener("change", function () { go.disabled = !this.checked || !stream; });
      if (!navigator.mediaDevices || !window.MediaRecorder) { App.toast("Este navegador no permite grabar. Subí un archivo."); return; }
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: false }).then(function (s) {
        stream = s; v.srcObject = s; go.disabled = !App.$("[data-ok]", root).checked;
      }).catch(function () { App.toast("No se pudo abrir la cámara. Podés subir un archivo."); });
      go.addEventListener("click", function () {
        go.disabled = true; var n = 3; cnt.hidden = false; cnt.textContent = n;
        var t = setInterval(function () {
          n--; App.fx("tick");
          if (n > 0) { cnt.textContent = n; return; }
          clearInterval(t); cnt.hidden = true; start();
        }, 800);
      });
      function start() {
        chunks = [];
        var mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].filter(function (x) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); })[0];
        rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2500000 } : undefined);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () { blob = new Blob(chunks, { type: rec.mimeType || "video/webm" }); review(); };
        rec.start(200);
        App.$(".rec-dot", root).hidden = false; stopB.hidden = false; App.$("[data-pb]", root).hidden = false;
        var t0 = Date.now();
        timer = setInterval(function () {
          var el = (Date.now() - t0) / 6000; var pb = App.$("[data-pb] i", root); if (pb) pb.style.width = Math.min(100, el * 100) + "%";
          if (el >= 1) { clearInterval(timer); if (rec.state !== "inactive") rec.stop(); }
        }, 100);
        stopB.addEventListener("click", function () { clearInterval(timer); if (rec.state !== "inactive") rec.stop(); });
      }
    }
    function review() {
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      var url = URL.createObjectURL(blob);
      root.innerHTML = '<h1>¿Quedó bien?</h1><p class="muted">Revisá que se vea la seña completa, con buena luz, y la expresión facial.</p><div class="media"><div class="media-box"><video src="' + url + '" playsinline muted loop autoplay controls></video></div></div>' +
        '<div class="row" style="margin-top:14px"><button class="btn ghost" type="button" data-re>↺ Repetir</button><button class="btn big" type="button" data-save>✔ Guardar video</button></div>';
      App.$("[data-re]", root).addEventListener("click", function () { URL.revokeObjectURL(url); view(); });
      App.$("[data-save]", root).addEventListener("click", function () {
        Md.put(it.id, blob, me || "Sin nombre").then(function () { URL.revokeObjectURL(url); App.fx("ok"); App.toast("Video guardado. Falta que lo valide otra persona."); view(); })
          .catch(function (e) { App.toast("No se pudo guardar: " + e.message); });
      });
    }
    view();
    return stopAll;
  };
})(window.App);
