/* =========================================================
   ConectaLSA · Presentación (#/presentacion)
   Landing pública dentro de la app: muestra qué es, cómo se usa,
   qué la hace confiable y lleva a empezar.
   - Funciona sin perfil (está en NOPROFILE de main.js).
   - Las imágenes son capturas reales de la app y fotogramas de los
     videos que grabaron las personas sordas: no hay nada inventado.
   - Ninguna seña ni descripción de la cara se inventa acá.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var V = App.views = App.views || {};
  var C = App.CONTENT, esc = App.esc;

  /* Los números se calculan solos: si mañana hay más señas con video, la
     portada se actualiza sin tocar nada. */
  function cuenta() {
    var total = Object.keys(C.ITEMS).length;
    var conVideo = 0, validados = 0;
    try {
      var st = App.Media && App.Media.status ? App.Media.status() : null;
      if (st) { conVideo = st.videos; validados = st.validated; }
    } catch (e) {}
    var niveles = C.LEVELS.length;
    var pasos = 0;
    C.LEVELS.forEach(function (lv) { pasos += (lv.lessons || []).length; });
    return { total: total, videos: conVideo || total, validados: validados, niveles: niveles, pasos: pasos };
  }

  function empezar() {
    App.go(App.profiles && App.profiles().length ? "#/entrar" : "#/bienvenida");
  }

  /* =========================================================
     Animaciones de la presentación (capa aparte, 1.6.0)
     - Solo agrega clases: .lp-anim en el contenedor y .lp-rev / .lp-in
       en los elementos que ya existen. No cambia HTML, textos ni eventos.
     - Si el navegador no tiene IntersectionObserver, si la persona pidió
       «reducir movimiento» (en el sistema o en Ajustes) o si algo falla,
       no se agrega .lp-anim y la página se ve exactamente como antes.
     - Devuelve una función para cortar todo al salir de la pantalla.
     ========================================================= */
  function animarPresentacion(root) {
    var sinNada = function () {};
    var l = root && root.querySelector ? root.querySelector(".landing") : null;
    if (!l) return sinNada;
    if (!("IntersectionObserver" in window)) return sinNada;
    var quieto = false;
    try {
      if (document.documentElement.getAttribute("data-motion") === "reduce") quieto = true;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) quieto = true;
    } catch (e) {}
    if (quieto) return sinNada;

    /* Qué aparece y con qué retardo, en grupos. El escalonado se corta a 480 ms
       para que ninguna tarjeta tarde en entrar. */
    var PLAN = [
      [".lp-cinta .lp-dato", 60],
      [".lp-sec > .lp-wrap > .lp-eyebrow", 70],
      [".lp-sec > .lp-wrap > h2", 70],
      [".lp-sec > .lp-wrap > .lp-lead", 70],
      [".lp-pasos > .lp-paso", 110],
      [".lp-funciones > .lp-funcion", 80],
      [".lp-tarjetas > .lp-tarjeta", 110],
      [".lp-cita blockquote", 0],
      [".lp-cita cite", 110],
      [".lp-faq > details", 55],
      [".lp-cierre", 0],
      [".lp-pie-grid > div", 80],
      [".lp-pie .lp-firma", 40]
    ];
    var vistos = [], animables = [];
    PLAN.forEach(function (par) {
      var lista = Array.prototype.slice.call(l.querySelectorAll(par[0]));
      lista.forEach(function (el, i) {
        if (vistos.indexOf(el) >= 0) return;
        vistos.push(el); animables.push(el);
        el.classList.add("lp-rev");
        el.style.transitionDelay = Math.min(i * par[1], 480) + "ms";
      });
    });
    if (!animables.length) return sinNada;

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        revelar(e.target);
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.02 });

    function revelar(el) {
      if (!el || el.classList.contains("lp-in")) return;
      el.classList.add("lp-in");
      io.unobserve(el);
    }

    /* Red de seguridad: si alguna figura queda justo sobre el borde inferior
       (o el navegador no dispara el observador), una pasada al desplazar la
       muestra igual. Nunca queda contenido invisible. */
    var pendiente = false;
    function pasar() {
      pendiente = false;
      var alto = window.innerHeight || 0;
      animables.forEach(function (el) {
        if (el.classList.contains("lp-in")) return;
        var r = el.getBoundingClientRect();
        if (r.top <= alto - 4 && r.bottom >= 0) revelar(el);
      });
    }
    function alDesplazar() {
      if (pendiente) return;
      pendiente = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(pasar);
      else setTimeout(pasar, 60);
    }

    /* La clase se agrega recién ahora, con los elementos ya listos: así no hay
       ningún parpadeo ni queda nada oculto si algo no llega a correr. */
    l.classList.add("lp-anim");
    animables.forEach(function (el) { io.observe(el); });
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });

    var vivo = true;
    return function () {
      if (!vivo) return;
      vivo = false;
      io.disconnect();
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
      animables.forEach(function (el) { el.style.transitionDelay = ""; });
    };
  }

  V.presentacion = function (root) {
    var n = cuenta();
    var hayPerfil = !!(App.profiles && App.profiles().length);
    document.body.classList.add("landing-mode");

    root.innerHTML =
    '<div class="landing">' +

      /* ---------------- BARRA ---------------- */
      '<header class="lp-header"><div class="lp-wrap">' +
        '<a class="lp-marca" href="#/bienvenida" aria-label="ConectaLSA, ir al inicio">' +
          '<img src="icons/logo-blanco.svg" alt="" width="28" height="28">' +
          '<span><b>ConectaLSA</b><small>Lengua de Señas Argentina</small></span>' +
        '</a>' +
        '<button class="lp-btn lp-btn-mini" type="button" data-empezar>Entrar</button>' +
      '</div></header>' +

      /* ---------------- PORTADA ---------------- */
      '<section class="lp-hero">' +
        '<div class="lp-wrap">' +
          '<div>' +
            '<span class="lp-kicker"><span class="dot"></span> Lengua de Señas Argentina · Jujuy</span>' +
            '<h1>Aprender <span class="lp-mark">lengua de señas</span>, con las manos de verdad.</h1>' +
            '<p class="lp-bajada">ConectaLSA es una app gratuita para que chicos y adolescentes aprendan LSA con ' +
              '<b>' + n.videos + ' videos de personas sordas</b>, práctica con la cámara y juegos. Sin cuentas, sin publicidad y sin internet.</p>' +
            '<div class="lp-acciones">' +
              '<button class="lp-btn lp-btn-solido lp-btn-grande" type="button" data-empezar>Entrar <span class="lp-flecha" aria-hidden="true">→</span></button>' +
              '<button class="lp-btn lp-btn-vidrio" type="button" data-ir="lp-como">Cómo funciona</button>' +
            '</div>' +
            '<div class="lp-micro">' +
              '<span><span class="tick">✓</span> ' + n.niveles + ' niveles · ' + n.total + ' señas</span>' +
              '<span><span class="tick">✓</span> Funciona sin internet</span>' +
              '<span><span class="tick">✓</span> Sin registro ni publicidad</span>' +
            '</div>' +
          '</div>' +
          '<div class="lp-phones">' +
            '<div class="lp-phone lp-phone-1"><img src="img/landing-app-niveles.jpg" alt="Pantalla de niveles de ConectaLSA" width="352" height="632" loading="lazy" decoding="async"></div>' +
            '<div class="lp-phone lp-phone-2"><img src="img/landing-app-leccion.jpg" alt="Lección con el video de una seña y los botones Lento, Repetir y Espejo" width="352" height="632" decoding="async"></div>' +
            '<div class="lp-phone lp-phone-3"><img src="img/landing-app-deletreo.jpg" alt="Juego para deletrear el nombre con el alfabeto manual" width="352" height="632" loading="lazy" decoding="async"></div>' +
            '<div class="lp-flota"><span class="lp-flota-ico" aria-hidden="true">' + App.ico("check-simple") + '</span>' +
              '<span><b>' + n.videos + ' videos</b><small>grabados por personas sordas</small></span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* ---------------- CINTA DE DATOS ---------------- */
      '<section class="lp-cinta" aria-label="La app en números"><div class="lp-wrap"><div class="lp-datos">' +
        '<div class="lp-dato"><b>' + n.videos + '</b><span>señas con video</span></div>' +
        '<div class="lp-dato"><b>' + n.niveles + '</b><span>niveles, de vocales a meses</span></div>' +
        '<div class="lp-dato"><b>' + n.pasos + '</b><span>lecciones y desafíos</span></div>' +
        '<div class="lp-dato"><b>&lt; 1 MB</b><span>para empezar a usarla</span></div>' +
      '</div></div></section>' +

      /* ---------------- CÓMO FUNCIONA ---------------- */
      '<section class="lp-sec" id="lp-como"><div class="lp-wrap">' +
        '<span class="lp-eyebrow">Cómo funciona</span>' +
        '<h2>Tres pasos y ya estás señalando</h2>' +
        '<p class="lp-lead">No hay que crear una cuenta ni poner el correo. Se elige un nombre, un dibujito y listo: ' +
          'el progreso queda guardado en ese dispositivo.</p>' +
        '<div class="lp-pasos">' +
          '<article class="lp-paso"><h3>Mirá el video</h3>' +
            '<p>Una persona sorda muestra la seña, de la cabeza a la cintura. Podés verla <b>lenta</b>, <b>repetirla</b> o ponerla <b>en espejo</b>.</p>' +
            '<div class="lp-paso-foto"><img src="img/landing-app-leccion.jpg" alt="Video de la seña con los controles de velocidad" width="352" height="632" loading="lazy" decoding="async"></div>' +
          '</article>' +
          '<article class="lp-paso"><h3>Practicá con la cámara</h3>' +
            '<p>La cámara te muestra como en un espejo y sigue tu mano. <b>No graba y no manda nada</b>: la imagen se procesa en el mismo dispositivo.</p>' +
            '<div class="lp-paso-foto"><img src="img/landing-app-camara.jpg" alt="Pantalla de prueba de cámara con el botón Activar cámara y el estado de la mano" width="352" height="632" loading="lazy" decoding="async"></div>' +
          '</article>' +
          '<article class="lp-paso"><h3>Ganá estrellas</h3>' +
            '<p>Cada lección suma estrellas, racha de días y desafíos. Cuando terminás un nivel, desbloqueás dibujitos nuevos.</p>' +
            '<div class="lp-paso-foto"><img src="img/landing-app-niveles.jpg" alt="Niveles con estrellas y progreso" width="352" height="632" loading="lazy" decoding="async"></div>' +
          '</article>' +
        '</div>' +
      '</div></section>' +

      /* ---------------- FUNCIONES ---------------- */
      '<section class="lp-sec tight" style="background:var(--surface-2)"><div class="lp-wrap">' +
        '<span class="lp-eyebrow">Qué tiene adentro</span>' +
        '<h2>Pensada para el aula y para el recreo</h2>' +
        '<div class="lp-funciones">' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("libro") + '</span><div><h3>Diccionario de ' + n.total + ' señas</h3>' +
            '<p>Vocales, colores, días, meses, la familia, saludos y el abecedario completo. Cada seña con su video y su ejemplo.</p></div></div>' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("letras") + '</span><div><h3>Deletreá tu nombre</h3>' +
            '<p>El alfabeto manual, letra por letra, con palabras para practicar: SOL, LUNA, MATE, CASA, FAMILIA.</p></div></div>' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("repaso") + '</span><div><h3>Repaso inteligente</h3>' +
            '<p>La app se acuerda de lo que te costó y te lo vuelve a mostrar, para no olvidarlo.</p></div></div>' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("cara") + '</span><div><h3>«La cara también habla»</h3>' +
            '<p>En lengua de señas, la cara es parte de la seña. La app explica cómo acompañar con el rostro, en cada práctica.</p></div></div>' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("calma") + '</span><div><h3>Se adapta a cada uno</h3>' +
            '<p>Letra más grande, alto contraste, modo oscuro, colores para daltonismo y una versión con menos movimiento.</p></div></div>' +
          '<div class="lp-funcion"><span class="lp-fi">' + App.ico("escudo") + '</span><div><h3>Privacidad de verdad</h3>' +
            '<p>Sin cuentas, sin publicidad y sin analíticas. No se pide el nombre real y no se sube nada a internet.</p></div></div>' +
        '</div>' +
      '</div></section>' +

      /* ---------------- CONFIANZA ---------------- */
      '<section class="lp-sec lp-confianza"><div class="lp-wrap">' +
        '<span class="lp-eyebrow">Por qué es confiable</span>' +
        '<h2>Las señas las enseñan personas sordas</h2>' +
        '<p class="lp-lead">La Ley 27.710 reconoce a la Lengua de Señas Argentina como una lengua natural y originaria. ' +
          'Por eso acá nada se inventa: las señas las graban personas sordas y las revisan personas sordas. Cuando la revisión la hace ' +
          'la misma persona que grabó, la app lo aclara: <b>«revisión propia»</b>.</p>' +
        '<div class="lp-tarjetas">' +
          '<div class="lp-tarjeta"><h3><span class="lp-tick">✓</span> Grabadas por personas sordas</h3>' +
            '<p>Los ' + n.videos + ' videos los filmaron personas sordas, con un encuadre pensado para que la mano se vea completa.</p>' +
            '<p><b>' + (n.videos - n.validados) + ' están pendientes de revisión</b>' + (n.validados ? ' y ' + n.validados + ' ya revisadas' : ' por un referente sordo') + '. La app lo dice en cada video, sin esconderlo.</p></div>' +
          '<div class="lp-tarjeta"><h3><span class="lp-tick">✓</span> La cámara no mira la cara</h3>' +
            '<p>La cámara solo sigue <b>21 puntos de la mano</b> y guarda números, nunca imágenes. No reconoce el rostro, ni la edad, ni el género, ni las emociones.</p>' +
            '<p>La expresión de la cara la explica una persona y la evalúa un docente: la app no la corrige.</p></div>' +
          '<div class="lp-tarjeta"><h3><span class="lp-tick">✓</span> Todo queda en el equipo</h3>' +
            '<p>El progreso se guarda en el navegador del dispositivo. No hay servidores con datos de los chicos ni cuentas que se puedan filtrar.</p>' +
            '<p>Para el aula: se puede instalar en la computadora y usar sin internet.</p></div>' +
        '</div>' +
      '</div></section>' +

      /* ---------------- CITA ---------------- */
      '<section class="lp-cita"><div class="lp-wrap">' +
        '<blockquote>Aprender una lengua no es memorizar palabras: es poder <b>hablar con alguien</b>.</blockquote>' +
        '<cite>ConectaLSA · Punto Digital Jorge Cafrune · Municipalidad de San Salvador de Jujuy</cite>' +
      '</div></section>' +

      /* ---------------- PREGUNTAS ---------------- */
      '<section class="lp-sec"><div class="lp-wrap">' +
        '<span class="lp-eyebrow">Preguntas frecuentes</span>' +
        '<h2>Lo que suelen preguntar</h2>' +
        '<div class="lp-faq">' +
          '<details><summary>¿Cuánto cuesta?</summary><p>Nada. Es gratuita y no tiene publicidad ni compras adentro. La impulsa el Punto Digital Jorge Cafrune de la Municipalidad de San Salvador de Jujuy.</p></details>' +
          '<details><summary>¿Necesito internet?</summary><p>Para abrirla la primera vez, sí. Después queda guardada y funciona sin conexión, incluso en computadoras del colegio. Los videos se guardan a medida que se miran.</p></details>' +
          '<details><summary>¿Tengo que crear una cuenta?</summary><p>No. Se elige un nombre y un dibujito, y el progreso queda en ese dispositivo. No se pide correo, ni teléfono, ni la fecha de nacimiento.</p></details>' +
          '<details><summary>¿Es lo mismo que un traductor de señas?</summary><p>No. ConectaLSA enseña señas: no traduce frases ni reemplaza a un intérprete. Para comunicarse de verdad hace falta una persona.</p></details>' +
          '<details><summary>¿La cámara graba a mi hijo?</summary><p>No. La cámara se usa solo como espejo: la imagen se analiza en el mismo dispositivo y no se guarda ni se envía. La app no tiene acceso a la galería ni al micrófono.</p></details>' +
          '<details><summary>¿Se puede usar en el aula?</summary><p>Sí. Los niveles están pensados para trabajarse de a uno o en grupo, y hay un modo para que un docente o un referente sordo cargue los videos. Los materiales para imprimir están en la sección de descargas.</p></details>' +
        '</div>' +
      '</div></section>' +

      /* ---------------- CIERRE ---------------- */
      '<section class="lp-sec tight"><div class="lp-wrap"><div class="lp-cierre">' +
        '<h2>¿Empezamos por las vocales?</h2>' +
        '<p>Cinco minutos, cinco señas y un video por cada una. No hace falta nada más.</p>' +
        '<div class="lp-acciones">' +
          '<button class="lp-btn lp-btn-solido" type="button" data-empezar>' + (hayPerfil ? 'Entrar a la app' : 'Crear mi perfil') + ' →</button>' +
          '<a class="lp-btn lp-btn-vidrio" href="#/privacidad">Leer la política de privacidad</a>' +
        '</div>' +
      '</div></div></section>' +

      /* ---------------- PIE ---------------- */
      '<footer class="lp-pie"><div class="lp-wrap">' +
        '<div class="lp-pie-grid">' +
          '<div><h4>ConectaLSA</h4><p style="margin:0;max-width:34ch">Lengua de Señas Argentina para chicos y adolescentes. ' +
            'Un proyecto del Punto Digital Jorge Cafrune, Municipalidad de San Salvador de Jujuy.</p></div>' +
          '<div><h4>La app</h4><ul>' +
            '<li><a href="#/niveles">Niveles</a></li>' +
            '<li><a href="#/diccionario">Diccionario</a></li>' +
            '<li><a href="#/deletreo">Deletreá</a></li>' +
            '<li><a href="#/consejos">Consejos</a></li></ul></div>' +
          '<div><h4>Información</h4><ul>' +
            '<li><a href="#/privacidad">Política de privacidad</a></li>' +
            '<li><a href="#/acerca">Acerca de la app</a></li>' +
            '<li><a href="#/cara">La cara también habla</a></li>' +
            '<li><a href="#/camara">¿Cómo te ve la cámara?</a></li></ul></div>' +
        '</div>' +
        '<div class="lp-firma"><span>Hecho en Jujuy, Argentina.</span><span>Versión ' + esc(App.VERSION || "") + '</span></div>' +
      '</div></footer>' +
    '</div>';

    // Al salir de la pantalla se devuelve la barra de navegación.
    App.$$("[data-empezar]", root).forEach(function (b) { b.addEventListener("click", empezar); });
    App.$$("[data-ir]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = document.getElementById(b.getAttribute("data-ir"));
        if (d) d.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    var limpiarAnimacion = animarPresentacion(root);
    return function () { limpiarAnimacion(); document.body.classList.remove("landing-mode"); };
  };
})(window.App);
