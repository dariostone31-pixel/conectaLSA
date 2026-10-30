/* =========================================================
   ConectaLSA · Videos de señas
   - Almacén local (IndexedDB) para los videos que graban o suben los referentes sordos.
   - También admite archivos declarados en C.MEDIA (carpeta media/senas/).
   - Paquetes de contenido exportables/importables para usar los mismos videos en todos los equipos.
   - Reproductor sin deformación (contain), velocidad lenta, repetición y espejo, con créditos.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var DB = "conectalsa-media", STORE = "videos", db = null, meta = {}, urls = {};

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error("Este navegador no permite guardar videos"));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: "id" }); };
      r.onsuccess = function () { db = r.result; res(db); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(mode) { return open().then(function (d) { return d.transaction(STORE, mode).objectStore(STORE); }); }
  function req(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }

  /* ---------- ZIP mínimo (método «guardar», sin comprimir) ----------
     Sirve para bajar todos los videos de una vez y guardarlos en la compu.
     No usa librerías externas: la app tiene que funcionar sin internet. */
  function crc32(u8) {
    var t = crc32.t;
    if (!t) {
      t = crc32.t = new Int32Array(256);
      for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; }
    }
    var crc = -1;
    for (var i = 0; i < u8.length; i++) crc = (crc >>> 8) ^ t[(crc ^ u8[i]) & 0xFF];
    return (crc ^ -1) >>> 0;
  }
  function hacerZip(archivos) {
    var d = new Date(), partes = [], central = [], offset = 0;
    var hora = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
    var fecha = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    archivos.forEach(function (f) {
      var nombre = new TextEncoder().encode(f.name), crc = crc32(f.u8);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(10, hora, true); lh.setUint16(12, fecha, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, f.u8.length, true); lh.setUint32(22, f.u8.length, true);
      lh.setUint16(26, nombre.length, true); lh.setUint16(28, 0, true);
      partes.push(new Uint8Array(lh.buffer), nombre, f.u8);
      var cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true);
      cd.setUint16(12, hora, true); cd.setUint16(14, fecha, true); cd.setUint32(16, crc, true);
      cd.setUint32(20, f.u8.length, true); cd.setUint32(24, f.u8.length, true); cd.setUint16(28, nombre.length, true);
      cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), nombre);
      offset += 30 + nombre.length + f.u8.length;
    });
    var tamCentral = central.reduce(function (a, b) { return a + b.length; }, 0);
    var fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true);
    fin.setUint32(12, tamCentral, true); fin.setUint32(16, offset, true);
    return new Blob(partes.concat(central, [new Uint8Array(fin.buffer)]), { type: "application/zip" });
  }

  var M = App.Media = {
    /** Carga el índice (sin los videos) al iniciar. */
    init: function () {
      Object.keys(App.CONTENT.MEDIA).forEach(function (id) { var m = App.CONTENT.MEDIA[id]; meta[id] = { id: id, src: m.src, signer: m.signer || "", validatedBy: m.validatedBy || "", source: "file" }; });
      return tx("readonly").then(function (s) { return req(s.getAll()); }).then(function (list) {
        list.forEach(function (r) { meta[r.id] = { id: r.id, signer: r.signer, validatedBy: r.validatedBy || "", created: r.created, size: r.blob ? r.blob.size : 0, type: r.type, source: "local" }; });
      }).catch(function () {});
    },
    has: function (id) { return !!meta[id]; },
    info: function (id) { return meta[id] || null; },
    count: function () { return Object.keys(meta).length; },
    /** Estado del contenido: cuántas señas tienen video y cuántas están validadas (ids = lista opcional, p. ej. un nivel). */
    status: function (ids) {
      ids = ids || Object.keys(App.CONTENT.ITEMS); var v = 0, ok = 0;
      ids.forEach(function (id) { if (meta[id]) { v++; if (meta[id].validatedBy) ok++; } });
      return { total: ids.length, videos: v, validated: ok, complete: ok === ids.length };
    },
    validatedCount: function () { return Object.keys(meta).filter(function (k) { return meta[k].validatedBy; }).length; },
    url: function (id) {
      var m = meta[id]; if (!m) return Promise.resolve(null);
      if (m.source === "file") return Promise.resolve(m.src);
      if (urls[id]) return Promise.resolve(urls[id]);
      return tx("readonly").then(function (s) { return req(s.get(id)); }).then(function (r) { if (!r) return null; urls[id] = URL.createObjectURL(r.blob); return urls[id]; });
    },
    put: function (id, blob, signer) {
      var rec = { id: id, blob: blob, type: blob.type || "video/webm", signer: signer, validatedBy: "", created: Date.now() };
      return tx("readwrite").then(function (s) { return req(s.put(rec)); }).then(function () {
        if (urls[id]) { URL.revokeObjectURL(urls[id]); delete urls[id]; }
        meta[id] = { id: id, signer: signer, validatedBy: "", created: rec.created, size: blob.size, type: rec.type, source: "local" };
      });
    },
    validate: function (id, by) {
      return tx("readwrite").then(function (s) { return req(s.get(id)).then(function (r) { if (!r) throw new Error("No existe"); r.validatedBy = by; return req(s.put(r)); }); })
        .then(function () { meta[id].validatedBy = by; });
    },
    /** Todos los videos grabados en un solo ZIP, con sus créditos. Para guardar en la compu. */
    zipAll: function () {
      return tx("readonly").then(function (st) { return req(st.getAll()); }).then(function (lista) {
        if (!lista.length) return Promise.reject(new Error("Todavía no hay videos grabados"));
        var txt = "ConectaLSA · videos de las señas\r\nGenerado: " + new Date().toLocaleString("es-AR") + "\r\n\r\n" +
          "En esta carpeta está un archivo de video por seña (el nombre es el mismo id que aparece\r\n" +
          "en la dirección de la seña dentro de la app, por ejemplo #/sena/buen-dia → buen-dia.webm).\r\n\r\n" +
          "Seña | Quién la señó | Quién la validó\r\n";
        lista.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
        lista.forEach(function (r) { txt += r.id + " | " + (r.signer || "—") + " | " + (r.validatedBy || "sin validar") + "\r\n"; });
        return Promise.all(lista.map(function (r) {
          var ext = /mp4/.test((r.blob && r.blob.type) || "") ? ".mp4" : ".webm";
          return r.blob.arrayBuffer().then(function (b) { return { name: "videos-senas/" + r.id + ext, u8: new Uint8Array(b) }; });
        })).then(function (archivos) {
          archivos.unshift({ name: "CREDITOS.txt", u8: new TextEncoder().encode(txt) });
          return hacerZip(archivos);
        });
      });
    },
    remove: function (id) {
      return tx("readwrite").then(function (s) { return req(s.delete(id)); }).then(function () { if (urls[id]) URL.revokeObjectURL(urls[id]); delete urls[id]; delete meta[id]; });
    },
    blob: function (id) { return tx("readonly").then(function (s) { return req(s.get(id)); }).then(function (r) { return r && r.blob; }); },
    /** Paquete de contenido: un archivo con todos los videos + créditos (para copiar a otros equipos). */
    exportPack: function () {
      return tx("readonly").then(function (s) { return req(s.getAll()); }).then(function (list) {
        return Promise.all(list.map(function (r) {
          return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res({ id: r.id, type: r.type, signer: r.signer, validatedBy: r.validatedBy, created: r.created, data: fr.result }); }; fr.readAsDataURL(r.blob); });
        }));
      }).then(function (items) { return JSON.stringify({ app: "conectalsa", type: "content-pack", version: 1, exported: new Date().toISOString(), items: items }); });
    },
    importPack: function (text) {
      var m = JSON.parse(text);
      if (!m || m.type !== "content-pack" || !Array.isArray(m.items)) return Promise.reject(new Error("Archivo no válido"));
      return m.items.reduce(function (p, it) {
        return p.then(function () {
          return fetch(it.data).then(function (r) { return r.blob(); }).then(function (b) {
            return tx("readwrite").then(function (s) { return req(s.put({ id: it.id, blob: b, type: it.type, signer: it.signer, validatedBy: it.validatedBy || "", created: it.created || Date.now() })); })
              .then(function () { meta[it.id] = { id: it.id, signer: it.signer, validatedBy: it.validatedBy || "", created: it.created, size: b.size, type: it.type, source: "local" }; if (urls[it.id]) { URL.revokeObjectURL(urls[it.id]); delete urls[it.id]; } });
          });
        });
      }, Promise.resolve()).then(function () { return m.items.length; });
    }
  };

  /* ---------- Reproductor ---------- */
  var esc = App.esc;
  /**
   * Video de la seña con controles, o tarjeta «video en producción».
   * opts.hideLabel: oculta el nombre (para ejercicios). opts.compact: sin controles.
   */
  App.mediaFor = function (item, opts) {
    opts = opts || {};
    var st = App.state().settings, P = App.P();
    var mirror = st.mirrorVideos;
    var box = App.el('<div class="media"><div class="media-box' + (mirror ? " mirror" : "") + '"></div><div class="media-controls"></div><div class="credit"></div></div>');
    var mb = box.querySelector(".media-box"), ctr = box.querySelector(".media-controls"), cr = box.querySelector(".credit");
    var info = M.info(item.id);
    if (!info) {
      mb.innerHTML = placeholder(item, opts);
      ctr.remove();
      cr.innerHTML = '<span class="tag warn">Video en producción</span> Lo va a grabar un referente sordo.';
      if (opts.compact) cr.remove();
      return box;
    }
    var v = App.el('<video playsinline muted loop autoplay preload="auto" disableremoteplayback disablepictureinpicture></video>');
    v.setAttribute("aria-label", opts.hideLabel ? "Video de una seña" : "Video de la seña: " + item.label);
    mb.appendChild(v);
    M.url(item.id).then(function (u) { if (u) { v.src = u; v.playbackRate = st.videoSpeed || 1; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } });
    v.addEventListener("error", function () { mb.innerHTML = placeholder(item, opts, "No se pudo abrir el video."); });
    if (!opts.compact) {
      [[1, "Normal"], [0.5, "Lento"], [0.3, "Muy lento"]].forEach(function (s) {
        var b = App.el('<button class="chip" type="button" data-sp aria-pressed="' + ((st.videoSpeed || 1) === s[0]) + '">' + s[1] + '</button>');
        b.addEventListener("click", function () { v.playbackRate = s[0]; App.$$("[data-sp]", ctr).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); });
        ctr.appendChild(b);
      });
      var rep = App.el('<button class="chip" type="button">↺ Repetir</button>');
      rep.addEventListener("click", function () { v.currentTime = 0; v.play(); }); ctr.appendChild(rep);
      var pa = App.el('<button class="chip" type="button">⏸ Pausa</button>');
      pa.addEventListener("click", function () { if (v.paused) { v.play(); pa.textContent = "⏸ Pausa"; } else { v.pause(); pa.textContent = "▶ Seguir"; } }); ctr.appendChild(pa);
      var mir = App.el('<button class="chip" type="button" aria-pressed="' + !!mirror + '">⇋ Espejo</button>');
      mir.addEventListener("click", function () { var on = !mb.classList.contains("mirror"); mb.classList.toggle("mirror", on); mir.setAttribute("aria-pressed", String(on)); });
      ctr.appendChild(mir);
    } else ctr.remove();
    cr.innerHTML = info.validatedBy
      ? '<span class="tag good">' + App.ico("check-simple") + ' Validado</span> Seña: ' + esc(info.signer || "—") + ' · Validó: ' + esc(info.validatedBy)
      : '<span class="tag warn">Pendiente de validación</span> Seña: ' + esc(info.signer || "—") + '. Falta la revisión de otro referente.';
    if (opts.compact) cr.remove();
    return box;
  };
  function placeholder(item, opts, extra) {
    var big = item.kind === "letra" && !opts.hideLabel
      ? '<span class="ph-letter">' + esc(item.label) + '</span>'
      : '<img class="ph-logo" src="icons/logo-blanco.svg" alt="" width="84" height="84">';
    return '<div class="placeholder"><div class="big-hand">' + big + '</div>' +
      (opts.hideLabel ? "" : '<strong>' + esc(App.itemTitle(item)) + '</strong>') +
      '<p>' + esc(extra || "Video en producción. Mientras tanto, pedile a una persona sorda o a tu docente que te muestre esta seña.") + '</p></div>';
  }
})(window.App);
