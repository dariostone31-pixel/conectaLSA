/* ConectaLSA · Service worker
   Guarda la app para que funcione sin internet.
   Lo que se guarda al instalar es la app (código, estilos, fuentes, íconos, imágenes): menos de 1 MB.
   La IA de la mano (26 MB) y los videos se guardan la primera vez que se usan.
   Al publicar una nueva versión, cambiá VERSION para que se actualice en todos los dispositivos. */
var VERSION = "conectalsa-v1.4.1";
var CORE = [
  "./", "index.html", "manifest.webmanifest",
  "css/app.css", "css/landing.css",
  "js/core.js", "js/iconos.js", "js/content.js", "js/vision.js", "js/media.js", "js/views-learn.js", "js/privacidad.js", "js/views-acceso.js", "js/views-profile.js", "js/views-ai.js", "js/views-ref.js", "js/views-landing.js", "js/main.js",
  "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-180.png", "icons/logo.svg", "icons/logo-blanco.svg",
  /* La IA de la mano (26 MB) NO se guarda al instalar: se baja la primera vez que alguien
     abre la cámara y desde ahí queda guardada. Así la app instala en menos de 1 MB
     y solo paga ese peso quien usa la cámara. */
  "img/consejos/parametros.jpg", "img/consejos/espacio.jpg", "img/consejos/cara.jpg",
  "img/consejos/mano.jpg", "img/consejos/camara.jpg",
  "img/landing-app-leccion.jpg", "img/landing-app-niveles.jpg", "img/landing-app-deletreo.jpg",
  "img/landing-app-camara.jpg"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Estrategia:
//  - Archivos pesados que casi nunca cambian (IA, tipografías, íconos, videos): primero caché.
//  - Código y contenidos de la app: primero red (si hay conexión, siempre la última versión);
//    sin conexión, la copia guardada. Así una corrección llega a todas las PC del evento con solo recargar.
var HEAVY = /\/(vendor|fonts|icons|media|img)\//;
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (HEAVY.test(req.url)) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok && res.status === 200) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok && res.status === 200) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error()); });
  }));
});
