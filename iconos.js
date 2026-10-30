/* =========================================================
   ConectaLSA · Íconos propios
   Set dibujado a medida (trazo de 24×24, esquinas redondeadas), en línea con
   el logo: mano + ondas. Reemplaza los emojis del sistema, que cambian de forma
   en cada teléfono y no se pueden adaptar a los perfiles visuales.
   Uso:  App.ico("mano")  →  <svg …aria-hidden="true">…</svg>
         App.ico("estrella", "lg")  →  agrega la clase al <svg>
   Todos heredan el color del texto (currentColor) y el grosor de trazo.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";

  var V = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

  /* Cada valor es el contenido interno del <svg>. */
  var I = {

    /* ---------- Navegación ---------- */
    niveles: '<path d="M3 6.5 9 4.5l6 2 6-2v13l-6 2-6-2-6 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    libro: '<path d="M12 6.2C10.3 5 7.8 4.5 4.5 4.5v13.2c3.3 0 5.8.6 7.5 1.8 1.7-1.2 4.2-1.8 7.5-1.8V4.5c-3.3 0-5.8.5-7.5 1.7z"/><path d="M12 6.2v13.3"/>',
    mano: '<path d="M8.5 12.5V6.8a1.4 1.4 0 0 1 2.8 0V11m0-.6V5.4a1.4 1.4 0 0 1 2.8 0V11m0-.4V6.6a1.4 1.4 0 0 1 2.8 0v7.6c0 3.9-2.4 6.6-6.2 6.6S4.4 18 4.4 14.1v-2.4a1.4 1.4 0 0 1 2.8 0v1.6"/>',
    persona: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c0-3.8 3.4-6 7.5-6s7.5 2.2 7.5 6"/>',
    salir: '<path d="M14.5 12H4m3.5-3.5L4 12l3.5 3.5"/><path d="M13 4.5h5.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H13"/>',
    llave: '<circle cx="15.5" cy="8.5" r="3.6"/><path d="M12.9 11.1 4.5 19.5M8 16l2 2M6 18l2 2"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    "usuario-mas": '<circle cx="10" cy="8" r="3.4"/><path d="M3.5 20.5c0-3.6 3-5.7 6.5-5.7 1.4 0 2.7.3 3.8.9"/><path d="M17.5 14v5M15 16.5h5"/>',

    /* ---------- Practicar ---------- */
    repaso: '<path d="M4.2 12a7.8 7.8 0 0 1 13.3-5.5L20 9"/><path d="M20 4.5V9h-4.5"/><path d="M19.8 12a7.8 7.8 0 0 1-13.3 5.5L4 15"/><path d="M4 19.5V15h4.5"/>',
    letras: '<path d="M3.5 18.5 7.6 6.5l4.1 12"/><path d="M5 15h5.2"/><circle cx="16.4" cy="15.2" r="2.6"/><path d="M19 12.6v6.4"/>',
    camara: '<path d="M4 8.2h2.6l1.5-2.2h7.8l1.5 2.2H20a1 1 0 0 1 1 1v8.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.2a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.3"/>',
    "camara-off": '<path d="M4 8.2h2.6l1.5-2.2h7.8l1.5 2.2H20a1 1 0 0 1 1 1v8.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.2a1 1 0 0 1 1-1z"/><path d="m4 20 16-16"/>',
    bombilla: '<path d="M9.2 18.4h5.6M10.4 21h3.2"/><path d="M12 3a5.6 5.6 0 0 0-3.3 10.1V16h6.6v-2.9A5.6 5.6 0 0 0 12 3z"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="5.8"/><path d="m15 15 4.5 4.5"/>',
    marco: '<path d="M4 8.5V5.5a1 1 0 0 1 1-1h3M16 4.5h3a1 1 0 0 1 1 1v3M20 15.5v3a1 1 0 0 1-1 1h-3M8 19.5H5a1 1 0 0 1-1-1v-3"/><path d="M9.5 12h5"/>',
    cara: '<circle cx="12" cy="12" r="8.6"/><path d="M9 10.2v.6M15 10.2v.6"/><path d="M8.6 14.4a4.2 4.2 0 0 0 6.8 0"/>',
    capas: '<path d="m12 3.5 8.5 4.6L12 12.7 3.5 8.1z"/><path d="m4 12.6 8 4.4 8-4.4"/><path d="m4 16.6 8 4.4 8-4.4"/>',
    paleta: '<rect x="3.4" y="3.4" width="7.4" height="7.4" rx="2.2"/><rect x="13.2" y="3.4" width="7.4" height="7.4" rx="2.2"/><rect x="3.4" y="13.2" width="7.4" height="7.4" rx="2.2"/><circle cx="16.9" cy="16.9" r="3.7"/>',
    calendario: '<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/><path d="M3.6 10h16.8M8 3.4v3.6M16 3.4v3.6"/><path d="M7.6 13.6h.9M11.6 13.6h.9M15.6 13.6h.9M7.6 17.2h.9M11.6 17.2h.9"/>',
    "hola-mano": '<path d="M6 13V7.6a1.3 1.3 0 0 1 2.6 0v3.8m0-.4V6.2a1.3 1.3 0 0 1 2.6 0V11m0-.3V7.2a1.3 1.3 0 0 1 2.6 0v6.4c0 3.4-2 5.9-5.3 5.9S3.6 17 3.6 13.6v-1.9a1.3 1.3 0 0 1 2.4 0"/><path d="M18 4.2c1 1 1.4 2.2 1.2 3.6M21 3c1.6 1.6 2.2 3.6 1.8 5.8"/>',
    "mano-dos": '<path d="M9 13.6V8.4a1.3 1.3 0 0 1 2.6 0v3.2m0-.4V7.2a1.3 1.3 0 0 1 2.6 0v4"/><path d="M14.2 11V8.6a1.3 1.3 0 0 1 2.6 0v5.2c0 3.3-2 5.7-5.2 5.7s-5.2-2.4-5.2-5.7v-2.4"/><path d="M5.4 11V6.6M2.6 12V8.4"/>',
    dado: '<rect x="4" y="4" width="16" height="16" rx="3.2"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/>',

    /* ---------- Estados y acciones ---------- */
    estrella: '<path d="M12 3.6l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.5 6.6 20.4l1-6.1L3.2 10l6.1-.9z"/>',
    "estrella-llena": '<path d="M12 3.6l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.5 6.6 20.4l1-6.1L3.2 10l6.1-.9z" fill="currentColor"/>',
    fuego: '<path d="M12 3.2c2.8 3.9 6.2 5.6 6.2 9.7a6.2 6.2 0 1 1-12.4 0c0-1.9.8-3.4 2-4.9.1 1.9.9 3 2 3.5-.6-2.6.3-5.4 2.2-8.3z"/><path d="M12 13.4c.9 1 1.4 1.9 1.4 2.7a1.4 1.4 0 0 1-2.8 0c0-.8.5-1.7 1.4-2.7z"/>',
    check: '<circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
    "check-simple": '<path d="m5 12.6 4.7 4.7L19 7"/>',
    alerta: '<path d="M12 4.4 21 19.6H3z"/><path d="M12 9.8v4.2M12 16.9v.6"/>',
    descarga: '<path d="M12 4v10m0 0-3.8-3.8M12 14l3.8-3.8"/><path d="M4.5 19.5h15"/>',
    subir: '<path d="M12 14.5v-10m0 0L8.2 8.3M12 4.5l3.8 3.8"/><path d="M4.5 19.5h15"/>',
    recargar: '<path d="M20 12a8 8 0 1 1-2.8-6.1"/><path d="M20 4.5V10h-5.5"/>',
    cerrar: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    play: '<path d="M8.5 5.4 19 12 8.5 18.6z" fill="currentColor" stroke="none"/>',
    pausa: '<path d="M9 5.5v13M15 5.5v13"/>',
    ojo: '<path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.9"/>',
    reloj: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 2"/>',
    trofeo: '<path d="M8 4.5h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5.4a2.6 2.6 0 0 0 2.6 4.4M16 6h2.6a2.6 2.6 0 0 1-2.6 4.4"/><path d="M12 12.5V16M9 19.5h6"/>',
    meta: '<path d="M5.5 20.5V4.5"/><path d="M5.5 5.5h9l-1.4 3 1.4 3h-9z"/>',
    documento: '<path d="M6 3.6h7.5L18 8.1v12.3H6z"/><path d="M13.3 3.6V8.3H18"/><path d="M9 12.4h6M9 16h4"/>',
    "llave-inglesa": '<path d="M14.5 3.6a4.7 4.7 0 0 0-4 7.1L4 17.1v3.3h3.3l6.4-6.5a4.7 4.7 0 0 0 5.9-6l-2.8 2.8-2.6-.6-.6-2.6z"/>',
    informacion: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.6M12 7.9v.6"/>',
    ajustes: '<path d="M4 7.2h8M16.2 7.2H20M4 16.8h4.2M12.4 16.8H20"/><circle cx="14.1" cy="7.2" r="2.1"/><circle cx="10.3" cy="16.8" r="2.1"/>',
    grafico: '<path d="M4.5 20V12.4M11 20V5.4M17.5 20v-5.2"/><path d="M21 20H3"/>',
    escudo: '<path d="M12 3.4 19 6v6.2c0 4.2-2.9 7.4-7 8.4-4.1-1-7-4.2-7-8.4V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
    hora: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.6 2.2"/>',

    /* ---------- Perfiles visuales ---------- */
    sol: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/>',
    luna: '<path d="M20.2 14.6A8.7 8.7 0 0 1 9.4 3.8a8.7 8.7 0 1 0 10.8 10.8z"/>',
    pantalla: '<rect x="3.4" y="4.6" width="17.2" height="11.4" rx="1.8"/><path d="M9 20h6M12 16v4"/>',
    contraste: '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor" stroke="none"/>',
    daltonico: '<circle cx="9" cy="9.6" r="4.4"/><circle cx="15" cy="9.6" r="4.4"/><circle cx="12" cy="14.8" r="4.4"/>',
    calma: '<path d="M4 20.4c8.6 1.2 15.6-4.6 16.4-16.8C9.2 3.4 2.6 10.6 4 20.4z"/><path d="M4.6 19.8C7.4 14 11.6 9.8 17.2 6.6"/>',
    texto: '<path d="M3.6 18.5 7.7 6.5l4.1 12"/><path d="M5.1 15h5.2"/><path d="M14.4 12.6h5.2M17 12.6v6"/>',
    movimiento: '<path d="M2.8 12.4c2.2-3.4 4.4 3.4 6.6 0s4.4 3.4 6.6 0 4.4 3.4 6.6 0"/>',
    sonido: '<path d="M4.5 9.6h2.8L12 5.4v13.2L7.3 14.4H4.5z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    vibracion: '<rect x="7.4" y="3.6" width="9.2" height="16.8" rx="2"/><path d="M3.6 9.2v5.6M20.4 9.2v5.6"/>',

    /* ---------- Otros ---------- */
    candado: '<rect x="5.6" y="10.4" width="12.8" height="9.4" rx="2"/><path d="M8.8 10.4V7.6a3.2 3.2 0 0 1 6.4 0v2.8"/>',
    "llave-pin": '<circle cx="15.4" cy="8.6" r="3.4"/><path d="M13 11 5 19v0M8.4 15.6l1.9 1.9"/>',
    archivo: '<path d="M13.6 3.6H6v16.8h12V8z"/><path d="M13.4 3.6V8H18"/>',
    puntos: '<circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    borrar: '<path d="M9.6 5.4h9.9a1 1 0 0 1 1 1v11.2a1 1 0 0 1-1 1H9.6L3.4 12z"/><path d="m8.6 9.6 5 4.8M13.6 9.6l-5 4.8"/>',
    "mano-corazon": '<path d="M11 20.4c-4.6-2.6-7.4-5.2-7.4-8.4A3.6 3.6 0 0 1 11 9.5a3.6 3.6 0 0 1 7.4 2.5c0 3.2-2.8 5.8-7.4 8.4z"/><path d="M17.6 4.4c1 .8 1.5 1.8 1.5 3"/>',
    bandera: '<path d="M5.6 3.6v17"/><path d="M5.6 5h10.8l-1.8 3.6 1.8 3.6H5.6z"/>',
    edificio: '<path d="M4.6 20.4V5.2a1 1 0 0 1 1-1h7.8a1 1 0 0 1 1 1v15.2"/><path d="M14.4 9.6h4a1 1 0 0 1 1 1v9.8M3.4 20.4h17.2"/><path d="M7.6 8.4h1.2M11 8.4h1.2M7.6 12h1.2M11 12h1.2M7.6 15.6h1.2M11 15.6h1.2"/>',
    mundo: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8"/><path d="M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6S9.6 5.8 12 3.4z"/>'
  };

  App.ICONOS = I;

  /** Devuelve el SVG del ícono. Si el nombre no existe, devuelve "" (nunca rompe la vista). */
  App.ico = function (nombre, clase) {
    var cuerpo = I[nombre];
    if (!cuerpo) return "";
    return '<svg class="ico-svg' + (clase ? " " + esc(clase) : "") + '" ' + V + '>' + cuerpo + '</svg>';
  };
  function esc(s) { return String(s || "").replace(/[^\w\s-]/g, ""); }

  /** Alias para usar dentro de una vista: '<span class="ico">' + I.descarga + '</span>' */
  App.icoSpan = function (nombre, clase) {
    return '<span class="ico' + (clase ? " " + clase : "") + '">' + App.ico(nombre) + "</span>";
  };

  /* ---------- Íconos de los niveles (reemplazan los emojis de content.js) ---------- */
  App.LEVEL_ICONS = {
    vocales: "letras", colores: "paleta", dias: "calendario", meses: "calendario",
    saludos1: "hola-mano", saludos2: "mano-dos",
    cons1: "letras", cons2: "letras", cons3: "letras", cons4: "letras"
  };
  /* Íconos de las fichas de consejos */
  App.TIP_ICONS = { parametros: "capas", espacio: "marco", cara: "cara", mano: "mano", camara: "camara" };
  /* Íconos de los logros */
  App.BADGE_ICONS = {
    inicio: "meta", vocales: "letras", abc: "letras", colores: "paleta", calendario: "calendario",
    cortes: "mano-dos", ia: "mano", escritura: "texto", deletreo: "dado", repaso: "repaso",
    racha3: "fuego", estrellas: "estrella-llena"
  };

  /* ---------------------------------------------------------
     Caras: expresión facial
     Se dibujan aparte de los íconos porque necesitan más detalle
     (cejas, ojos y boca) para que se entienda la expresión.
     --------------------------------------------------------- */
  var CARA = {
    // cabeza y ojos comunes
    base: '<circle cx="24" cy="24" r="17"/>',
    // Cada expresión cambia cejas, ojos y boca.
    tranquila: '<path d="M16 20h5M27 20h5"/><circle cx="18.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="29.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><path d="M19 30c1.6 1.6 3.4 2.2 5 2.2s3.4-.6 5-2.2"/>',
    pregunta: '<path d="M15.5 17.5c1.6-1.4 3.4-1.4 5 0M27.5 17.5c1.6-1.4 3.4-1.4 5 0"/><circle cx="18.5" cy="24" r="2.1"/><circle cx="29.5" cy="24" r="2.1"/><ellipse cx="24" cy="32" rx="3" ry="3.4"/>',
    afirmar: '<path d="M15.5 19.5h6M26.5 19.5h6"/><circle cx="18.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="29.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><path d="M19.5 30.5c1.4 1.2 3 1.8 4.5 1.8s3.1-.6 4.5-1.8"/>',
    saludo: '<path d="M15.5 19.5c1.6-1.6 3.4-1.6 5 0M27.5 19.5c1.6-1.6 3.4-1.6 5 0"/><path d="M16.2 23.6c.9.9 2.2.9 3.1 0M28.7 23.6c.9.9 2.2.9 3.1 0"/><path d="M18 29.4c1.7 2 3.9 3 6 3s4.3-1 6-3"/>',
    enfasis: '<path d="M15.5 17.8l5.4 2M32.5 17.8l-5.4 2"/><circle cx="18.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="29.5" cy="24" r="1.6" fill="currentColor" stroke="none"/><ellipse cx="24" cy="31.5" rx="5" ry="3.6"/>'
  };

  /** Cara con la expresión pedida (tranquila, pregunta, afirmar, saludo, enfasis). */
  App.caraSVG = function (id, clase) {
    var d = CARA[id] ? id : "tranquila";
    return '<svg class="cara-svg' + (clase ? " " + clase : "") + '" viewBox="0 0 48 48" fill="none" stroke="currentColor" ' +
      'stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      CARA.base + CARA[d] + '</svg>';
  };

  /** Pinta un ícono de nivel a partir del id (con respaldo seguro). */
  App.icoNivel = function (id, clase) { return App.ico(App.LEVEL_ICONS[id] || "libro", clase); };
  App.icoTip = function (id, clase) { return App.ico(App.TIP_ICONS[id] || "capas", clase); };
  App.icoBadge = function (id, clase) { return App.ico(App.BADGE_ICONS[id] || "estrella", clase); };
})(window.App);
