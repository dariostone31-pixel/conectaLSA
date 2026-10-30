/* =========================================================
   ConectaLSA · Acceso
   Pantalla de entrada: elegir perfil y, si tiene PIN, escribirlo.
   NO es una cuenta: todo pasa en este dispositivo. El PIN se guarda
   como un resumen (hash) y no se envía a ningún lado.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var esc = App.esc;

  /* Después de entrar, la app vuelve a la pantalla que la persona había pedido
     (por ejemplo, un enlace a un consejo); si no había ninguna, va al inicio. */
  function irAdentro(porDefecto) {
    var d = App.destino || porDefecto || "#/niveles";
    App.destino = null;
    App.go(d);
  }

  function logoMarca() {
    return '<span class="brand-mark" aria-hidden="true"><img src="icons/logo-blanco.svg" alt="" width="38" height="38"></span>';
  }

  /* ---------------------------------------------------------
     Elegir perfil
     --------------------------------------------------------- */
  V.entrar = function (root, args) {
    var perfiles = App.profiles();
    if (!perfiles.length) { App.go("#/bienvenida", true); return; }

    var preseleccion = args && args[0] ? decodeURIComponent(args[0]) : "";

    // Si hay un solo perfil y tiene PIN, se pide directamente: menos toques para entrar.
    if (!preseleccion && perfiles.length === 1 && App.hasPin(perfiles[0])) {
      pedirPin(root, perfiles[0]);
      return;
    }

    root.innerHTML =
      '<section class="acceso">' +
        '<div class="acceso-hero">' + logoMarca() +
          '<h1>Hola, ¿quién sos?</h1>' +
          '<p class="muted">Tocá tu nombre y empezamos. Cada uno guarda sus estrellas y elige sus colores.</p>' +
        '</div>' +
        (App.motivoAcceso === "cierre" ? '<div class="note"><p><strong>¡Hasta la próxima!</strong> Tus estrellas quedaron guardadas acá. ' +
          'Tocá tu nombre cuando quieras volver.</p></div>' : "") +
        '<div class="who-grid pin" data-g role="list"></div>' +
        '<p class="center" style="margin-top:18px"><a class="btn ghost" href="#/bienvenida"><span class="ico">' +
          App.ico("usuario-mas") + '</span> Soy nuevo: crear mi perfil</a></p>' +
        '<p class="small muted center">Todo queda en este dispositivo, no se manda a internet. ' +
          'Si alguien puso sus números secretos, solo entra quien los sabe. <a href="#/privacidad">Política de privacidad</a></p>' +
      '</section>';

    var g = App.$("[data-g]", root);
    perfiles.forEach(function (p) {
      var conPin = App.hasPin(p);
      var b = App.el('<button class="who' + (conPin ? " lock" : "") + '" type="button" role="listitem">' +
        '<span class="ava big">' + App.avatar(p.avatar).ico + '</span>' +
        '<strong>' + esc(p.name) + '</strong>' +
        '<small>' + (conPin ? '<span class="ico">' + App.ico("candado") + '</span> Números secretos' : "Soy yo") + '</small></button>');
      b.addEventListener("click", function () { elegir(p); });
      g.appendChild(b);
    });

    function elegir(p) {
      if (App.hasPin(p)) { pedirPin(root, p); return; }
      App.unlock(p.id);
      App.toast("¡Hola, " + p.name + "!");
      irAdentro("#/niveles");
    }

    if (preseleccion) {
      var p0 = App.profileById(preseleccion);
      if (p0 && App.hasPin(p0)) pedirPin(root, p0);
    }
  };

  /* ---------------------------------------------------------
     Pedir el PIN
     --------------------------------------------------------- */
  function pedirPin(root, perfil) {
    var pin = "", intentos = 0, bloqueadoHasta = 0, timer = null;

    root.innerHTML =
      '<section class="acceso"><div class="card pin-card">' +
        '<span class="pin-ava" aria-hidden="true">' + App.avatar(perfil.avatar).ico + '</span>' +
        '<h1>Hola, ' + esc(perfil.name) + '</h1>' +
        '<p class="muted" style="margin:0">Poné tus 4 números secretos</p>' +
        '<div class="pin-dots" data-dots aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<p class="pin-msg" data-msg role="status" aria-live="polite"></p>' +
        '<div class="pin-pad" data-pad>' +
          ["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(function (n) {
            return '<button type="button" data-k="' + n + '" aria-label="' + n + '">' + n + "</button>";
          }).join("") +
          '<button type="button" data-k="borrar" aria-label="Borrar el último número">' + App.ico("borrar") + '</button>' +
          '<button type="button" data-k="0" aria-label="0">0</button>' +
          '<button type="button" data-k="ok" aria-label="Entrar">Entrar</button>' +
        "</div>" +
        '<p class="small muted" style="margin-top:14px">También podés usar el teclado de la compu.</p>' +
        '<p style="margin:10px 0 0"><button class="link small" type="button" data-olvido>Me olvidé los números</button></p>' +
        (App.profiles().length > 1 ? '<p style="margin:6px 0 0"><a class="link small" href="#/perfiles">Elegir otro perfil</a></p>' : "") +
      "</div></section>";

    var dots = App.$$("[data-dots] i", root), msg = App.$("[data-msg]", root), card = App.$(".pin-card", root);

    function pintar() {
      dots.forEach(function (d, i) { d.classList.toggle("on", i < pin.length); });
    }
    function decir(t, tipo) { msg.textContent = t || ""; msg.className = "pin-msg" + (tipo ? " " + tipo : ""); }

    function entrar() {
      if (Date.now() < bloqueadoHasta) return;
      if (pin.length < 4) { decir("Faltan números", "bad"); return; }
      if (App.checkPin(pin, perfil.id)) {
        decir("¡Adelante!", "good");
        App.unlock(perfil.id);
        setTimeout(function () { App.toast("¡Hola, " + perfil.name + "!"); irAdentro("#/niveles"); }, 220);
        return;
      }
      intentos++;
      pin = ""; pintar();
      card.classList.remove("pin-shake");
      void card.offsetWidth;                    // reinicia la animación
      card.classList.add("pin-shake");
      if (intentos >= 5) {
        bloqueadoHasta = Date.now() + 30000;
        decir("Uy, muchos intentos. Esperá 30 segundos.", "bad");
        var fin = Date.now() + 30000;
        clearInterval(timer);
        timer = setInterval(function () {
          var seg = Math.ceil((fin - Date.now()) / 1000);
          if (seg <= 0) { clearInterval(timer); decir(""); bloqueadoHasta = 0; }
          else decir("Esperá " + seg + " segundos", "bad");
        }, 500);
      } else {
        decir("Mmm, esos no son. Probá otra vez (intento " + intentos + " de 5).", "bad");
      }
    }

    function tecla(k) {
      if (Date.now() < bloqueadoHasta) return;
      if (k === "borrar") { pin = pin.slice(0, -1); pintar(); decir(""); return; }
      if (k === "ok") { entrar(); return; }
      if (pin.length >= 4) return;
      pin += k; pintar(); decir("");
      if (pin.length === 4) setTimeout(entrar, 180);
    }

    App.$$("[data-k]", root).forEach(function (b) {
      b.addEventListener("click", function () { tecla(b.dataset.k); });
    });

    function alTeclear(e) {
      if (e.key >= "0" && e.key <= "9") { tecla(e.key); e.preventDefault(); }
      else if (e.key === "Backspace") { tecla("borrar"); }
      else if (e.key === "Enter") { tecla("ok"); }
    }
    document.addEventListener("keydown", alTeclear);

    App.$("[data-olvido]", root).addEventListener("click", function () {
      root.querySelector(".pin-card").innerHTML =
        '<h1>Me olvidé los números</h1>' +
        '<p class="muted">Los números se guardan solo acá y nadie más los tiene: no hay ningún lugar de internet donde estén. ' +
        'Tenés dos caminos:</p>' +
        '<p><strong>1.</strong> Que otra persona que use este mismo equipo entre a su perfil, vaya a Ajustes y saque los números.</p>' +
        '<p><strong>2.</strong> Empezar de cero con este perfil, borrándolo. Se pierden las estrellas y el progreso.</p>' +
        '<div class="row" style="justify-content:center">' +
          '<a class="btn ghost" href="#/entrar">Volver</a>' +
          '<button class="btn bad" type="button" data-borrar>Borrar este perfil</button>' +
        "</div>";
      var b = App.$("[data-borrar]", root), armado = false;
      b.addEventListener("click", function () {
        if (!armado) {
          armado = true; b.textContent = "Tocá de nuevo para confirmar";
          setTimeout(function () { armado = false; b.textContent = "Borrar este perfil"; }, 4000);
          return;
        }
        App.deleteProfile(perfil.id);
        App.toast("Perfil eliminado");
        App.go(App.profiles().length ? "#/entrar" : "#/bienvenida");
      });
    });

    // Foco en el primer número para que el teclado del celular no estorbe.
    var primero = App.$('[data-k="1"]', root); if (primero) primero.focus({ preventScroll: true });

    return function () { document.removeEventListener("keydown", alTeclear); clearInterval(timer); };
  }

  /* ---------------------------------------------------------
     Cerrar sesión (se usa desde Mi perfil y Ajustes)
     --------------------------------------------------------- */
  App.cerrarSesion = function () {
    var p = App.P();
    App.motivoAcceso = "cierre";
    App.destino = null;
    App.lock();
    App.toast(p ? "Hasta pronto, " + p.name : "Sesión cerrada");
    App.go("#/entrar");
  };
})(window.App);
