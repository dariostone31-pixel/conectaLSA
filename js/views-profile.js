/* =========================================================
   ConectaLSA · Perfiles, progreso y ajustes
   Bienvenida · ¿Quién aprende hoy? · Mi perfil · Panel de progreso (familias y docentes) · Ajustes · Acerca de
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var C = App.CONTENT, esc = App.esc;

  function avatarPicker(selected, unlockedStars) {
    return '<div class="avatar-grid" role="radiogroup" aria-label="Elegí tu avatar">' + App.AVATARS.map(function (a) {
      var locked = a.stars > unlockedStars;
      return '<button type="button" class="ava-opt' + (locked ? " locked" : "") + '" role="radio" aria-checked="' + (a.id === selected) + '" data-ava="' + a.id + '"' + (locked ? ' disabled title="Se desbloquea con ' + a.stars + ' estrellas"' : "") + '><span class="ava">' + a.ico + '</span><small>' + (locked ? App.ico("candado") + " " + a.stars : esc(a.name)) + '</small></button>';
    }).join("") + '</div>';
  }
  function bindPicker(root, onPick) {
    App.$$("[data-ava]", root).forEach(function (b) {
      b.addEventListener("click", function () { App.$$("[data-ava]", root).forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); }); onPick(b.dataset.ava); });
    });
  }
  function seg(name, opts, val) {
    return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-' + name + '="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + '</button>'; }).join("") + '</div>';
  }
  function bindSeg(root, name, fn) {
    App.$$("[data-" + name + "]", root).forEach(function (b) { b.addEventListener("click", function () { App.$$("[data-" + name + "]", root).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); fn(b.getAttribute("data-" + name)); }); });
  }

  /* =======================================================
     BIENVENIDA: crear perfil en 1 pantalla
     ======================================================= */
  V.bienvenida = function (root) {
    var first = !App.profiles().length;
    var f = { name: "", avatar: "fox", hand: "right", goal: 30 };
    root.innerHTML = '<section class="welcome">' +
      (first ? '<div class="welcome-hero"><span class="brand-mark xl" aria-hidden="true"><img src="icons/logo-blanco.svg" alt="" width="58" height="58"></span><h1>Aprendé Lengua de Señas Argentina</h1><p>Lecciones cortas con videos de personas sordas, práctica con la cámara y repaso para no olvidarte. Gratis, sin publicidad y sin registro en internet.</p></div>' : '<a class="link" href="#/perfiles">← Perfiles</a><h1>Nuevo perfil</h1>') +
      (first ? App.betaNote() : "") +
      '<form class="card stack" data-f autocomplete="off">' +
        '<label class="field"><span>¿Cómo te llamás?</span><input type="text" data-name maxlength="20" placeholder="Tu nombre o apodo" required></label>' +
        '<div class="field"><span>Elegí tu avatar <small class="muted">(desbloqueás más juntando estrellas)</small></span>' + avatarPicker("fox", 0) + '</div>' +
        '<div class="field"><span>¿Con qué mano escribís?</span>' + seg("hand", [["right", "Derecha"], ["left", "Izquierda"]], "right") + '<small class="muted">Si sos zurdo/a, mostramos los videos en espejo para que sea más fácil copiarlos.</small></div>' +
        '<div class="field"><span>¿Cuánto querés practicar por día?</span>' + seg("goal", [[20, "5 min"], [30, "10 min"], [50, "15 min"]], 30) + '</div>' +
        '<button class="btn big block" type="submit">Empezar</button>' +
        '<p class="small muted center" style="margin:0">Tu progreso queda guardado solo en este dispositivo. La cámara nunca graba.<br/><a href="#/privacidad">Política de privacidad</a></p>' +
      '</form>' + (first ? '<p class="center small"><a href="#/perfil-importar">Ya tengo una copia de seguridad</a></p>' : "") + '</section>';
    bindPicker(root, function (a) { f.avatar = a; });
    bindSeg(root, "hand", function (v) { f.hand = v; });
    bindSeg(root, "goal", function (v) { f.goal = +v; });
    App.$("[data-f]", root).addEventListener("submit", function (e) {
      e.preventDefault(); f.name = App.$("[data-name]", root).value.trim();
      if (!f.name) { App.$("[data-name]", root).focus(); return; }
      App.destino = null;                 // perfil nuevo: arranca en el inicio, no en un enlace viejo
      App.createProfile(f);
      if (f.hand === "left") { App.state().settings.mirrorVideos = true; App.save(); }
      App.toast("¡Hola, " + f.name + "!"); App.go("#/niveles");
    });
  };

  V["perfil-importar"] = function (root) {
    root.innerHTML = '<a class="link" href="#/bienvenida">← Volver</a><h1>Recuperar mi progreso</h1><div class="card"><p>Elegí el archivo <code>conectalsa-respaldo-….json</code> que descargaste desde «Mi perfil».</p><input type="file" accept=".json,application/json" data-file></div>';
    App.$("[data-file]", root).addEventListener("change", function () { importFile(this.files[0]); });
  };
  function importFile(file) {
    if (!file) return;
    file.text().then(function (t) { var p = App.importProfile(t); App.toast("Progreso de " + p.name + " recuperado"); App.go("#/niveles"); })
      .catch(function (e) { App.toast("No se pudo leer el archivo: " + e.message); });
  }

  /* =======================================================
     ¿QUIÉN APRENDE HOY? (varios perfiles en un mismo equipo)
     ======================================================= */
  V.perfiles = function (root) {
    var cur = App.P();
    root.innerHTML = '<h1 class="center">¿Quién aprende hoy?</h1><p class="center muted">Cada persona tiene su propio progreso. Ideal para familias y aulas.</p><div class="who-grid" data-g></div>' +
      '<p class="center"><a class="btn ghost" href="#/progreso"><span class="ico">' + App.ico("grafico") + '</span> Panel de progreso</a> ' +
      '<button class="btn ghost" type="button" data-logout><span class="ico">' + App.ico("salir") + '</span> Cerrar sesión</button></p>';
    var g = App.$("[data-g]", root);
    App.profiles().forEach(function (p) {
      var b = App.el('<button class="who' + (cur && p.id === cur.id ? " cur" : "") + '" type="button"><span class="ava big">' + App.avatar(p.avatar).ico + '</span><strong>' + esc(p.name) + '</strong><small>' +
        (App.hasPin(p) ? '<span class="ico">' + App.ico("candado") + '</span> ' : "") + App.totalStars(p) + ' estrellas · ' + App.streak(p) + ' días</small></button>');
      b.addEventListener("click", function () {
        if (App.hasPin(p) && (!cur || cur.id !== p.id)) { App.go("#/entrar/" + encodeURIComponent(p.id)); return; }
        App.switchProfile(p.id); App.toast("Hola, " + p.name); App.go("#/niveles");
      });
      g.appendChild(b);
    });
    var add = App.el('<a class="who add" href="#/bienvenida"><span class="ava big">' + App.ico("mas") + '</span><strong>Agregar</strong><small>Nuevo perfil</small></a>');
    g.appendChild(add);
    App.$("[data-logout]", root).addEventListener("click", function () { App.cerrarSesion(); });
  };

  /* =======================================================
     MI PERFIL
     ======================================================= */
  V.perfil = function (root) {
    var p = App.P(), ts = App.totalStars(p), av = App.avatar(p.avatar);
    var mastered = App.allItems().filter(function (it) { return App.mastered(it.id); }).length;
    App.checkBadges();
    root.innerHTML =
      '<section class="profile-head"><span class="ava xl">' + av.ico + '</span><div><h1>' + esc(p.name) + '</h1><p class="muted">' + Math.round((p.seconds || 0) / 60) + ' min de práctica · ' + p.xp + ' puntos</p></div><a class="btn ghost" href="#/perfiles">Cambiar perfil</a></section>' +
      '<div class="stats">' +
        stat("estrella-llena", ts, "estrellas") + stat("fuego", App.streak(p), "días seguidos") + stat("check", mastered, "señas dominadas") + stat("mano", p.aiOk, "reconocidas por la cámara") +
      '</div>' +
      '<div class="section-title"><h2>Medallas</h2></div><div class="badges" data-b></div>' +
      '<div class="section-title"><h2>Avatar</h2><span class="small muted">Juntá estrellas para desbloquear</span></div><div data-ava></div>' +
      '<div class="section-title"><h2>Tu progreso está seguro</h2></div>' +
      '<div class="card"><p>Se guarda en este dispositivo y le pedimos al navegador que no lo borre. Para pasarlo a otro equipo o por las dudas, descargá una copia.</p>' +
        '<div class="row"><button class="btn" type="button" data-exp><span class="ico">' + App.ico("descarga") + '</span> Descargar copia de seguridad</button>' +
        '<label class="btn ghost"><span class="ico">' + App.ico("subir") + '</span> Recuperar desde archivo<input type="file" accept=".json,application/json" data-imp hidden></label></div></div>' +
      '<div class="section-title"><h2>Acceso y opciones</h2></div>' +
      '<div class="row perfil-tools">' +
        '<a class="btn ghost" href="#/ajustes"><span class="ico">' + App.ico("ajustes") + '</span> Ajustes</a>' +
        '<a class="btn ghost" href="#/privacidad"><span class="ico">' + App.ico("candado") + '</span> Privacidad</a>' +
        '<a class="btn ghost" href="#/progreso"><span class="ico">' + App.ico("grafico") + '</span> Panel familias y docentes</a>' +
        '<a class="btn ghost" href="#/referente"><span class="ico">' + App.ico("documento") + '</span> Modo referente</a>' +
        '<a class="btn ghost" href="#/acerca"><span class="ico">' + App.ico("informacion") + '</span> Acerca de</a>' +
        '<button class="btn ghost" type="button" data-logout><span class="ico">' + App.ico("salir") + '</span> Cerrar sesión</button>' +
      '</div>';
    var b = App.$("[data-b]", root);
    App.BADGES.forEach(function (x) { var has = !!p.badges[x.id]; b.appendChild(App.el('<div class="badge' + (has ? " on" : "") + '" title="' + esc(x.desc) + '"><span class="b-ico">' + App.icoBadge(x.id) + '</span><strong>' + esc(x.name) + '</strong><small>' + esc(x.desc) + '</small></div>')); });
    App.$("[data-ava]", root).innerHTML = avatarPicker(p.avatar, ts);
    bindPicker(root, function (a) { p.avatar = a; App.save(); App.toast("Avatar actualizado"); V.perfil(root); });
    App.$("[data-exp]", root).addEventListener("click", function () { App.exportProfile(); App.toast("Copia descargada"); });
    App.$("[data-imp]", root).addEventListener("change", function () { importFile(this.files[0]); });
    App.$("[data-logout]", root).addEventListener("click", function () { App.cerrarSesion(); });
  };
  function stat(ico, n, t) { return '<div class="stat"><span class="stat-ico">' + App.ico(ico) + '</span><strong>' + n + '</strong><small>' + t + '</small></div>'; }

  /* =======================================================
     PANEL DE PROGRESO (familias y docentes)
     ======================================================= */
  V.progreso = function (root) {
    var ps = App.profiles();
    root.innerHTML = '<a class="link no-print" href="#/perfil">← Perfil</a><span class="eyebrow">Familias y docentes</span><h1>Panel de progreso</h1>' +
      '<p class="muted">Todos los perfiles de este dispositivo. Mostramos qué señas cuestan más para saber qué reforzar.</p>' +
      '<div class="row no-print"><button class="btn" type="button" data-csv><span class="ico">' + App.ico("descarga") + '</span> Descargar planilla (CSV)</button><button class="btn ghost" type="button" data-print><span class="ico">' + App.ico("documento") + '</span> Imprimir</button></div>' +
      '<div class="table-wrap"><table class="ptable"><thead><tr><th>Perfil</th>' + C.LEVELS.map(function (l) { return '<th title="' + esc(l.title) + '">' + App.icoNivel(l.id) + '<br><small>N' + l.n + '</small></th>'; }).join("") + '<th>' + App.ico("estrella-llena") + '</th><th>Min</th><th>Último día</th></tr></thead><tbody data-tb></tbody></table></div>' +
      '<div data-detail></div>';
    var tb = App.$("[data-tb]", root);
    ps.forEach(function (p) {
      var days = Object.keys(p.days).sort(), last = days[days.length - 1] || "—";
      var tr = App.el('<tr><th><button class="link" type="button">' + App.avatar(p.avatar).ico + ' ' + esc(p.name) + '</button></th>' + C.LEVELS.map(function (l) {
        var pr = levelProgressFor(p, l); return '<td><span class="cell" style="--p:' + Math.round(pr * 100) + '">' + Math.round(pr * 100) + '%</span></td>';
      }).join("") + '<td>' + App.totalStars(p) + '</td><td>' + Math.round((p.seconds || 0) / 60) + '</td><td>' + last + '</td></tr>');
      App.$("button", tr).addEventListener("click", function () { detail(p); });
      tb.appendChild(tr);
    });
    if (!ps.length) tb.innerHTML = '<tr><td colspan="14" class="muted">Todavía no hay perfiles.</td></tr>';
    function detail(p) {
      var hard = Object.keys(p.items).map(function (id) { var r = p.items[id]; return { id: id, r: r, score: (r.wFail || 0) * 2 + (r.self === "rep" ? 1.5 : r.self === "casi" ? 0.5 : 0) - (r.wOk || 0) * 0.5 }; })
        .filter(function (x) { return C.ITEMS[x.id] && x.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      App.$("[data-detail]", root).innerHTML = '<div class="card" style="margin-top:16px"><h2>' + App.avatar(p.avatar).ico + ' ' + esc(p.name) + '</h2>' +
        '<p>Escritura: ' + p.written.ok + ' bien / ' + p.written.fail + ' a repasar · Cámara: ' + p.aiOk + ' señas reconocidas · Repasos: ' + p.reviews + ' · Palabras deletreadas: ' + p.spelled + '</p>' +
        '<h3>Señas para reforzar</h3>' + (hard.length ? '<ul class="hard">' + hard.map(function (x) { return '<li><a href="#/sena/' + encodeURIComponent(x.id) + '">' + esc(App.itemTitle(C.ITEMS[x.id])) + '</a> <small class="muted">· ' + esc(App.level(C.ITEMS[x.id].level).title) + '</small></li>'; }).join("") + '</ul>' : '<p class="muted">¡Ninguna por ahora!</p>') + '</div>';
    }
    if (ps.length) detail(App.P() || ps[0]);
    App.$("[data-print]", root).addEventListener("click", function () { window.print(); });
    App.$("[data-csv]", root).addEventListener("click", function () {
      var rows = [["perfil", "nivel", "leccion", "estrellas"]];
      ps.forEach(function (p) { C.LEVELS.forEach(function (l) { l.lessons.forEach(function (ls) { rows.push([p.name, l.title, ls.challenge ? "Desafío" : ls.title, p.stars[l.id + "/" + ls.id] || 0]); }); }); });
      rows.push([]); rows.push(["perfil", "seña", "vista", "escrita_bien", "escrita_mal", "camara", "caja_repaso"]);
      ps.forEach(function (p) { Object.keys(p.items).forEach(function (id) { var r = p.items[id], it = C.ITEMS[id]; if (it) rows.push([p.name, it.label, r.seen, r.wOk, r.wFail, r.ai, r.box]); }); });
      App.download("conectalsa-progreso-" + App.today() + ".csv", App.toCSV(rows), "text/csv;charset=utf-8");
    });
  };
  function levelProgressFor(p, l) {
    var got = 0; l.lessons.forEach(function (ls) { got += p.stars[l.id + "/" + ls.id] || 0; });
    return got / (l.lessons.length * 3);
  }

  /* =======================================================
     AJUSTES (todos funcionan y se aplican al instante)
     ======================================================= */
  V.ajustes = function (root) {
    var S = App.state(), st = S.settings, p = App.P();
    function sw(key, t, d) { return '<div class="switch-row"><div class="t"><strong>' + t + '</strong><small>' + d + '</small></div><input class="switch" type="checkbox" data-sw="' + key + '" aria-label="' + t + '"></div>'; }
    function sg(key, t, opts) { return '<div class="switch-row"><div class="t"><strong>' + t + '</strong></div><div class="seg" role="group" aria-label="' + t + '">' + opts.map(function (o) { return '<button type="button" data-seg="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (String(st[key]) === String(o[0])) + '">' + o[1] + '</button>'; }).join("") + '</div></div>'; }
    root.innerHTML = '<a class="link" href="#/perfil">← Perfil</a><h1 style="margin-top:10px">Ajustes</h1>' +
      '<div class="card"><span class="eyebrow">Perfil</span><label class="field"><span>Nombre</span><input type="text" data-name maxlength="20" value="' + esc(p.name) + '"></label>' +
        '<div class="switch-row"><div class="t"><strong>Mano dominante</strong><small>La cámara reconoce ambas manos.</small></div>' + seg("hand", [["right", "Derecha"], ["left", "Izquierda"]], p.hand) + '</div>' +
        '<div class="switch-row"><div class="t"><strong>Meta diaria</strong></div>' + seg("goal", [[20, "5 min"], [30, "10 min"], [50, "15 min"]], p.goal) + '</div></div>' +
      '<div class="card"><span class="eyebrow">Videos</span>' + sw("mirrorVideos", "Videos en espejo", "Como si te miraras en un espejo. Recomendado para zurdos/as.") +
        sg("videoSpeed", "Velocidad inicial", [[1, "Normal"], [0.5, "Lenta"], [0.3, "Muy lenta"]]) + '</div>' +
      '<div class="card"><span class="eyebrow">Cámara</span>' + sw("camera", "Practicar con la cámara", "Si la apagás, practicás con autoevaluación. Nunca se graba nada.") +
        '<a class="btn ghost" href="#/camara"><span class="ico">' + App.ico("camara") + '</span> Probar cómo me ve la cámara</a></div>' +
      '<div class="card"><span class="eyebrow">Perfil visual</span><p class="small muted" style="margin-top:0">Elegí los colores que te resulten más cómodos. Se aplica al instante y no cambia tu progreso.</p>' +
        '<div class="vision-grid" role="radiogroup" aria-label="Perfil visual">' + App.VISIONES.map(function (v) {
          return '<button class="vision-tile" type="button" role="radio" aria-checked="' + (App.visionActual() === v.id) + '" data-vision="' + v.id + '">' +
            '<span class="vision-preview" aria-hidden="true">' + v.col.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + '</span>' +
            '<strong>' + App.ico(v.ico) + ' ' + esc(v.name) + '</strong><small>' + esc(v.desc) + '</small></button>';
        }).join("") + '</div>' +
        '<div class="switch-row" style="margin-top:14px"><div class="t"><strong>Tamaño de letra</strong><small>Tres tamaños: crece todo el texto junto.</small></div>' + '<div class="seg" role="group" aria-label="Tamaño de letra">' + [[100, "A"], [115, "A+"], [130, "A++"]].map(function (o) { return '<button type="button" data-seg="fs" data-v="' + o[0] + '" aria-pressed="' + (String(st.fs) === String(o[0])) + '">' + o[1] + '</button>'; }).join("") + '</div>' + '</div>' +
        sw("reduceMotion", "Reducir animaciones", "Menos movimiento en pantalla.") + '</div>' +
      '<div class="card"><span class="eyebrow">Avisos</span>' + sw("sound", "Sonidos", "Opcionales: toda la información también es visual.") + sw("vibration", "Vibración", "En celulares compatibles.") + '</div>' +
      '<div class="card"><span class="eyebrow">Acceso a este perfil</span>' +
        '<div class="switch-row"><div class="t"><strong>Pedir números secretos al entrar</strong><small>' + (App.hasPin(p) ? "Activado: te pide tus 4 números secretos al elegir este perfil." : "Sin números secretos: cualquiera que use este equipo puede entrar a tu perfil.") + '</small></div>' +
          '<button class="btn ghost small" type="button" data-pin>' + App.ico("llave-pin") + ' ' + (App.hasPin(p) ? "Cambiar o quitar" : "Poner números") + '</button></div>' +
        '<div data-pin-box hidden style="margin-top:10px"></div>' +
        '<p class="small muted">Los números se guardan revueltos con una cuenta matemática (hash): ni vos ni nadie puede leerlos. No viajan a internet: ConectaLSA no tiene cuentas ni servidores con datos.</p>' +
        '<div class="row"><button class="btn ghost" type="button" data-logout>' + App.ico("salir") + ' Cerrar sesión</button></div></div>' +
      '<div class="card"><span class="eyebrow">Datos</span><p class="small muted">Todo queda en este dispositivo. No hay cuentas en internet, ni publicidad, ni analíticas.</p><div class="row"><button class="btn ghost" type="button" data-exp>' + App.ico("descarga") + ' Copia de seguridad</button><button class="btn bad" type="button" data-reset>Reiniciar mi progreso</button><button class="btn bad" type="button" data-del>Eliminar este perfil</button></div></div>';
    st.reduceMotion = st.motion === "reduce";

    /* --- Perfil visual: se aplica al toque --- */
    App.$$("[data-vision]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        App.setVision(b.dataset.vision);
        App.$$("[data-vision]", root).forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
        App.toast("Perfil visual: " + App.visionActual());
      });
    });

    /* --- PIN local --- */
    function panelPin() {
      var box = App.$("[data-pin-box]", root), conPin = App.hasPin(p);
      if (!box.hidden) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = '<div class="card" style="background:var(--surface-2);box-shadow:none">' +
        '<p style="margin-top:0"><strong>' + (conPin ? "Cambiar mis números secretos" : "Elegir 4 números secretos") + '</strong></p>' +
        '<label class="field"><span>Los 4 números</span><input type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" data-pin1 aria-describedby="pinayuda"></label>' +
        '<label class="field"><span>Repetilo</span><input type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" data-pin2></label>' +
        '<p class="small muted" id="pinayuda">Sirve para que otra persona de esta compu no entre a tu perfil. No es una cuenta y no se puede recuperar: si te olvidás, hay que empezar de nuevo con el perfil.</p>' +
        '<p class="pin-msg small" data-pinmsg role="status" aria-live="polite"></p>' +
        '<div class="row"><button class="btn" type="button" data-pinsave>Guardar</button>' +
        (conPin ? '<button class="btn bad" type="button" data-pindel>Sacar los números</button>' : "") +
        '<button class="btn ghost" type="button" data-pincancel>Cancelar</button></div></div>';
      var i1 = App.$("[data-pin1]", box), i2 = App.$("[data-pin2]", box), m = App.$("[data-pinmsg]", box);
      i1.focus({ preventScroll: true });
      App.$("[data-pinsave]", box).addEventListener("click", function () {
        var a = i1.value.replace(/\D/g, ""), b = i2.value.replace(/\D/g, "");
        if (a.length !== 4) { m.textContent = "Tienen que ser 4 números."; m.className = "pin-msg bad small"; return; }
        if (a !== b) { m.textContent = "Los dos números no coinciden."; m.className = "pin-msg bad small"; return; }
        App.setPin(a); App.toast("Números secretos guardados"); V.ajustes(root);
      });
      if (conPin) App.$("[data-pindel]", box).addEventListener("click", function () { App.clearPin(); App.toast("Números secretos sacados"); V.ajustes(root); });
      App.$("[data-pincancel]", box).addEventListener("click", function () { box.hidden = true; });
    }
    App.$("[data-pin]", root).addEventListener("click", panelPin);
    App.$("[data-logout]", root).addEventListener("click", function () { App.cerrarSesion(); });
    App.$$("[data-sw]", root).forEach(function (el) {
      el.checked = !!st[el.dataset.sw];
      el.addEventListener("change", function () {
        var k = el.dataset.sw; st[k] = el.checked;
        if (k === "highContrast") st.contrast = el.checked ? "high" : "normal";
        if (k === "reduceMotion") st.motion = el.checked ? "reduce" : "auto";
        App.applySettings(); App.save(); App.toast("Guardado");
        if (k === "sound" && el.checked) App.fx("ok"); if (k === "vibration" && el.checked) App.fx("tick");
      });
    });
    App.$$("[data-seg]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.seg, v = b.dataset.v; st[k] = k === "videoSpeed" ? +v : v;
        App.$$('[data-seg="' + k + '"]', root).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        App.applySettings(); App.save();
      });
    });
    bindSeg(root, "hand", function (v) { p.hand = v; if (v === "left") { st.mirrorVideos = true; App.$('[data-sw="mirrorVideos"]', root).checked = true; } App.save(); App.toast("Guardado"); });
    bindSeg(root, "goal", function (v) { p.goal = +v; App.save(); App.toast("Guardado"); });
    App.$("[data-name]", root).addEventListener("change", function () { var v = this.value.trim(); if (v) { p.name = v; App.save(); App.toast("Guardado"); } });
    App.$("[data-exp]", root).addEventListener("click", function () { App.exportProfile(); });
    confirmBtn(App.$("[data-reset]", root), function () { App.resetProfile(p.id); App.toast("Progreso reiniciado"); App.go("#/niveles"); });
    confirmBtn(App.$("[data-del]", root), function () { App.deleteProfile(p.id); App.toast("Perfil eliminado"); App.go(App.P() ? "#/perfiles" : "#/bienvenida"); });
  };
  function confirmBtn(btn, fn) {
    var armed = false, txt = btn.textContent;
    btn.addEventListener("click", function () {
      if (!armed) { armed = true; btn.textContent = "Tocá de nuevo para confirmar"; setTimeout(function () { armed = false; btn.textContent = txt; }, 4000); return; }
      fn();
    });
  }
  App.confirmBtn = confirmBtn;

  /* =======================================================
     ACERCA DE
     ======================================================= */
  V.acerca = function (root) {
    var n = App.Media.count(), nv = App.Media.validatedCount(), labels = App.Vision.Model.labels(), ai = Object.keys(labels).filter(function (k) { return labels[k] >= 5; }).length;
    root.innerHTML = '<a class="link" href="#/perfil">← Perfil</a><h1 style="margin-top:10px">Acerca de ConectaLSA</h1>' +
      '<div class="card"><p><strong>ConectaLSA</strong> es una app para aprender Lengua de Señas Argentina (LSA) con lecciones cortas, práctica con la cámara y repaso inteligente.</p>' +
      '<p>Desarrollada por la Dirección de Innovación de la Municipalidad de San Salvador de Jujuy (Punto Digital Jorge Cafrune). Código y contenidos propios.</p></div>' +
      '<div class="card"><span class="eyebrow">Estado del contenido en este equipo</span><ul>' +
        '<li>' + App.allItems().length + ' señas en ' + C.LEVELS.length + ' niveles</li>' +
        '<li><span class="ico">' + App.ico("camara") + '</span> ' + n + ' videos cargados · ' + nv + ' validados por un segundo referente</li>' +
        '<li><span class="ico">' + App.ico("mano") + '</span> La cámara reconoce ' + ai + ' señas (forma de la mano)</li></ul></div>' +
      '<div class="card"><span class="eyebrow">Compromisos</span><ul>' +
        '<li><strong>Las señas las enseñan personas sordas.</strong> Cada video muestra quién la seña y quién la validó (Ley 27.710).</li>' +
        '<li><strong>La cámara nunca graba.</strong> Analiza cada imagen en el equipo y la descarta. No se envía nada a internet.</li>' +
        '<li><strong>Sin cuentas en internet, sin publicidad y sin analíticas.</strong> Cada persona entra con su perfil en este equipo y, si quiere, con un PIN. El progreso es tuyo: podés descargarlo y borrarlo.</li>' +
        '<li><strong>Si la cámara no te reconoce, no es tu culpa.</strong> Siempre podés autoevaluarte y seguir.</li>' +
        '<li><strong>Funciona sin internet</strong> una vez abierta (instalable como app).</li>' +
        '<li>Accesible: textos grandes, alto contraste, sin depender del sonido, navegable con teclado.</li></ul></div>' +
      '<div class="card"><span class="eyebrow">Privacidad</span><p>Esta app no pide correo ni contraseña: el acceso es local y sin registro. No tiene publicidad, ' +
      'no mide el uso y la cámara nunca graba. El progreso queda en este dispositivo.</p><p style="margin:0"><a class="btn alt" href="#/privacidad"><span class="ico">' +
      App.ico("candado") + '</span> Leer la política de privacidad completa</a></p></div>' +
      '<p class="small muted">La IA reconoce la configuración de la mano; el movimiento, el lugar y la expresión facial los evalúa una persona. Versión ' + (App.VERSION || "1.1") + '.</p>';
  };

  /* =======================================================
     POLÍTICA DE PRIVACIDAD
     ======================================================= */
  V.privacidad = function (root) {
    var P = App.PRIVACIDAD;
    if (!P) { root.innerHTML = '<p>No disponible.</p>'; return; }
    var html = '<a class="link" href="#/acerca">← Acerca de</a>' +
      '<h1 style="margin-top:10px">Política de privacidad</h1>' +
      '<p class="muted small">Versión ' + P.version + ' · ' + P.fecha + '</p>' +
      '<div class="card"><p><strong>En una frase:</strong> ConectaLSA no pide correo ni contraseña, no tiene publicidad, no mide el uso y la cámara ' +
      'nunca graba. Todo lo que guarda queda en este dispositivo.</p>' +
      '<p class="small muted" style="margin:0">Responsable: ' + P.responsable + '</p></div>';

    P.secciones.forEach(function (sec, i) {
      html += '<div class="card"><h3>' + (i + 1) + '. ' + sec.t + '</h3>';
      if (sec.p) sec.p.forEach(function (t) { html += '<p>' + t + '</p>'; });
      if (sec.l) html += '<ul>' + sec.l.map(function (t) { return '<li>' + t + '</li>'; }).join("") + '</ul>';
      if (sec.lista2) html += '<ul>' + sec.lista2.map(function (t) { return '<li>' + t + '</li>'; }).join("") + '</ul>';
      if (sec.tabla) {
        html += '<div class="table-wrap" tabindex="0" role="region" aria-label="' + sec.t + '"><table class="matrix" style="width:100%"><thead><tr>' +
          sec.tabla.cab.map(function (c) { return '<th>' + c + '</th>'; }).join("") + '</tr></thead><tbody>' +
          sec.tabla.filas.map(function (f) {
            return '<tr>' + f.map(function (c) { return '<td style="text-align:left">' + c + '</td>'; }).join("") + '</tr>';
          }).join("") + '</tbody></table></div>';
      }
      html += '</div>';
    });

    html += '<div class="card"><h3>Contacto</h3><p>Para consultas, pedidos o reclamos sobre datos personales: ' +
      '<strong>' + P.contacto + '</strong></p>' +
      '<p class="small muted" style="margin:0">Este texto es el mismo que la app publica en internet y que se entrega impreso ' +
      'a las personas que graban sus señas.</p></div>';
    root.innerHTML = html;
  };
})(window.App);
