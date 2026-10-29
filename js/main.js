/* =========================================================
   ConectaLSA · Arranque y navegación
   ========================================================= */
(function (App) {
  "use strict";
  var V = App.views, esc = App.esc;

  /* ---------- Hub «Practicar» ---------- */
  V.practica = function (root) {
    var due = App.dueItems().length;
    root.innerHTML = '<span class="eyebrow">Practicar</span><h1>¿Qué querés practicar?</h1><div class="hub">' +
      card("#/repaso", "repaso", "Repaso inteligente", due ? due + " señas para repasar hoy" : "Al día: no hay señas pendientes", due ? "coral" : "") +
      card("#/deletreo", "dado", "Deletreá", "Tu nombre o palabras con el alfabeto manual") +
      card("#/diccionario", "buscar", "Elegí una seña", "Buscá en el diccionario y practicala con la cámara") +
      card("#/camara", "camara", "¿Cómo te ve la cámara?", "Probá la luz y el encuadre antes de practicar") +
      card("#/consejos", "bombilla", "Consejos", "Las partes de una seña, el espacio, la cara…") +
      '</div>';
    function card(h, ico, t, d, cls) { return '<a class="hub-card ' + (cls || "") + '" href="' + h + '"><span class="hub-ico">' + App.ico(ico) + '</span><strong>' + t + '</strong><small>' + esc(d) + '</small></a>'; }
  };

  var NAV = [
    ["#/niveles", "niveles", "Niveles", ["niveles", "nivel", "consejos"]],
    ["#/diccionario", "libro", "Diccionario", ["diccionario", "sena"]],
    ["#/practica", "mano", "Practicar", ["practica", "repaso", "deletreo", "camara", "practicar"]],
    ["#/perfil", "persona", "Perfil", ["perfil", "perfiles", "progreso", "ajustes", "acerca", "referente", "grabar", "entrenar"]]
  ];
  var ROUTES = {
    niveles: V.niveles, nivel: V.nivel, leccion: V.leccion, repaso: V.repaso, practicar: V.practicar, practica: V.practica,
    diccionario: V.diccionario, sena: V.sena, consejos: V.consejos,
    camara: V.camara, entrenar: V.entrenar, deletreo: V.deletreo,
    entrar: V.entrar, bienvenida: V.bienvenida, "perfil-importar": V["perfil-importar"], perfiles: V.perfiles, perfil: V.perfil, progreso: V.progreso, ajustes: V.ajustes, acerca: V.acerca, privacidad: V.privacidad,
    referente: V.referente, grabar: V.grabar
  };
  var TITLES = { niveles: "Niveles", nivel: "Nivel", leccion: "Lección", repaso: "Repaso", practicar: "Practicar", practica: "Practicar", diccionario: "Diccionario", sena: "Seña", consejos: "Consejos",
    camara: "Prueba de cámara", entrenar: "Entrenar la cámara", deletreo: "Deletreá", entrar: "Entrar", bienvenida: "Bienvenida", "perfil-importar": "Recuperar progreso", perfiles: "Perfiles", perfil: "Mi perfil",
    progreso: "Panel de progreso", ajustes: "Ajustes", acerca: "Acerca de", privacidad: "Política de privacidad", referente: "Modo referente", grabar: "Grabar seña" };
  var FOCUS = { leccion: 1, repaso: 1, practicar: 1, bienvenida: 1, "perfil-importar": 1 };
  var NOPROFILE = { entrar: 1, bienvenida: 1, "perfil-importar": 1, acerca: 1, privacidad: 1 };
  var LIBRES = { entrar: 1, bienvenida: 1, "perfil-importar": 1, acerca: 1, privacidad: 1 };

  var cleanup = null;
  App.go = function (hash, replace) {
    if (replace) { history.replaceState(null, "", hash); render(); }
    else if (location.hash === hash) render();
    else location.hash = hash;
  };
  App.route = function () { render(); };

  function buildNav() {
    document.getElementById("mainnav").innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '"><span class="ico" aria-hidden="true">' + App.ico(n[1]) + '</span><span>' + n[2] + '</span></a>'; }).join("");
  }
  function markNav(name) {
    App.$$("#mainnav a").forEach(function (a, i) { if (NAV[i][3].indexOf(name) >= 0) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  function topstats() {
    var p = App.P(), el = document.getElementById("topstats");
    if (!p) { el.innerHTML = ""; return; }
    el.innerHTML = '<span class="pill" title="Racha de días"><span class="ico">' + App.ico("fuego") + '</span> ' + App.streak() + '</span>' +
      '<span class="pill" title="Estrellas"><span class="ico">' + App.ico("estrella-llena") + '</span> ' + App.totalStars() + '</span>' +
      '<a class="pill ava-pill" href="#/perfiles" title="Cambiar de perfil" aria-label="Perfil de ' + esc(p.name) + ', cambiar">' + App.avatar(p.avatar).ico + '</a>';
  }

  function render() {
    var hash = location.hash || "#/niveles";
    var parts = hash.replace(/^#\/?/, "").split("#")[0].split("/");
    var name = parts[0] || "niveles", view = ROUTES[name];
    if (!view) { name = "niveles"; view = ROUTES.niveles; parts = ["niveles"]; }
    if (!App.P() && !NOPROFILE[name]) { history.replaceState(null, "", "#/bienvenida"); name = "bienvenida"; view = ROUTES.bienvenida; parts = ["bienvenida"]; }
    // Si se cerró sesión, todo pasa por la pantalla de acceso (salvo privacidad y ayuda).
    if (App.isLocked && App.isLocked() && !LIBRES[name]) { history.replaceState(null, "", "#/entrar"); name = "entrar"; view = ROUTES.entrar; parts = ["entrar"]; }
    if (typeof cleanup === "function") { try { cleanup(); } catch (e) {} }
    cleanup = null;
    var main = document.getElementById("main");
    main.innerHTML = "";
    document.body.classList.toggle("focus-mode", !!FOCUS[name]);
    document.body.classList.toggle("sin-nav", !!(App.isLocked && App.isLocked()));
    try { cleanup = view(main, parts.slice(1)); }
    catch (e) { console.error(e); main.innerHTML = '<div class="note bad"><p>Ocurrió un error al abrir esta sección. Tu progreso está guardado. <a href="#/niveles">Volver a los niveles</a></p></div>'; }
    markNav(name); topstats();
    document.title = (TITLES[name] || "ConectaLSA") + " · ConectaLSA";
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  /* ---------- Arranque ---------- */
  App.applySettings();
  if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").addEventListener) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", App.applySettings);
  buildNav();
  App.onChange(topstats);
  window.addEventListener("hashchange", render);
  window.addEventListener("pagehide", function () { if (typeof cleanup === "function") cleanup(); });
  // Errores inesperados: avisamos sin perder nada (el progreso se guarda en cada acción).
  window.addEventListener("error", function (e) { if (e && e.message && !/ResizeObserver/.test(e.message)) App.toast("Algo falló, pero tu progreso está guardado."); });
  App.Media.init().then(render, render);

  /* ---------- Funcionamiento sin conexión (PWA) ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function (e) { console.warn("Service worker:", e); }); });
  }
})(window.App);
