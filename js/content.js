/* =========================================================
   ConectaLSA · Contenidos propios
   Estructura de niveles equivalente a la de ComuSeñas (vocales, consonantes,
   colores, días, meses, saludos y cortesía) con textos, organización y videos PROPIOS.
   Los videos los graban y validan referentes sordos desde el Modo referente
   (o se cargan como archivos en media/senas/ y se declaran en C.MEDIA).
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";
  var C = App.CONTENT = {};

  /* ---------- Señas ---------- */
  var ITEMS = C.ITEMS = {};
  function add(level, kind, label, o) {
    o = o || {};
    var id = o.id || (kind === "letra" ? "letra-" + label.toLowerCase() : App_slug(label));
    ITEMS[id] = { id: id, level: level, kind: kind, label: label, write: o.write || label, alt: o.alt || [], uso: o.uso || "", aiLabel: kind === "letra" ? label : id };
  }
  function App_slug(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!]/g, "").trim().replace(/\s+/g, "-"); }

  var EJ = { A: "Ana", E: "Elena", I: "Iván", O: "Omar", U: "Úrsula", B: "Bruno", C: "Carla", D: "Diego", F: "Flor", G: "Gabi", H: "Hugo", J: "Juana", K: "Karen", L: "Lucas", M: "Mora", N: "Nico", "Ñ": "Ñandú", P: "Paula", Q: "Quique", R: "Rocío", S: "Sofi", T: "Tomás", V: "Vale", W: "Walter", X: "Ximena", Y: "Yanina", Z: "Zoe" };
  "A E I O U".split(" ").forEach(function (l) { add("vocales", "letra", l, { uso: "Vocal. Ejemplo para deletrear: " + EJ[l] + "." }); });
  [["cons1", "B C D F G"], ["cons2", "H J K L M"], ["cons3", "N Ñ P Q R S"], ["cons4", "T V W X Y Z"]].forEach(function (g) {
    g[1].split(" ").forEach(function (l) { add(g[0], "letra", l, { uso: "Consonante. Ejemplo para deletrear: " + EJ[l] + "." }); });
  });
  [["Rojo", "Como el semáforo cuando hay que frenar."], ["Azul", "Como el cielo de una tarde despejada."], ["Amarillo", "Como el sol o un limón."], ["Verde", "Como el pasto o una hoja."],
   ["Blanco", "Como la nieve o una hoja de papel."], ["Negro", "Como el cielo de noche."], ["Gris", "Como una nube de lluvia."], ["Marrón", "Como la tierra o el chocolate.", ["cafe", "café"]],
   ["Naranja", "Como la fruta del mismo nombre."], ["Violeta", "Como una berenjena.", ["morado", "lila"]], ["Rosa", "Como un chicle de frutilla.", ["rosado"]], ["Celeste", "Como la bandera argentina."]
  ].forEach(function (c) { add("colores", "palabra", c[0], { uso: c[1], alt: c[2] }); });
  [["Lunes", "El primer día de la semana laboral."], ["Martes", "El segundo día de la semana."], ["Miércoles", "La mitad de la semana."], ["Jueves", "Falta poco para el fin de semana."],
   ["Viernes", "El último día de la semana laboral."], ["Sábado", "Primer día del fin de semana."], ["Domingo", "Último día del fin de semana."]
  ].forEach(function (c) { add("dias", "palabra", c[0], { uso: c[1] }); });
  [["Enero", "Pleno verano y vacaciones."], ["Febrero", "Mes de carnaval."], ["Marzo", "Empiezan las clases."], ["Abril", "Otoño."], ["Mayo", "El 25 es feriado patrio."], ["Junio", "Empieza el invierno."],
   ["Julio", "Vacaciones de invierno."], ["Agosto", "Mes de la Pachamama."], ["Septiembre", "Llega la primavera.", ["setiembre"]], ["Octubre", "Primavera en flor."], ["Noviembre", "Se acerca fin de año."], ["Diciembre", "Fiestas y fin de las clases."]
  ].forEach(function (c) { add("meses", "palabra", c[0], { uso: c[1], alt: c[2] }); });
  [["Hola", "Para saludar a cualquier persona."], ["Chau", "Para despedirte.", ["adios", "adiós"]], ["Buen día", "Saludo de la mañana.", ["buenos dias", "buenos días"]],
   ["Buenas tardes", "Saludo después del mediodía."], ["Buenas noches", "Saludo al anochecer o para despedirte de noche."], ["¿Cómo estás?", "Para preguntar cómo está la otra persona.", ["como estas", "como andas", "cómo andás"]], ["Bien", "Para responder que estás bien."]
  ].forEach(function (c) { add("saludos1", "frase", c[0], { uso: c[1], alt: c[2] }); });
  [["Gracias", "Para agradecer."], ["Por favor", "Para pedir algo con amabilidad."], ["Perdón", "Para disculparte.", ["disculpa", "disculpá", "perdon"]], ["De nada", "Para responder a un «gracias»."],
   ["Mucho gusto", "Cuando conocés a alguien.", ["encantado", "encantada"]], ["Me llamo", "Para decir tu nombre (después lo deletreás)."], ["¿Cómo te llamás?", "Para preguntar el nombre.", ["como te llamas", "cual es tu nombre"]], ["Nos vemos", "Para despedirte hasta la próxima.", ["hasta luego"]]
  ].forEach(function (c) { add("saludos2", "frase", c[0], { uso: c[1], alt: c[2] }); });

  /* ---------- Consejos (propios). Equivalen a los «advices» de ComuSeñas, ampliados. ---------- */
  C.CONSEJOS = [
    { id: "parametros", ico: "🧩", title: "Las partes de una seña", short: "Forma, orientación, lugar, movimiento y cara.",
      body: ["Cada seña combina cinco elementos al mismo tiempo. Si cambia uno, puede cambiar el significado.", "**Configuración:** la forma de la mano.", "**Orientación:** hacia dónde mira la palma.", "**Ubicación:** dónde se hace (frente a la cara, al pecho, en el espacio).", "**Movimiento:** cómo se desplaza la mano.", "**Rasgos no manuales:** expresión de la cara, mirada y postura."] },
    { id: "espacio", ico: "🔲", title: "El espacio para señar", short: "Frente a tu cuerpo, de la cintura a la cabeza.",
      body: ["Las señas se hacen en un espacio imaginario frente a tu cuerpo, desde la cintura hasta un poco arriba de la cabeza.", "Para practicar con la cámara, alejate lo suficiente para que se vean tu mano y tu cara.", "Las letras del alfabeto manual se hacen a la altura del hombro de tu mano dominante, con la palma hacia la otra persona."] },
    { id: "cara", ico: "🙂", title: "Cara y mirada", short: "La expresión también es lengua.",
      body: ["En LSA la cara no es un adorno: marca preguntas, emociones e intensidad.", "En una pregunta como «¿Cómo te llamás?», la expresión de pregunta es parte de la seña.", "Mantené el contacto visual con la persona con la que conversás.", "La cámara de la app mira solo la mano: la expresión la evalúa una persona."] },
    { id: "mano", ico: "✋", title: "Tu mano dominante", short: "Usá siempre la misma.",
      body: ["La mano dominante es la que más usás (con la que escribís). Hace las señas de una mano y el deletreo.", "Si sos zurdo o zurda, señá con la izquierda: es correcto.", "Lo importante es no cambiar de mano en medio de una conversación.", "En Ajustes podés elegir tu mano dominante y ver los videos en espejo."] },
    { id: "camara", ico: "📷", title: "Practicar con la cámara", short: "Luz de frente y la mano en el recuadro.",
      body: ["Buscá luz de frente (una ventana o una lámpara delante tuyo, no detrás).", "Mostrá la mano completa dentro del recuadro, sin tapar dedos.", "La app te avisa si hay poca luz o si estás muy cerca o muy lejos.", "La cámara **nunca graba**: analiza cada imagen en el momento y la descarta.", "Si sabés que la hacés bien y no te reconoce, no es tu culpa: tocá «Marcar como lograda»."] }
  ];

  /* ---------- Niveles (equivalentes funcionales a los de ComuSeñas, organización propia) ---------- */
  C.LEVELS = [
    { id: "vocales", n: 1, title: "Vocales", ico: "🅰️", color: "#F0643C", tip: "mano", groups: [["A", "E", "I"], ["O", "U"]] },
    { id: "colores", n: 2, title: "Colores", ico: "🎨", color: "#2E9E8F", tip: "parametros", groups: [["rojo", "azul", "amarillo", "verde"], ["blanco", "negro", "gris", "marron"], ["naranja", "violeta", "rosa", "celeste"]] },
    { id: "dias", n: 3, title: "Días de la semana", ico: "📆", color: "#3D8BD9", tip: "espacio", groups: [["lunes", "martes", "miercoles", "jueves"], ["viernes", "sabado", "domingo"]] },
    { id: "saludos1", n: 4, title: "Saludos y cortesía 1", ico: "👋", color: "#FFC23D", tip: "cara", groups: [["hola", "chau", "buen-dia"], ["buenas-tardes", "buenas-noches", "como-estas", "bien"]] },
    { id: "cons1", n: 5, title: "Consonantes B a G", ico: "🔡", color: "#0F6B6F", tip: "camara", groups: [["B", "C", "D"], ["F", "G"]] },
    { id: "cons2", n: 6, title: "Consonantes H a M", ico: "🔡", color: "#0F6B6F", tip: "mano", groups: [["H", "J", "K"], ["L", "M"]] },
    { id: "cons3", n: 7, title: "Consonantes N a S", ico: "🔡", color: "#0F6B6F", tip: "espacio", groups: [["N", "Ñ", "P"], ["Q", "R", "S"]] },
    { id: "cons4", n: 8, title: "Consonantes T a Z", ico: "🔡", color: "#0F6B6F", tip: "camara", groups: [["T", "V", "W"], ["X", "Y", "Z"]] },
    { id: "meses", n: 9, title: "Meses del año", ico: "🗓️", color: "#7A4B3A", tip: "parametros", groups: [["enero", "febrero", "marzo", "abril"], ["mayo", "junio", "julio", "agosto"], ["septiembre", "octubre", "noviembre", "diciembre"]] },
    { id: "saludos2", n: 10, title: "Saludos y cortesía 2", ico: "🤝", color: "#F0643C", tip: "cara", groups: [["gracias", "por-favor", "perdon", "de-nada"], ["mucho-gusto", "me-llamo", "como-te-llamas", "nos-vemos"]] }
  ];
  // Normaliza ids de los grupos y arma las lecciones: una por grupo + «Desafío del nivel».
  C.LEVELS.forEach(function (lv) {
    lv.lessons = lv.groups.map(function (g, i) {
      var ids = g.map(function (x) { return /^[A-ZÑ]$/.test(x) ? "letra-" + x.toLowerCase() : x; });
      return { id: "l" + (i + 1), title: ids.map(function (id) { return ITEMS[id].label; }).join(", "), items: ids };
    });
    var all = []; lv.lessons.forEach(function (l) { all = all.concat(l.items); });
    lv.items = all;
    lv.lessons.push({ id: "desafio", title: "Desafío del nivel", items: all, challenge: true });
    lv.desc = all.length + " señas · " + (lv.lessons.length - 1) + " lecciones + desafío";
  });

  /* Palabras para deletrear (juego) */
  C.DELETREO = ["SOL", "LUNA", "MATE", "CASA", "AMIGO", "ESCUELA", "FAMILIA", "GRACIAS", "NUBE", "SEÑA"];

  /* Videos cargados como archivos (opcional). Ej.: C.MEDIA["hola"] = { src: "media/senas/hola.mp4", signer: "…", validatedBy: "…" } */
  C.MEDIA = {};

  /* ---------- Ayudantes ---------- */
  App.level = function (id) { for (var i = 0; i < C.LEVELS.length; i++) if (C.LEVELS[i].id === id) return C.LEVELS[i]; return null; };
  App.lesson = function (lv, lid) { lv = typeof lv === "string" ? App.level(lv) : lv; if (!lv) return null; for (var i = 0; i < lv.lessons.length; i++) if (lv.lessons[i].id === lid) return lv.lessons[i]; return null; };
  App.levelProgress = function (lid) {
    var lv = App.level(lid), p = App.P(); if (!lv || !p) return { done: 0, total: 0, pct: 0, stars: 0, max: 0 };
    var done = 0, stars = 0;
    lv.lessons.forEach(function (l) { var s = p.stars[lv.id + "/" + l.id] || 0; if (s) done++; stars += s; });
    return { done: done, total: lv.lessons.length, pct: done / lv.lessons.length, stars: stars, max: lv.lessons.length * 3 };
  };
  App.nextLesson = function () {
    var p = App.P(); if (!p) return null;
    for (var i = 0; i < C.LEVELS.length; i++) {
      var lv = C.LEVELS[i];
      for (var j = 0; j < lv.lessons.length; j++) if (!p.stars[lv.id + "/" + lv.lessons[j].id]) return { level: lv, lesson: lv.lessons[j] };
    }
    return null;
  };
  App.itemTitle = function (it) { return it.kind === "letra" ? "Letra " + it.label : it.label; };
  App.allItems = function () { return Object.keys(ITEMS).map(function (k) { return ITEMS[k]; }); };
})(window.App);
