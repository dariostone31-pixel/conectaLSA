/* =========================================================
   ConectaLSA · Aprender
   Mapa de niveles · Nivel · Reproductor de lección · Repaso · Diccionario · Consejos
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var C = App.CONTENT, esc = App.esc;

  function stars(n, max) { var h = ""; for (var i = 0; i < (max || 3); i++) h += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return '<span class="stars" aria-label="' + n + ' de ' + (max || 3) + ' estrellas">' + h + '</span>'; }
  App.starsHTML = stars;

  /* =======================================================
     INICIO: mapa de niveles
     ======================================================= */
  V.niveles = function (root) {
    var p = App.P(), av = App.avatar(p.avatar);
    var goal = p.goal || 30, tx = App.todayXp(), pct = Math.min(100, Math.round(tx / goal * 100));
    var next = App.nextLesson(), due = App.dueItems().length;
    root.innerHTML =
      '<section class="hello">' +
        '<div class="hello-main"><span class="ava big">' + av.ico + '</span><div><span class="eyebrow">Hola, ' + esc(p.name) + '</span><h1>¿Seguimos aprendiendo?</h1></div></div>' +
        '<div class="hello-goal"><div class="ring" style="--p:' + pct + '"><span>' + tx + '/' + goal + '</span></div><div><strong>Meta de hoy</strong><br><span class="small">' + App.ico("fuego") + ' ' + App.streak() + (App.streak() === 1 ? ' día seguido' : ' días seguidos') + ' · ' + App.ico("estrella-llena") + ' ' + App.totalStars() + (App.totalStars() === 1 ? ' estrella' : ' estrellas') + '</span></div></div>' +
        '<div class="row">' + (next ? '<a class="btn big" href="#/leccion/' + next.level.id + '/' + next.lesson.id + '">' + App.ico("play") + ' Continuar: ' + esc(next.level.title) + '</a>' : '<span class="tag good">' + App.ico("trofeo") + ' ¡Completaste todos los niveles!</span>') +
        (due ? '<a class="btn alt" href="#/repaso">' + App.ico("repaso") + ' Repasar (' + due + ')</a>' : "") + '</div>' +
      '</section>' + App.betaNote() +
      '<div class="section-title"><h2>Niveles</h2><span class="small muted">Todos abiertos: empezá por donde quieras</span></div>' +
      '<ol class="path" data-path></ol>' +
      '<div class="section-title"><h2>Consejos para señar mejor</h2><a class="small" href="#/consejos">Ver todos</a></div>' +
      '<div class="tips" data-tips></div>';
    var path = App.$("[data-path]", root);
    C.LEVELS.forEach(function (lv, i) {
      var pr = App.levelProgress(lv.id), isNext = next && next.level.id === lv.id;
      var li = App.el('<li class="lvl' + (pr.pct >= 1 ? " done" : "") + (isNext ? " next" : "") + '" style="--c:' + lv.color + '">' +
        '<a href="#/nivel/' + lv.id + '"><span class="lvl-n">' + (pr.pct >= 1 ? App.ico("check-simple") : lv.n) + '</span>' +
        '<span class="lvl-ico" aria-hidden="true">' + App.icoNivel(lv.id) + '</span>' +
        '<span class="lvl-body"><small>Nivel ' + lv.n + (isNext ? ' · <b>Recomendado</b>' : "") + '</small><strong>' + esc(lv.title) + '</strong><span class="small muted">' + esc(lv.desc) + '</span>' +
        '<span class="bar"><i style="width:' + Math.round(pr.pct * 100) + '%"></i></span></span>' +
        '<span class="lvl-stars">' + pr.stars + '/' + pr.max + ' ★</span></a></li>');
      path.appendChild(li);
    });
    var tips = App.$("[data-tips]", root);
    C.CONSEJOS.slice(0, 3).forEach(function (t) { tips.appendChild(App.el('<a class="tip" href="#/consejos#' + t.id + '"><span class="tip-ico">' + App.icoTip(t.id) + '</span><strong>' + esc(t.title) + '</strong><span class="small muted">' + esc(t.short) + '</span></a>')); });
  };

  /* =======================================================
     NIVEL: lecciones + consejo
     ======================================================= */
  V.nivel = function (root, params) {
    var lv = App.level(params[0]); if (!lv) return App.go("#/niveles", true);
    var p = App.P(), pr = App.levelProgress(lv.id), tip = C.CONSEJOS.filter(function (t) { return t.id === lv.tip; })[0];
    root.innerHTML = '<a class="link" href="#/niveles">← Niveles</a>' +
      '<div class="lvl-head" style="--c:' + lv.color + '"><span class="lvl-ico big">' + App.icoNivel(lv.id) + '</span><div><span class="eyebrow">Nivel ' + lv.n + '</span><h1>' + esc(lv.title) + '</h1><p class="muted">' + esc(lv.desc) + ' · ' + pr.stars + ' de ' + pr.max + ' ★</p></div></div>' +
      '<ul class="lesson-list" data-list></ul>' +
      (tip ? '<a class="tip wide" href="#/consejos#' + tip.id + '"><span class="tip-ico">' + App.icoTip(tip.id) + '</span><span><strong>Consejo: ' + esc(tip.title) + '</strong><br><span class="small muted">' + esc(tip.short) + '</span></span></a>' : "") +
      '<div class="section-title"><h2>Señas de este nivel</h2><a class="small" href="#/diccionario/' + lv.id + '">Abrir en el diccionario</a></div><div class="sign-grid" data-signs></div>';
    var list = App.$("[data-list]", root);
    lv.lessons.forEach(function (l, i) {
      var s = p.stars[lv.id + "/" + l.id] || 0;
      list.appendChild(App.el('<li class="lesson-row' + (s ? " done" : "") + '"><a href="#/leccion/' + lv.id + '/' + l.id + '"><span class="num">' + (l.challenge ? App.ico("meta") : i + 1) + '</span>' +
        '<span class="grow"><strong>' + (l.challenge ? "Desafío del nivel" : "Lección " + (i + 1)) + '</strong><br><span class="small muted">' + esc(l.challenge ? "Todas las señas mezcladas" : l.title) + '</span></span>' + stars(s) + '</a></li>'));
    });
    var grid = App.$("[data-signs]", root);
    lv.items.forEach(function (id) { grid.appendChild(signCard(C.ITEMS[id])); });
  };

  function signCard(it) {
    var has = App.Media.has(it.id), ok = App.mastered(it.id);
    return App.el('<a class="sign-card" href="#/sena/' + encodeURIComponent(it.id) + '"><span class="sc-label">' + esc(it.label) + '</span>' +
      '<span class="sc-meta"><span class="sc-dot" title="' + (has ? "Video disponible" : "Video en producción") + '">' + (has ? App.ico("camara") : App.ico("reloj")) + '</span>' + (ok ? ' <span class="ico" title="Dominada">' + App.ico("check-simple") + '</span>' : "") + '</span></a>');
  }

  /* =======================================================
     REPRODUCTOR DE LECCIÓN (genérico)
     ======================================================= */
  /**
   * Corre una secuencia de pasos. Siempre hay Reintentar / Saltar / Siguiente (R2) y una ✕ para salir.
   * steps: [{type, item, ...}] · cfg: {title, exit, onFinish(score)}
   */
  function runPlayer(root, steps, cfg) {
    var st = { i: 0, ok: 0, scored: 0, ai: 0, cam: null };
    function stopCam() { if (st.cam) { try { st.cam.stop(); } catch (e) {} st.cam = null; } }
    function render() {
      stopCam();
      root.innerHTML = '<div class="player-top"><a class="icon-btn" href="' + cfg.exit + '" aria-label="Salir"><span class="ico">' + App.ico("cerrar") + '</span></a><div class="bar"><i style="width:' + Math.round(st.i / steps.length * 100) + '%"></i></div><span class="small muted">' + Math.min(st.i + 1, steps.length) + ' / ' + steps.length + '</span></div><section class="stage" data-stage></section>';
      var stage = App.$("[data-stage]", root);
      if (st.i >= steps.length) return finish(stage);
      var s = steps[st.i];
      ({ observe: stepObserve, practice: stepPractice, write: stepWrite, quiz: stepQuiz, card: stepCard, spell: stepSpell })[s.type](stage, s);
      if (cfg.note && st.i === 0) stage.insertBefore(App.el(cfg.note), stage.firstChild);
      var f = App.$("[data-focus]", stage) || App.$("[data-next]", stage); if (f && s.type !== "write") f.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    function next() { st.i++; render(); }
    function actions(stage, o) {
      var bar = App.el('<div class="player-actions"></div>');
      if (o.retry) { var r = App.el('<button class="btn ghost" type="button">↺ Reintentar</button>'); r.addEventListener("click", o.retry); bar.appendChild(r); }
      if (o.skip !== false) { var sk = App.el('<button class="btn ghost" type="button">Saltar</button>'); sk.addEventListener("click", function () { next(); }); bar.appendChild(sk); }
      bar.appendChild(App.el('<span class="grow"></span>'));
      var nx = App.el('<button class="btn big" type="button" data-next>' + (o.nextLabel || "Siguiente →") + '</button>');
      if (o.nextDisabled) nx.disabled = true;
      nx.addEventListener("click", function () { if (o.onNext && o.onNext() === false) return; next(); });
      bar.appendChild(nx); stage.appendChild(bar); return nx;
    }
    function title(it) { return esc(App.itemTitle(it)); }

    /* --- 1. Observá --- */
    function stepObserve(stage, s) {
      var it = s.item; App.track(it.id, "seen");
      stage.innerHTML = '<span class="step-kicker">" + App.ico("ojo") + " Observá</span><h2>' + title(it) + '</h2><p class="muted">' + esc(it.uso) + '</p>';
      stage.appendChild(App.mediaFor(it));
      stage.appendChild(App.el('<p class="small muted" style="margin-top:10px">Fijate en la forma de la mano, hacia dónde mira la palma, dónde se hace, el movimiento y la cara. Usá «Lento» y «Espejo» si te ayuda.</p>'));
      actions(stage, { skip: false });
    }

    /* --- 2. Practicá con la cámara (IA si está entrenada; si no, espejo + autoevaluación) --- */
    function stepPractice(stage, s) {
      var it = s.item, label = it.aiLabel, M = App.Vision.Model, camOn = App.state().settings.camera !== false;
      var aiReady = camOn && M.has(label) && M.ready(), done = false, nx;
      st.scored++;
      stage.innerHTML = '<span class="step-kicker">" + App.ico("mano") + " Practicá</span><h2>' + title(it) + '</h2>' +
        '<p class="muted">' + (aiReady ? "Hacé la seña frente a la cámara. Te vamos a decir qué tan parecida está y qué ajustar." : camOn ? "Usá la cámara como espejo y compará con el video. Después contanos cómo te salió." : "Hacé la seña mirando el video y contanos cómo te salió.") + '</p>' +
        '<div class="lab-grid">' + (camOn ? '<div data-cam></div>' : "") + '<div data-side></div></div>';
      var side = App.$("[data-side]", stage);
      var ref = App.mediaFor(it, { compact: true }); side.appendChild(ref);
      if (aiReady) {
        side.appendChild(App.el('<div class="card" style="margin-top:12px"><span class="eyebrow">Lo que ve la cámara</span><ul class="conf-list" data-conf><li class="muted">Esperando tu mano…</li></ul><ul class="hint-list" data-hints></ul></div>'));
        side.appendChild(App.el('<p class="small muted">¿Sabés que la hacés bien y no te reconoce? No es tu culpa: la IA puede necesitar más ejemplos. <button class="link" type="button" data-self>Marcar como lograda</button></p>'));
        var sm = new App.Vision.Smoother(12);
        st.cam = new App.Vision.Camera(App.$("[data-cam]", stage), { intro: "Practicá " + App.itemTitle(it), autostart: App.camOK, onStart: function () { App.camOK = true; },
          onFrame: function (info) {
            if (done) return;
            var h = info.hands[0];
            if (!h) { sm.push(null); return; }
            var r = M.predict(App.Vision.features(h.canon)), top = r.unknown ? null : r.top[0];
            var res = sm.push(top ? top.label : null, top ? top.p : 0);
            var conf = App.$("[data-conf]", stage), hintEl = App.$("[data-hints]", stage); if (!conf) return;
            conf.innerHTML = r.unknown ? '<li class="muted">Todavía no reconozco esta forma…</li>' : r.top.slice(0, 3).map(function (x) {
              var nm = C.ITEMS[x.label] ? C.ITEMS[x.label].label : x.label;
              return '<li><span>' + esc(nm) + '</span><span class="bar ' + (x.label === label ? "good" : "") + '"><i style="width:' + Math.round(x.p * 100) + '%"></i></span><span>' + Math.round(x.p * 100) + '%</span></li>';
            }).join("");
            var hs = App.Vision.hints(h.canon, label);
            hintEl.innerHTML = hs.length ? hs.map(function (x) { return '<li><span class="ico">' + App.ico("bombilla") + '</span> ' + esc(x.text) + "</li>"; }).join("") : '<li class="ok"><span class="ico">' + App.ico("check-simple") + '</span> La forma se parece a la de referencia</li>';
            st.cam.root.classList.toggle("success", res.label === label);
            if (res.full && res.label === label && res.ratio >= 0.6 && res.p >= 0.5) success(true);
          } });
        App.$("[data-self]", side).addEventListener("click", function () { success(false); });
      } else {
        if (camOn) {
          st.cam = new App.Vision.Camera(App.$("[data-cam]", stage), { intro: "Usá la cámara como espejo", autostart: App.camOK, onStart: function () { App.camOK = true; } });
          side.appendChild(App.el('<p class="small muted" style="margin-top:10px"><span class="ico">' + App.ico("mano") + '</span> La cámara todavía no aprendió esta seña: necesita ejemplos de referentes sordos. Mientras tanto, autoevaluate.</p>'));
        }
        var self = App.el('<div><p style="margin:14px 0 0;font-weight:700">¿Cómo te salió?</p><div class="self-eval"><button type="button" data-v="ok" data-focus><span>😄</span>Me salió</button><button type="button" data-v="casi"><span>🙂</span>Casi</button><button type="button" data-v="rep"><span>🔁</span>Repetir</button></div></div>');
        side.appendChild(self);
        App.$$("[data-v]", self).forEach(function (b) {
          b.addEventListener("click", function () {
            var v = b.dataset.v; App.track(it.id, v);
            if (v === "rep") { var vid = App.$("video", ref); if (vid) { vid.currentTime = 0; vid.play(); } App.toast("Mirá la seña otra vez y probá de nuevo"); return; }
            if (v === "ok") { st.ok++; App.addXp(5); App.fx("ok"); } else { st.ok += 0.5; App.addXp(3); }
            next();
          });
        });
      }
      function success(byAI) {
        if (done) return; done = true;
        st.ok++; if (byAI) { st.ai++; App.track(it.id, "ai"); } else App.track(it.id, "ok");
        App.addXp(byAI ? 10 : 5); App.fx("ok");
        side.insertBefore(App.el('<div class="feedback good">' + (byAI ? "¡Muy bien! La cámara reconoció tu seña. +10" : "Marcada como lograda. +5") + '<p>' + (byAI ? "La cámara mira la forma de la mano; el movimiento y la cara los evalúa una persona." : "Gracias: esto ayuda a mejorar el entrenamiento.") + '</p></div>'), side.firstChild);
        if (nx) { nx.disabled = false; nx.focus(); }
      }
      nx = actions(stage, { retry: aiReady ? function () { done = false; App.$$(".feedback", side).forEach(function (x) { x.remove(); }); st.cam && st.cam.root.classList.remove("success"); } : null });
    }

    /* --- 3. ¿Cómo se escribe? (corrección tolerante: tildes, mayúsculas y signos no importan) --- */
    function stepWrite(stage, s) {
      var it = s.item, tries = 0, solved = false; st.scored++;
      stage.innerHTML = '<span class="step-kicker">" + App.ico("texto") + " ¿Cómo se escribe?</span><h2>¿Qué ' + (it.kind === "letra" ? "letra" : "seña") + ' es?</h2>';
      stage.appendChild(App.mediaFor(it, { hideLabel: true }));
      var f = App.el('<form class="write" autocomplete="off"><label class="sr" for="wr">Tu respuesta</label><input id="wr" type="text" inputmode="text" autocapitalize="' + (it.kind === "letra" ? "characters" : "sentences") + '" maxlength="' + (it.kind === "letra" ? 2 : 30) + '" placeholder="' + (it.kind === "letra" ? "Escribí la letra" : "Escribí la palabra") + '" spellcheck="false"><button class="btn" type="submit">Comprobar</button></form>');
      stage.appendChild(f);
      var fbBox = App.el('<div aria-live="polite"></div>'); stage.appendChild(fbBox);
      var hint = App.el('<button class="link small" type="button"><span class="ico">' + App.ico("bombilla") + '</span> Pista</button>'); stage.appendChild(hint);
      var input = App.$("input", f); setTimeout(function () { input.focus(); }, 50);
      hint.addEventListener("click", function () { var w = it.write; fbBox.innerHTML = '<div class="feedback info">Empieza con «' + esc(w.replace(/^[¿¡]/, "").charAt(0).toUpperCase()) + '» y tiene ' + App.norm(w).replace(/ /g, "").length + ' letras.</div>'; });
      f.addEventListener("submit", function (e) {
        e.preventDefault(); if (solved) return;
        tries++;
        var near = !App.answerOk(input.value, it) && App.nearMiss(input.value, it);
        if (near) {
          solved = true; st.ok += tries === 1 ? 1 : 0.5; App.addXp(tries === 1 ? 4 : 2); App.track(it.id, "write-ok"); App.fx("ok");
          fbBox.innerHTML = '<div class="feedback good">¡Bien! Reconociste la seña. Ojo con la ortografía: se escribe «' + esc(it.write) + '».</div>'; nx.disabled = false; nx.focus();
        } else if (App.answerOk(input.value, it)) {
          solved = true; if (tries === 1) { st.ok++; App.addXp(5); } else { st.ok += 0.5; App.addXp(2); }
          App.track(it.id, "write-ok"); App.fx("ok");
          fbBox.innerHTML = '<div class="feedback good">¡Correcto! Es «' + esc(it.label) + '».</div>'; nx.disabled = false; nx.focus();
        } else {
          App.fx("bad");
          if (tries >= 2) { solved = true; App.track(it.id, "write-fail"); fbBox.innerHTML = '<div class="feedback bad">Era «' + esc(it.label) + '». La vas a ver otra vez en el repaso.</div>'; nx.disabled = false; nx.focus(); }
          else fbBox.innerHTML = '<div class="feedback bad">Todavía no. Mirá el video otra vez (probá «Lento») y volvé a intentar.</div>';
        }
      });
      var nx = actions(stage, { retry: function () { tries = 0; solved = false; input.value = ""; fbBox.innerHTML = ""; nx.disabled = true; input.focus(); }, nextDisabled: true });
    }

    /* --- 4a. ¿Cuál es? (video → opciones) --- */
    function stepQuiz(stage, s) {
      var it = s.item, answered = false; st.scored++;
      var pool = (s.pool || []).filter(function (id) { return id !== it.id; });
      var opts = App.shuffle([it].concat(App.sample(pool, 3).map(function (id) { return C.ITEMS[id]; })));
      stage.innerHTML = '<span class="step-kicker">" + App.ico("buscar") + " ¿Cuál es?</span><h2>Elegí la seña que ves</h2>';
      stage.appendChild(App.mediaFor(it, { hideLabel: true }));
      var box = App.el('<div class="options"></div>'); stage.appendChild(box);
      var fb = App.el('<div aria-live="polite"></div>'); stage.appendChild(fb);
      opts.forEach(function (o, k) {
        var b = App.el('<button class="option" type="button"' + (k === 0 ? " data-focus" : "") + '><span class="k">' + "ABCD"[k] + '</span>' + esc(App.itemTitle(o)) + '</button>');
        b.addEventListener("click", function () {
          if (answered) return; answered = true;
          var ok = o.id === it.id;
          App.$$(".option", box).forEach(function (x, j) { x.disabled = true; if (opts[j].id === it.id) x.classList.add("correct"); else if (x === b) x.classList.add("wrong"); });
          if (ok) { st.ok++; App.addXp(4); App.fx("ok"); App.track(it.id, "ok"); } else { App.fx("bad"); App.track(it.id, "rep"); }
          fb.innerHTML = '<div class="feedback ' + (ok ? "good" : "bad") + '">' + (ok ? "¡Bien!" : "Era «" + esc(it.label) + "».") + '</div>';
          nx.disabled = false; nx.focus();
        });
        box.appendChild(b);
      });
      var nx = actions(stage, { nextDisabled: true });
    }

    /* --- 4b. Tarjeta de memoria (funciona aunque no haya video) --- */
    function stepCard(stage, s) {
      var it = s.item; st.scored++;
      stage.innerHTML = '<span class="step-kicker">" + App.ico("repaso") + " ¿Te acordás?</span><h2>¿Cómo se hace «' + esc(it.label) + '»?</h2><p class="muted">Hacé la seña de memoria y después mirá si te salió igual.</p>';
      var reveal = App.el('<button class="btn big alt" type="button" data-focus>" + App.ico("ojo") + " Ver la seña</button>'); stage.appendChild(reveal);
      var holder = App.el('<div></div>'); stage.appendChild(holder);
      reveal.addEventListener("click", function () {
        reveal.remove(); holder.appendChild(App.mediaFor(it));
        var self = App.el('<div><p style="margin:14px 0 0;font-weight:700">¿Te acordabas?</p><div class="self-eval"><button type="button" data-v="ok"><span>😄</span>Sí</button><button type="button" data-v="casi"><span>🙂</span>Más o menos</button><button type="button" data-v="rep"><span>🤔</span>No</button></div></div>');
        holder.appendChild(self);
        App.$$("[data-v]", self).forEach(function (b) { b.addEventListener("click", function () { var v = b.dataset.v; App.track(it.id, v); if (v === "ok") { st.ok++; App.addXp(3); App.fx("ok"); } else if (v === "casi") { st.ok += 0.5; App.addXp(2); } else App.addXp(1); next(); }); });
        App.$("[data-v]", self).focus();
      });
      actions(stage, {});
    }

    /* --- 5. Deletreá (niveles de letras) --- */
    function stepSpell(stage, s) {
      st.scored++;
      stage.innerHTML = '<span class="step-kicker">" + App.ico("dado") + " Deletreá</span><h2>Hacé las letras en orden</h2><p class="muted">' + (App.state().settings.camera === false ? "Hacé cada letra y tocá «Siguiente letra»." : "Si la cámara conoce la letra, avanza sola cuando te reconoce. Si no, tocá «Siguiente letra».") + '</p>';
      var nx;
      st.cam = App.spellWidget(stage, s.word, function () { st.ok++; App.P().spelled++; App.addXp(8); nx.disabled = false; nx.focus(); });
      nx = actions(stage, { nextDisabled: true });
    }

    function finish(stage) {
      var ratio = st.scored ? st.ok / st.scored : 1;
      var n = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      var res = cfg.onFinish ? cfg.onFinish(n, ratio) : {};
      App.fx("win");
      stage.innerHTML = '<div class="celebrate"><div class="big">' + (n === 3 ? App.ico("trofeo") : n === 2 ? App.ico("fuego") : App.ico("mano")) + '</div><h2>' + esc(res.title || "¡Lección terminada!") + '</h2>' +
        '<div class="stars xl">' + stars(n) + '</div>' +
        '<p class="muted">' + (st.scored ? Math.round(ratio * 100) + "% de aciertos" : "") + (st.ai ? " · " + st.ai + " señas reconocidas por la cámara" : "") + '</p>' +
        (n < 3 ? '<p class="small muted">Podés repetirla cuando quieras para sumar estrellas. Nada se bloquea.</p>' : "") +
        '<div class="row center">' + (res.again ? '<a class="btn ghost" href="' + res.again + '" data-again>↺ Repetir</a>' : "") + (res.next ? '<a class="btn big" href="' + res.next + '">' + esc(res.nextLabel || "Siguiente lección →") + '</a>' : '<a class="btn big" href="' + cfg.exit + '">Volver</a>') + '</div></div>';
      var again = App.$("[data-again]", stage); if (again) again.addEventListener("click", function (e) { e.preventDefault(); st = { i: 0, ok: 0, scored: 0, ai: 0, cam: null }; render(); });
    }
    render();
    return function () { stopCam(); };
  }
  App.runPlayer = runPlayer;

  /** Arma los pasos de una lección. */
  function buildSteps(lv, l) {
    var items = l.items.map(function (id) { return C.ITEMS[id]; });
    var withMedia = items.filter(function (it) { return App.Media.has(it.id); });
    var pool = lv.items, steps = [];
    var mediaPool = pool.filter(function (id) { return App.Media.has(id); });
    if (!l.challenge) {
      items.forEach(function (it) { steps.push({ type: "observe", item: it }); steps.push({ type: "practice", item: it }); });
      App.shuffle(withMedia).forEach(function (it) { steps.push({ type: "write", item: it }); });
      App.shuffle(items).forEach(function (it) { steps.push(mediaPool.length >= 3 && App.Media.has(it.id) ? { type: "quiz", item: it, pool: mediaPool } : { type: "card", item: it }); });
    } else {
      App.sample(items, Math.min(8, items.length)).forEach(function (it, k) {
        var M = App.Vision.Model;
        if (App.state().settings.camera !== false && M.has(it.aiLabel) && M.ready() && k % 2 === 0) steps.push({ type: "practice", item: it });
        else if (App.Media.has(it.id)) steps.push(k % 2 ? { type: "write", item: it } : (mediaPool.length >= 3 ? { type: "quiz", item: it, pool: mediaPool } : { type: "write", item: it }));
        else steps.push({ type: "card", item: it });
      });
    }
    if (items[0].kind === "letra") steps.push({ type: "spell", word: items.map(function (it) { return it.label; }).join("") });
    return steps;
  }

  V.leccion = function (root, params) {
    var lv = App.level(params[0]), l = App.lesson(lv, params[1]);
    if (!lv || !l) return App.go("#/niveles", true);
    var idx = lv.lessons.indexOf(l), nextL = lv.lessons[idx + 1];
    var li = C.LEVELS.indexOf(lv), nextLv = C.LEVELS[li + 1];
    return runPlayer(root, buildSteps(lv, l), {
      note: l.challenge ? App.betaNote(lv.items, true) : "",
      exit: "#/nivel/" + lv.id,
      onFinish: function (n) {
        App.setStars(lv.id + "/" + l.id, n); App.addXp(10);
        var next = nextL ? "#/leccion/" + lv.id + "/" + nextL.id : nextLv ? "#/nivel/" + nextLv.id : "#/niveles";
        return { title: l.challenge ? "¡Desafío superado!" : "¡Lección terminada!", again: "#/leccion/" + lv.id + "/" + l.id, next: next, nextLabel: nextL ? (nextL.challenge ? "Desafío del nivel →" : "Siguiente lección →") : nextLv ? "Nivel " + nextLv.n + ": " + nextLv.title + " →" : "Ver niveles" };
      }
    });
  };

  /* =======================================================
     REPASO INTELIGENTE (lo que te cuesta vuelve antes)
     ======================================================= */
  V.repaso = function (root) {
    var due = App.dueItems().slice(0, 10);
    if (!due.length) {
      root.innerHTML = '<a class="link" href="#/niveles">← Niveles</a><section class="stage celebrate"><div class="big">' + App.ico("estrella-llena") + '</div><h2>No tenés señas para repasar</h2><p class="muted">Las señas que te cuestan vuelven acá automáticamente: al día siguiente, a los 2 días, a la semana…</p><a class="btn big" href="#/niveles">Seguir aprendiendo</a></section>';
      return;
    }
    var mediaPool = App.allItems().filter(function (it) { return App.Media.has(it.id); }).map(function (it) { return it.id; });
    var steps = due.map(function (id, k) {
      var it = C.ITEMS[id];
      if (App.Media.has(id)) return k % 2 && mediaPool.length >= 4 ? { type: "quiz", item: it, pool: mediaPool } : { type: "write", item: it };
      return { type: "card", item: it };
    });
    return runPlayer(root, steps, { exit: "#/niveles", onFinish: function () { App.P().reviews++; App.addXp(10); App.checkBadges(); App.save(); return { title: "¡Repaso hecho!", next: "#/niveles", nextLabel: "Volver a los niveles" }; } });
  };

  /* Practicar una sola seña (desde el diccionario) */
  V.practicar = function (root, params) {
    var it = C.ITEMS[decodeURIComponent(params[0] || "")]; if (!it) return App.go("#/diccionario", true);
    return runPlayer(root, [{ type: "observe", item: it }, { type: "practice", item: it }], { exit: "#/sena/" + encodeURIComponent(it.id), onFinish: function () { return { title: "¡Bien practicado!", again: "#/practicar/" + encodeURIComponent(it.id), next: "#/sena/" + encodeURIComponent(it.id), nextLabel: "Volver a la seña" }; } });
  };

  /* =======================================================
     DICCIONARIO
     ======================================================= */
  V.diccionario = function (root, params) {
    var filter = params[0] || "todos", q = "";
    root.innerHTML = '<span class="eyebrow">Diccionario</span><h1>Todas las señas</h1>' +
      '<label class="search"><span class="sr">Buscar una seña</span><input type="search" placeholder="Buscar: hola, rojo, letra M…" data-q></label>' +
      '<div class="row chips" data-f></div><p class="small muted" data-count></p><div class="sign-grid" data-grid></div>';
    var fEl = App.$("[data-f]", root);
    [["todos", "Todas"]].concat(C.LEVELS.map(function (l) { return [l.id, l.title]; })).forEach(function (f) {
      var b = App.el('<button class="chip" type="button" aria-pressed="' + (f[0] === filter) + '">' + esc(f[1]) + '</button>');
      b.addEventListener("click", function () { filter = f[0]; App.$$(".chip", fEl).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); history.replaceState(null, "", "#/diccionario/" + filter); });
      fEl.appendChild(b);
    });
    App.$("[data-q]", root).addEventListener("input", function () { q = App.norm(this.value).replace(/^letra /, ""); draw(); });
    function draw() {
      var list = App.allItems().filter(function (it) {
        if (filter !== "todos" && it.level !== filter) return false;
        if (!q) return true;
        return [it.label].concat(it.alt).some(function (a) { return App.norm(a).indexOf(q) === 0 || (q.length > 1 && App.norm(a).indexOf(q) >= 0); });
      });
      var g = App.$("[data-grid]", root); g.innerHTML = "";
      list.forEach(function (it) { g.appendChild(signCard(it)); });
      App.$("[data-count]", root).textContent = list.length + " señas · con video · video en producción · dominada";
    }
    draw();
  };

  V.sena = function (root, params) {
    var it = C.ITEMS[decodeURIComponent(params[0] || "")]; if (!it) return App.go("#/diccionario", true);
    var lv = App.level(it.level), p = App.P(), r = p.items[it.id];
    var M = App.Vision.Model, ai = M.has(it.aiLabel);
    root.innerHTML = '<a class="link" href="#/diccionario/' + lv.id + '">← Diccionario</a>' +
      '<div class="sena-grid"><div><span class="eyebrow">' + esc(lv.title) + '</span><h1>' + esc(App.itemTitle(it)) + '</h1><p class="muted">' + esc(it.uso) + '</p><div data-media></div></div>' +
      '<div class="stack"><div class="card"><span class="eyebrow">Tu progreso con esta seña</span>' +
        (r ? '<p>Vista ' + r.seen + ' ' + (r.seen === 1 ? "vez" : "veces") + ' · escrita bien ' + r.wOk + ' · reconocida por la cámara ' + r.ai + '</p><p class="small muted">' + (App.mastered(it.id) ? "Dominada" : "Seguí practicando: aparece en tu repaso.") + '</p>' : '<p class="muted">Todavía no la practicaste.</p>') +
        '<a class="btn block" href="#/practicar/' + encodeURIComponent(it.id) + '">" + App.ico("mano") + " Practicar esta seña</a></div>' +
        '<div class="card"><span class="eyebrow">Cámara</span><p class="small" style="margin:0">' + (ai ? "La cámara puede reconocer esta seña (forma de la mano)." : "La cámara todavía no aprendió esta seña.") + '</p></div></div></div>';
    App.$("[data-media]", root).appendChild(App.mediaFor(it));
  };

  /* =======================================================
     CONSEJOS
     ======================================================= */
  V.consejos = function (root) {
    root.innerHTML = '<a class="link" href="#/niveles">← Niveles</a><span class="eyebrow" style="margin-top:10px">Consejos</span><h1>Para señar mejor</h1><div data-list></div>';
    var list = App.$("[data-list]", root);
    C.CONSEJOS.forEach(function (t) {
      list.appendChild(App.el('<article class="card consejo" id="' + t.id + '"><h2><span class="ico" aria-hidden="true">' + App.icoTip(t.id) + '</span> ' + esc(t.title) + '</h2>' + t.body.map(function (b) { return '<p>' + esc(b).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + '</p>'; }).join("") + '</article>'));
    });
    var h = location.hash.split("#")[2]; if (h) { var el = document.getElementById(h); if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 50); }
  };

  /* =======================================================
     Widget de deletreo
     ======================================================= */
  App.spellWidget = function (container, word, onDone) {
    var letters = word.toUpperCase().split("").filter(function (c) { return /[A-ZÑ]/.test(c); });
    var i = 0, M = App.Vision.Model, aiCount = 0, finished = false, camOn = App.state().settings.camera !== false;
    var wrap = App.el('<div><div class="word-display"></div><div class="lab-grid">' + (camOn ? '<div data-cam></div>' : "") + '<div data-side></div></div></div>');
    container.appendChild(wrap);
    var disp = App.$(".word-display", wrap), side = App.$("[data-side]", wrap);
    var info = App.el('<div class="card"><span class="eyebrow">Letra actual</span><div class="cur-letter" data-cur></div><p class="small muted" data-mode></p><ul class="conf-list" data-conf></ul><ul class="hint-list" data-hints></ul><button class="btn alt block" type="button" data-nextl>Siguiente letra →</button></div>');
    side.appendChild(info);
    var sm = new App.Vision.Smoother(10);
    function draw() {
      disp.innerHTML = letters.map(function (c, j) { return '<span class="' + (j < i ? "ok" : j === i ? "cur" : "") + '">' + c + '</span>'; }).join("");
      if (i >= letters.length) {
        if (!finished) { finished = true; info.innerHTML = '<div class="feedback good">¡Palabra deletreada!<p>' + (aiCount ? aiCount + " letras reconocidas por la cámara." : "Practicá con una persona sorda para recibir devolución.") + '</p></div>'; App.fx("win"); onDone(aiCount); }
        return;
      }
      var L = letters[i], has = camOn && M.has(L) && M.ready();
      App.$("[data-cur]", info).textContent = L;
      App.$("[data-mode]", info).textContent = has ? "La cámara conoce esta letra: avanza sola cuando te reconoce." : "Hacé la letra y tocá «Siguiente letra».";
      App.$("[data-conf]", info).innerHTML = ""; App.$("[data-hints]", info).innerHTML = "";
      sm.reset();
    }
    function advance(byAI) { if (byAI) { aiCount++; App.track("letra-" + letters[i].toLowerCase(), "ai"); } App.fx("ok"); i++; draw(); }
    App.$("[data-nextl]", info).addEventListener("click", function () { advance(false); });
    var cam = null;
    if (camOn) cam = new App.Vision.Camera(App.$("[data-cam]", wrap), { intro: "Deletreá frente a la cámara", autostart: App.camOK, onStart: function () { App.camOK = true; },
      onFrame: function (f) {
        if (i >= letters.length) return;
        var L = letters[i]; if (!(M.has(L) && M.ready())) return;
        var h = f.hands[0]; if (!h) { sm.push(null); return; }
        var r = M.predict(App.Vision.features(h.canon)), top = r.unknown ? null : r.top[0];
        var res = sm.push(top ? top.label : null, top ? top.p : 0);
        var conf = App.$("[data-conf]", info); if (!conf) return;
        conf.innerHTML = r.unknown ? '<li class="muted">No reconozco esta forma…</li>' : r.top.slice(0, 3).map(function (x) { return '<li><span>' + esc(x.label) + '</span><span class="bar ' + (x.label === L ? "good" : "") + '"><i style="width:' + Math.round(x.p * 100) + '%"></i></span><span>' + Math.round(x.p * 100) + '%</span></li>'; }).join("");
        App.$("[data-hints]", info).innerHTML = App.Vision.hints(h.canon, L).map(function (x) { return '<li><span class="ico">' + App.ico("bombilla") + '</span> ' + esc(x.text) + "</li>"; }).join("");
        if (res.full && res.label === L && res.ratio >= 0.6 && res.p >= 0.5) advance(true);
      } });
    draw();
    return cam;
  };
})(window.App);
