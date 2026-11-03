/* =========================================================
   ConectaLSA · Política de privacidad y datos
   Texto único, reutilizado por pantalla y por el documento público.
   IMPORTANTE: no prometer nada que la app no haga. Este texto se escribe mirando el código.
   ========================================================= */
window.App = window.App || {};
(function (App) {
  "use strict";

  var CONTACTO = "[completar antes de publicar: correo o teléfono de la Dirección de Innovación]";

  App.PRIVACIDAD = {
    version: "2.0",
    fecha: "29 de octubre de 2026",
    contacto: CONTACTO,
    responsable: "Dirección de Innovación de la Municipalidad de San Salvador de Jujuy · Punto Digital Jorge Cafrune",
    secciones: [
      {
        t: "Quién es el responsable",
        p: ["Esta app la desarrolla y la publica la <strong>Dirección de Innovación de la Municipalidad de San Salvador de Jujuy</strong>, "
          + "en el marco del Punto Digital Jorge Cafrune. No hay ninguna empresa detrás que reciba datos: el proyecto no se vende, "
          + "no tiene publicidad y no cobra suscripciones."]
      },
      {
        t: "Lo más importante, de un vistazo",
        l: [
          "<strong>No hay cuentas en internet ni registro.</strong> No se pide correo, teléfono, DNI ni contraseña. "
          + "Cada persona usa la app con un perfil que queda en el dispositivo y, si quiere, le pone un PIN local.",
          "<strong>No hay servidores nuestros que guardan datos de las personas.</strong> La app funciona sola en el dispositivo.",
          "<strong>No hay analíticas, ni cookies de seguimiento, ni publicidad, ni código de terceros que mida el uso.</strong>",
          "<strong>La cámara nunca graba.</strong> Las imágenes se analizan en el dispositivo, en el momento, y se descartan.",
          "<strong>El PIN del perfil no sale del equipo.</strong> Se guarda como un resumen que no se puede leer y no se puede recuperar.",
          "<strong>El progreso queda en tu dispositivo.</strong> Vos decidís si lo respaldás o lo borrás."
        ]
      },
      {
        t: "Qué datos se guardan y dónde",
        p: ["Todo lo que guarda la app queda en el <strong>almacenamiento local del navegador de ese dispositivo</strong>. "
          + "No se transmite a ningún servidor."],
        tabla: {
          cab: ["Dato", "Para qué", "Dónde queda", "Se puede borrar"],
          filas: [
            ["Nombre o apodo del perfil (opcional)", "Personalizar la experiencia y el panel de progreso",
             "Almacenamiento local del dispositivo", "Sí, desde Ajustes → Eliminar perfil"],
            ["Avatar, mano hábil y meta diaria", "Adaptar las lecciones y el espejo de los videos",
             "Almacenamiento local", "Sí, desde Ajustes"],
            ["Estrellas, puntos, racha, repaso", "Mostrar el progreso y elegir qué repasar",
             "Almacenamiento local", "Sí, desde Ajustes"],
            ["Preferencias de accesibilidad", "Perfil visual (colores), tamaño de texto y movimiento reducido",
             "Almacenamiento local", "Sí, desde Ajustes"],
            ["PIN de acceso del perfil (opcional)", "Que otra persona del mismo equipo no entre a ese perfil",
             "Almacenamiento local, como resumen cifrado de 4.000 vueltas (no se guarda el PIN en texto plano)", "Sí, desde Ajustes → Acceso"],
            ["Videos grabados en Modo referente", "Que el equipo pueda revisarlos y publicarlos si corresponde",
             "Base de datos interna del navegador (IndexedDB) de ese equipo", "Sí, desde Modo referente"],
            ["Ejemplos de entrenamiento de la cámara", "Que la cámara reconozca las señas",
             "Almacenamiento local del equipo (se pueden exportar en un archivo)", "Sí, desde Entrenar la cámara"]
          ]
        }
      },
      {
        t: "El acceso: perfiles y PIN local",
        p: [
          "ConectaLSA no tiene cuentas de usuario ni servidor de autenticación. En el dispositivo se pueden crear <strong>varios perfiles</strong> "
          + "(por ejemplo, una familia o un aula) y cada uno guarda su propio progreso.",
          "Cada perfil puede tener un <strong>PIN de 4 números, opcional</strong>. El PIN <strong>no se guarda tal cual</strong>: se guarda un "
          + "resumen matemático (hash) calculado con 4.000 repeticiones y una sal aleatoria propia de cada perfil. Ese resumen no permite "
          + "deducir el PIN, y por eso el PIN <strong>no se puede recuperar</strong>: si se olvida, solo se puede borrar el perfil.",
          "Para qué sirve: que otra persona que use el mismo equipo no entre al perfil. <strong>Qué no es</strong>: no es una cuenta de "
          + "internet, no protege los datos si alguien tiene acceso físico al dispositivo, y no reemplaza el bloqueo del teléfono o de la "
          + "computadora. Después de 5 intentos fallidos la app espera 30 segundos.",
          "El botón «Cerrar sesión» deja la app en la pantalla de acceso sin borrar nada: el progreso y el PIN siguen guardados en el equipo."
        ]
      },
      {
        t: "Almacenamiento local, cookies y rastreo",
        p: [
          "La app usa el <strong>almacenamiento local del navegador</strong> (localStorage e IndexedDB) para guardar el perfil, el progreso, "
          + "las preferencias y los videos que se graban en Modo referente. Ese almacenamiento es del sitio, no de una empresa, y no se "
          + "comparte con nadie.",
          "<strong>No usa cookies de publicidad ni de seguimiento</strong>, no incluye píxeles de redes sociales, no usa Google Analytics ni "
          + "ningún servicio equivalente, y no hay ningún código de terceros que mida el uso.",
          "Para borrarlo todo: Ajustes → Eliminar este perfil. Para borrarlo por completo, también se pueden borrar los datos del sitio desde "
          + "la configuración del navegador."
        ]
      },
      {
        t: "Permisos que pide la app",
        tabla: {
          cab: ["Permiso", "Cuándo se pide", "Para qué", "Si se rechaza"],
          filas: [
            ["Cámara", "Al abrir práctica con cámara, prueba de cámara, entrenamiento o Modo referente", "Detectar la mano o grabar una seña en Modo referente", "La app sigue funcionando con autoevaluación"],
            ["Almacenamiento persistente", "Una vez, al abrir la app", "Que el navegador no borre el progreso para liberar espacio", "El progreso igual se guarda, pero puede borrarse si falta espacio"],
            ["Vibración", "Solo si está activada en Ajustes", "Avisar sin sonido", "No pasa nada"],
            ["Micrófono y ubicación", "Nunca", "No se usan", "—"],
            ["Notificaciones", "Nunca", "No se usan", "—"]
          ]
        }
      },
      {
        t: "Qué no hace la app",
        l: [
          "No vende, alquila ni cede datos a terceros.",
          "No muestra publicidad ni promociones.",
          "No envía datos de las personas a ningún servidor propio, porque no tiene.",
          "No usa servicios de inteligencia artificial en la nube: el reconocimiento de manos corre dentro del dispositivo.",
          "No crea perfiles publicitarios ni puntúa a las personas.",
          "No pide edad, DNI, correo, teléfono ni contactos."
        ]
      },
      {
        t: "La cámara",
        p: [
          "La cámara se usa únicamente cuando la persona entra a una pantalla que la necesita (práctica con cámara, prueba de cámara, "
          + "entrenamiento o modo referente). El navegador pide permiso y ese permiso se puede rechazar o quitar en cualquier momento.",
          "Las imágenes de la cámara <strong>no se graban, no se guardan y no se envían</strong>. En la práctica y en el entrenamiento, "
          + "cada cuadro se analiza en la memoria del dispositivo para detectar la posición de la mano y se descarta al instante. "
          + "No hay video de la persona usuaria en ningún lado.",
          "<strong>La app no analiza el rostro ni la cara.</strong> La detección es solo de las manos: no hay reconocimiento facial, "
          + "ni estimación de edad, género o emociones. Por eso la expresión de la cara se explica con palabras en la sección "
          + "«La cara también habla», y la evalúa una persona (docente o referente sordo), no la app.",
          "En el <strong>Modo referente</strong>, la persona que graba una seña sí genera un archivo de video, pero queda "
          + "en ese dispositivo hasta que el equipo decida publicarlo, y solo si firmó la autorización de uso de imagen."
        ]
      },
      {
        t: "Los videos de las señas y las personas que las graban",
        p: [
          "Los videos publicados en la app son de personas sordas reales que <strong>firmaron una autorización de uso de imagen y voz</strong> "
          + "antes de grabar. La autorización explica para qué se usan, dónde se publican, qué no se hace con ellos y cómo revocarla.",
          "Por defecto, el nombre de la persona que hace la seña aparece junto al video («Seña grabada por …»), igual que el de quien "
          + "la validó. La persona puede pedir que <strong>no aparezca su nombre</strong>."
        ],
        lista2: [
          "<strong>No se usan con fines comerciales, políticos ni religiosos.</strong>",
          "<strong>No se venden ni se ceden</strong> a terceros ajenos al proyecto.",
          "<strong>No se usan para crear avatares</strong> ni personajes virtuales que señen.",
          "<strong>Se puede revocar</strong> en cualquier momento: los videos se retiran de la app en un máximo de 15 días hábiles y "
          + "se borran de los respaldos en 30 días corridos.",
          "Los videos originales se guardan en un respaldo cerrado del proyecto y no se publican en ningún otro lado."
        ]
      },
      {
        t: "Menores de edad",
        p: ["Si una persona menor de 18 años aparece en un video, la autorización la firma la madre, el padre o quien ejerce la "
          + "responsabilidad parental, y además firma la persona menor si tiene 16 o 17 años. Para usar la app no se pide ningún dato "
          + "de edad ni de identidad."]
      },
      {
        t: "Alojamiento y proveedores",
        p: [
          "La app se publica como sitio estático en <strong>Vercel</strong> y su código está en <strong>GitHub</strong>. Como cualquier "
          + "sitio web, esos proveedores registran datos técnicos de las visitas (dirección IP, tipo de navegador, fecha y hora) para "
          + "seguridad y funcionamiento, según sus propias políticas. <strong>La app no les envía ningún dato de las personas</strong>: "
          + "no hay formularios, ni cuentas, ni envío de información.",
          "La inteligencia artificial de la cámara (MediaPipe) está <strong>incluida dentro de la app</strong>: se descarga una vez y "
          + "funciona sin internet. No consulta servicios externos.",
          "<strong>Transferencias internacionales:</strong> los servidores de Vercel y GitHub están fuera de la Argentina. Lo único que "
          + "llega hasta ellos son los archivos del sitio y los registros técnicos de la visita; <strong>ningún dato de las personas "
          + "usuarias</strong> se aloja allí. No hay bases de datos ni formularios que enviar."
        ]
      },
      {
        t: "Seguridad",
        p: ["El sitio se sirve por HTTPS. No hay base de datos con datos personales que pueda filtrarse, porque el proyecto no guarda "
          + "datos personales en servidores propios. El riesgo principal no es técnico sino humano: por eso las autorizaciones se firman "
          + "en papel, se guardan en la Municipalidad y los videos se publican solo después de la validación de otra persona sorda."]
      },
      {
        t: "Tus derechos (Ley 25.326)",
        p: ["Cualquier persona puede ejercer los derechos de <strong>acceso, rectificación, actualización, supresión y oposición</strong> "
          + "sobre sus datos, en forma gratuita, escribiendo a la Dirección de Innovación. Si no obtiene respuesta en el plazo legal, "
          + "puede presentarse ante la Agencia de Acceso a la Información Pública (AAIP).",
          "Como la app no guarda datos en servidores, el borrado de los datos de uso se hace desde la propia app "
          + "(Ajustes → Eliminar perfil), o borrando los datos del sitio en el navegador. Para los videos publicados, la vía es la "
          + "revocación de la autorización."]
      },
      {
        t: "Cuánto tiempo se guarda",
        l: [
          "Los datos de uso (progreso, perfil): hasta que la persona los borre. No tienen vencimiento automático.",
          "Las autorizaciones firmadas: mientras estén vigentes y hasta 5 años después del último uso del video, como respaldo legal.",
          "Los videos publicados: mientras la autorización esté vigente. Si se revoca, se retiran en 15 días hábiles."
        ]
      },
      {
        t: "Cómo se armó este documento",
        p: [
          "La estructura sigue el <strong>modelo de aviso por capas</strong> que recomiendan la Agencia de Acceso a la Información Pública y "
          + "las guías de protección de datos para aplicaciones móviles: primero un resumen en cinco puntos, después el detalle por tema.",
          "Se revisaron además las políticas de aplicaciones del mismo rubro (aprendizaje de idiomas y de lengua de señas), y se adoptaron "
          + "los temas que esas políticas tratan siempre y que faltaban acá: <strong>permisos del dispositivo</strong>, "
          + "<strong>almacenamiento local y cookies</strong>, <strong>transferencias internacionales</strong>, "
          + "<strong>menores de edad</strong> y <strong>cómo ejercer los derechos</strong>. En todos los casos el texto es propio y describe "
          + "lo que esta app hace de verdad; no se copió texto de ninguna otra aplicación."
        ]
      },
      {
        t: "Cambios en esta política",
        p: ["Si la app cambia y empieza a guardar o transmitir algo distinto, esta política se actualiza y se publica con la fecha de la "
          + "nueva versión. La versión vigente siempre está en la app: Perfil → Acerca de → Política de privacidad."]
      },
      {
        t: "Marco legal",
        l: [
          "<strong>Ley 25.326</strong> de Protección de los Datos Personales.",
          "<strong>Ley 27.710</strong>, que reconoce la Lengua de Señas Argentina y el derecho de las personas sordas a usarla.",
          "<strong>Ley 26.653</strong> de accesibilidad de la información (WCAG 2.0 AA).",
          "<strong>Ley 26.061</strong> de Protección Integral de los Derechos de las Niñas, Niños y Adolescentes.",
          "<strong>Ley 25.506</strong> de firma digital, para las autorizaciones firmadas."
        ]
      }
    ]
  };
})(window.App);
