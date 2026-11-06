# ConectaLSA

App para aprender **Lengua de Señas Argentina (LSA)**, con código y contenidos propios. Toma como modelo las funciones de ComuSeñas y corrige los problemas que encontramos en su análisis (reseñas e ingeniería inversa).

Dirección de Innovación · Municipalidad de San Salvador de Jujuy · Punto Digital Jorge Cafrune.

## Cómo abrirla

| Situación | Qué hacer |
|---|---|
| Windows | Doble clic en `iniciar-windows.bat` (necesita Python instalado). |
| Linux / Mac | `./iniciar-linux-mac.sh` |
| Publicarla | Subí la carpeta a cualquier hosting estático con **https** (GitHub Pages, Netlify, servidor municipal). |

Si abrís `index.html` con doble clic, la app funciona pero **la cámara no**: los navegadores solo permiten la cámara en `https` o `localhost`. Una vez abierta queda instalada y **funciona sin internet**.

## Qué hace (funciones de ComuSeñas, mejoradas)

| Función | En ConectaLSA |
|---|---|
| Perfil con avatar | Varios perfiles por equipo («¿Quién aprende hoy?»). Hay 12 avatares que se desbloquean con estrellas. Se elige la mano dominante (zurdos/as: videos en espejo) y una meta diaria. |
| Mapa de niveles | 10 niveles: Vocales, Colores, Días, Saludos 1, Consonantes (4 bloques), Meses y Saludos 2. Son 74 señas (73 del plan + la LL, que se sumó como seña aparte). **Todos abiertos**, con un orden sugerido. |
| Lecciones | 2–3 lecciones por nivel y un **desafío** que mezcla todo. Se ganan de 1 a 3 estrellas y se puede repetir para mejorar. |
| Observar la seña | Video sin deformar, en velocidad normal, lenta o muy lenta, con repetir, pausa y espejo. **Créditos**: quién hace la seña y quién la validó. |
| «¿Cómo se escribe?» | La corrección es **tolerante**: no importan mayúsculas, tildes, signos ni un error de tipeo en palabras largas. Siempre se muestra la forma correcta. Hay pista. |
| Práctica con cámara (IA) | Muestra el **% de parecido** y consejos concretos («estirá el índice»). Si la cámara no reconoce la seña, siempre se puede **autoevaluar** y seguir: nunca te bloquea. |
| Juegos de repaso | «¿Cuál es?» (video → opciones), tarjetas de memoria, deletreo. |
| Puntos y recompensas | Estrellas, puntos, racha, meta diaria, 12 medallas y avatares. |
| Consejos | 5 consejos: partes de la seña, espacio, cara, mano dominante, cámara. |
| Diccionario | Buscador tolerante, filtro por nivel, estado de cada seña y «Practicar esta seña». |
| Progreso para familias y docentes | Panel con todos los perfiles, % por nivel, señas para reforzar, planilla CSV e impresión. |

## Problemas detectados en ComuSeñas → cómo se resuelven

| Problema (reseñas) | Solución |
|---|---|
| La IA rechaza señas bien hechas | El clasificador se calibra con ejemplos de **varias personas**. Cada seña tiene su **propio umbral** (percentil 90 de las distancias entre personas distintas × 1,1). Se miden el **falso rechazo** y la **falsa aceptación** (metas ≤ 10%) dejando una persona afuera, también al calcular el umbral. Hay botón «Marcar como lograda». |
| No explica el error | Muestra el % de parecido, las 3 señas más cercanas y consejos sobre los dedos y la orientación. |
| Cuesta encuadrarse | Pantalla «¿Cómo te ve la cámara?» con chequeo de luz, distancia y encuadre. |
| Videos de mala calidad | Videos sin estirar, con velocidad, espejo y créditos. Hay guía para grabarlos y validación por una segunda persona. |
| Niveles bloqueados | Todos los niveles están abiertos. |
| Se pierde el progreso | Se guarda en cada acción y en almacenamiento persistente. Hay **copia de seguridad** en archivo. |
| Ajustes que no funcionan | Todos se aplican al instante: letra, contraste, tema, animaciones, sonido, vibración, espejo, velocidad y cámara. |
| Se guardan grabaciones | **La cámara del alumno nunca graba.** Solo se graba en el *Modo referente*, con consentimiento. |
| Escritura mal corregida | Comparación tolerante (ver arriba). |

## Modo referente (Perfil → Modo referente)

Es para **personas sordas referentes** y docentes de LSA. Tiene PIN opcional.

1. Escribir el nombre (aparece en los créditos).
2. Grabar cada seña (cuenta regresiva, hasta 6 s, revisar antes de guardar) o subir un archivo.
3. **Otra** persona referente entra con su nombre y toca «Validar».
4. **Exportar paquete** e importarlo en los otros equipos.
5. **Enseñarle señas a la cámara**: 30 ejemplos por persona y por seña, con al menos 3 personas. Después, «Medir precisión» y «Exportar modelo» para cargarlo en los demás equipos.

Para fijar videos en la app, poné los archivos en `media/senas/` y declaralos en `C.MEDIA` (`js/content.js`):
`C.MEDIA = { "hola": { src: "media/senas/hola.mp4", signer: "…", validatedBy: "…" } };`

## Estructura

```
index.html · sw.js (offline) · manifest.webmanifest
css/app.css
js/core.js         estado, perfiles, puntos, repaso espaciado, ajustes, utilidades
js/content.js      niveles, lecciones, 74 señas, consejos
js/media.js        videos (IndexedDB + archivos), reproductor, paquetes
js/vision.js       cámara + MediaPipe Hand Landmarker + clasificador k-NN
js/views-learn.js  niveles, lección, repaso, diccionario, consejos, deletreo
js/views-profile.js bienvenida, perfiles, perfil, panel de progreso, ajustes, acerca
js/views-ai.js     prueba de cámara, entrenar la cámara, deletreo libre
js/views-ref.js    modo referente: grabar, validar, compartir
js/main.js         navegación
icons/            logo y juego completo de íconos (logo.svg, icon-192/512, maskable)
vendor/mediapipe/  IA local (Apache 2.0) · fonts/ Atkinson Hyperlegible (OFL)
```

Al publicar cambios, subí `VERSION` en `sw.js`.

## Identidad visual (v1.0.5)

- **Logo:** mano en «te quiero» (🤟) dibujada en trazo, azul `#02669A`. Está vectorizada en
  `icons/logo.svg` (azul) y `icons/logo-blanco.svg` (blanca, para los fondos azules).
  Los íconos de la app (`icon-192`, `icon-512`, `icon-maskable-512`) son la mano blanca
  sobre un degradé azul. Se generan con `herramientas/build_icons.py`.
- **Paleta:** acento `#1553C4`, degradé de marca `#0A3F94 → #1A5FD0 → #12A3E3`, fondo
  `#F0F5FC`, texto `#0B1B33`, secundario `#4C5D78`, sol `#FFC23D` (solo para logros).
- **Modo oscuro:** fondo `#0A1322`, acento `#7FB2FF`.
- Todo el texto cumple **WCAG 2.0 AA** (contraste ≥ 4,5:1), también en modo oscuro. El modo
  alto contraste sigue disponible en Ajustes.
- La tipografía es la misma: **Atkinson Hyperlegible**.

## Pendiente (trabajo humano)

- Acordar con la asociación de personas sordas de Jujuy la grabación y validación de las 73 señas (Ley 27.710, art. 3).
- Hacer una sesión de entrenamiento de la cámara con al menos 10 personas, medir falso rechazo y falsa aceptación (≤ 10% cada uno, también seña por seña) y recién ahí publicar el modelo.
- Hacer un piloto con 5 a 10 personas (sordas y oyentes) antes del evento.

## Versión de prueba (aviso automático)

Mientras falten videos validados, la app muestra el aviso **«🚧 Versión de prueba»** con la cuenta real («Por ahora hay 0 de 74 señas con video»):

- en la bienvenida y en el inicio;
- al empezar cada desafío, con la cuenta de ese nivel.

No hay que acordarse de quitarlo: el aviso de cada desafío desaparece cuando su nivel tiene todos los videos validados, y el general cuando están las 74 señas.

## Publicar los videos para todo el público

Un video grabado desde **Modo referente** queda guardado **solo en ese equipo** (sirve para grabar, revisar y validar). Para que lo vea cualquier persona que abra la app publicada:

1. Guardá cada video validado como `media/senas/<id>.mp4` (el `id` aparece en la dirección de la seña, por ejemplo `#/sena/buen-dia` → `buen-dia.mp4`).
2. Declaralo en `js/content.js`, en `C.MEDIA`:
   `C.MEDIA["buen-dia"] = { src: "media/senas/buen-dia.mp4", signer: "Nombre de quien señó", validatedBy: "Nombre de quien validó" };`
3. Subí `VERSION` en `sw.js` y volvé a subir la carpeta.


## Novedades de la versión 1.1

1. **Acceso con perfiles y PIN local.** Cada vez que se abre, la app pregunta «Hola, ¿quién sos?» antes de mostrar nada. Cada perfil puede tener un PIN de 4 números (Ajustes → «Pedir un PIN al entrar»). El PIN se guarda como resumen (hash de 4.000 vueltas) en el propio dispositivo: no es una cuenta, no viaja a internet y no se puede recuperar. «Cerrar sesión» deja la app en la pantalla de acceso sin borrar nada.
2. **Cinco perfiles visuales por discapacidad** (Ajustes → Perfil visual): Estándar, Oscuro, Alto contraste, Daltonismo (paleta Okabe-Ito, sin depender del rojo/verde) y Calma (tonos suaves, sin halos ni movimiento, para autismo y TDAH). Se aplican al instante y se recuerdan en el dispositivo.
3. **Íconos propios.** Se reemplazaron los emojis del sistema por un set dibujado a medida en `js/iconos.js` (trazo de 24×24, hereda el color del texto). Los avatares de animales se mantienen como stickers de identidad.
4. **Política de privacidad 2.0.** 17 secciones: acceso y PIN, almacenamiento local y cookies, permisos del dispositivo, «qué no hace la app», transferencias internacionales, menores, derechos (Ley 25.326) y método. Misma fuente para la pantalla y el PDF.

Archivos nuevos: `js/iconos.js` y `js/views-acceso.js`. Si actualizás, subí también `index.html` y `sw.js` (la versión del caché pasó a `conectalsa-v1.1.1`).

## Novedades de la versión 1.1.1 (29/10/2026)

1. **El acceso es la primera pantalla, siempre.** Al abrir la app (o recargarla) aparece «Hola, ¿quién sos?» con los perfiles del equipo, aunque el perfil no tenga números secretos. Si alguien entraba a un enlace directo (por ejemplo, un consejo), después de elegir el perfil la app lo lleva a esa pantalla. Dentro de la app no se vuelve a preguntar.
2. **Textos más amables para chicos y adolescentes.** «Soy yo» en vez de «Entrar», «números secretos» en vez de «PIN», «Me olvidé los números», «¡Hasta la próxima!». El PIN técnico sigue igual por dentro (hash de 4.000 vueltas, sin servidor).
3. **Arreglado el tamaño de letra de Ajustes.** El control A / A+ / A++ no hacía nada: los botones estaban dibujados sin el controlador. Ahora A+ deja el texto al 115 % y A++ al 130 % (todo el texto, no solo una parte), se marca cuál está elegido y se recuerda al volver a abrir. La prueba automática lo controla.
4. **Los consejos tienen lugar para una imagen.** «Para señar mejor» queda listo para recibir una imagen por consejo (1200 × 900 px, JPG, `img/consejos/<id>.jpg`). Mientras los archivos no estén, cada consejo se ve completo y prolijo, sin íconos de imagen rota. La guía para producirlas está en `publicar/Guia_imagenes_consejos_ConectaLSA.pdf`.

Archivos tocados: `js/core.js`, `js/main.js`, `js/views-acceso.js`, `js/views-profile.js`, `js/views-learn.js`, `js/content.js`, `css/app.css`, `sw.js` y `README.md`.

## Novedades de la versión 1.1.2 (30/10/2026)

1. **Las cinco imágenes de los consejos, adentro de la app.** «Para señar mejor» ya muestra una ilustración por consejo. Se guardan en `img/consejos/` a 1200 × 900 px y también quedan en la copia sin conexión.
2. **Grabar los videos: primero el archivo, después la app.** En el modo referente, al terminar una toma aparecen dos botones en orden: **1. Guardar el archivo** (lo baja a la carpeta Descargas de la compu, con el nombre de la seña y de quien señó) y **2. Cargar en la app** (lo guarda en este navegador para poder validarlo y verlo). Si el navegador se limpia, el archivo sigue en Descargas.
3. **Elegir cámara al grabar.** El grabador lista las cámaras del equipo (frontal, trasera del celular, webcam externa) con botones para cambiar sin mover la compu. La imagen se muestra en espejo solo con la cámara frontal; con la trasera o una webcam se ve igual que va a quedar grabada.
4. **Todos los videos en un ZIP.** En el panel del referente, «Descargar todos los videos (ZIP)» baja un solo archivo con cada video (`<id>.webm` o `.mp4`) y un `CREDITOS.txt` con quién señaló y quién validó cada uno.
5. **Deletreo automático más firme.** La cámara avanza sola cuando la letra se sostiene 600 ms, con un aviso en pantalla («¡Es la S, sostenela…»). Si la cámara todavía no conoce esa letra, lo dice y ofrece un enlace directo para enseñársela.

## Novedades de la versión 1.4.7 (6/11/2026)

- **Todos los videos se ven en 4:3, sin franjas negras.** El recuadro ya era 4:3, pero el video entraba entero (16:9) y quedaban dos franjas oscuras arriba y abajo. Ahora el video **llena el recuadro y se recortan los costados** (`object-fit: cover`, 12,5 % de cada lado). Se revisaron los 75 videos: en ninguno la mano o el cuerpo quedan cortados.
- **El nombre del video, al lado del video.** Cada recuadro lleva su etiqueta pegada arriba: **A**, **VERDE**, **ENERO**, **BUEN DÍA**, en mayúsculas y en azul, con el nivel al lado («Vocales», «Colores», «Meses del año»). Lo pidió el equipo sordo en la reunión de prueba: los chicos saben qué están mirando sin buscarlo en el título de la página. Se oculta en los ejercicios donde el nombre es la respuesta (deletreo, adivinanza).
- **Al grabar, la app marca qué parte se va a ver.** En la pantalla de grabación hay dos líneas punteadas: lo que queda entre ellas es exactamente lo que se ve en la app. Así las próximas grabaciones (frases con señas) ya salen bien encuadradas.

## Novedades de la versión 1.4.6 (6/11/2026)

- **El entrenamiento muestra el video de la seña elegida, ahí mismo.** Debajo de la cámara (y arriba, en el celular) aparece un recuadro con el video de esa seña y el texto «Así se hace». Antes había que ir hasta el diccionario, mirar la seña y volver: ahora se mira y se hace en la misma pantalla. El video cambia solo al elegir otra seña en la lista.
- **El enlace directo acepta nivel y seña** (`#/entrenar/dias/lunes`); antes solo entendía `#/entrenar/<seña>` y podía abrir el entrenamiento en la letra A.

## Novedades de la versión 1.4.5 (6/11/2026)

- **Con una sola seña entrenada la cámara ya evalúa.** Antes la práctica esperaba que hubiera dos señas aprendidas para mostrar el porcentaje y las pistas; ahora alcanza con la seña que se está practicando. Es el arreglo más importante de esta versión: el chico practicaba a ciegas aunque la seña ya estuviera enseñada.
- **Desde la práctica se puede enseñar la seña ahí mismo.** Cuando la cámara todavía no conoce una seña, el aviso ofrece el enlace **«Enseñarle esta seña a la cámara»**, que abre el entrenamiento con esa seña ya elegida (sirve desde las lecciones, desde la ficha de cada seña y desde el deletreo).
- **El entrenamiento dice claramente que no se usan fotos.** Un recuadro nuevo explica que la cámara mira la mano en vivo durante tres segundos y guarda solo la forma (21 puntos), y que una tanda de 30 ejemplos alcanza para que esa seña empiece a reconocerse.
- **La cuenta regresiva 3 · 2 · 1 se ve en grande sobre la cámara**, con el cartel «Mostrá la seña» y el «¡Ahora!» antes de capturar. Antes el número aparecía chico, dentro del botón.
- **Se corrigió un texto que se veía en una sola columna angosta** en la lista de la cámara («Esperando tu mano…», «Mostrá la mano…») y el aviso de la prueba suelta de cámara ya no pide dos señas.

## Novedades de la versión 1.4.4 (5/11/2026)

- **La misma persona que grabó puede revisar sus videos.** Se sacó el bloqueo que lo impedía. Cuando Alexis valida una seña que grabó él, la app lo anota como **«revisión propia»** y así se muestra en el crédito del video y en la lista del panel.
- **Si después aparece otra persona sorda, puede hacer la «segunda mirada»**: al abrir una seña revisada por quien la grabó, aparece el botón verde **«Hacer la segunda mirada»** y su nombre pasa a reemplazar al anterior. El crédito queda como «Seña: Alexis Joel Gonzalez · Validó: María Sorda».
- Los nombres se comparan **sin importar acentos, mayúsculas ni un segundo nombre de más** («Alexis Gonzalez» reconoce a «Alexis Joel Gonzalez»).
- En la presentación, el texto de confianza ahora cuenta esto tal cual: las señas las graban y las revisan personas sordas, y si la revisión la hace la misma persona que grabó, la app lo aclara.

## Novedades de la versión 1.4.3 (5/11/2026)

- **Ya están los créditos: los 75 videos dicen «Seña: Alexis Joel González»**, el nombre de quien los grabó. Se cargó en `C.MEDIA` de `js/content.js`.
- **El lugar para escribir el nombre de quien valida ahora se ve.** Es una tarjeta azul arriba de todo en el panel del referente: **«Paso 1 · ¿Quién valida los videos?»**, con el campo y el botón **«Guardar nombre»**. Antes el campo estaba en una columna angosta y pasaba desapercibido.
- Si alguien entra directo a una seña **sin haber escrito su nombre**, la app le pide el nombre ahí mismo, en la misma pantalla, sin mandarlo de vuelta al panel.

## Novedades de la versión 1.4.2 (5/11/2026)

- **Cualquier video se puede validar desde la app, sin grabar nada.** Antes el botón «Validar este video» aparecía solo con los videos cargados en ese equipo; los 75 que vienen con la app no se podían validar. Ahora se abre la seña, se mira el video y se toca el botón verde: la validación queda guardada en ese navegador y la seña pasa a mostrar «Validado por …».
- **Se pueden bajar las validaciones** desde el panel del referente («Descargar validaciones»): un archivo chiquito que se manda al equipo del Punto Digital para cargar todo al proyecto de una vez. En el panel hay un contador «Validaciones de este equipo: X de 75».
- **Cuenta regresiva al grabar: 3 · 2 · 1.** Después muestra «¡Ahora!» y empieza. Sirve para alcanzar a ponerse en el cuadro cuando el celular está apoyado lejos.
- En la presentación, el sello amarillo de la portada se cambió por una **tarjeta flotante** limpia con el tilde, «75 videos» y «grabados por personas sordas».

## Novedades de la versión 1.4.1 (5/11/2026)

- **La dirección del proyecto, sola, abre la presentación.** Quien entra a la app sin escribir nada después de la barra ve la **página de presentación** con el botón **«Entrar»** bien grande. Recién al tocar «Entrar» se elige el perfil. Es la misma puerta de entrada que se comparte con las escuelas y el municipio.
- La barra de arriba también dice **«Entrar»** en lugar de «Abrir la app», para que se entienda de una.
- Al abrir la app **instalada** desde el ícono se sigue yendo directo a elegir el perfil (no pasa por la presentación).

## Novedades de la versión 1.4.0 (4/11/2026)

- **Nueva pantalla de presentación: `#/presentacion`.** Una página para mostrar la app a las escuelas, al municipio o a quien pregunte qué es. Se abre **sin necesidad de crear un perfil**, tiene su propia barra con el botón «Abrir la app», cuenta sola las señas y los niveles, y las imágenes son **capturas reales de la app** (no hay ilustraciones ni señas inventadas).
- Se llega desde **Acerca de → Presentación**, o escribiendo `#/presentacion` al final de la dirección.
- Se suma al peso de la app: **≈ 1 MB** para empezar (antes 900 KB). Las capturas van guardadas para que la presentación también se vea sin internet.

## Novedades de la versión 1.3.1 (3/11/2026)

- **La app ahora pesa mucho menos al instalarse: menos de 1 MB.** Antes, al abrirla por primera vez, se descargaban **27 MB** de una sola vez (casi todo era la IA de la mano). Ahora eso **no** se descarga al instalar: la IA se baja **la primera vez que alguien abre la cámara** y desde ahí queda guardada. Quien solo mira las lecciones no la descarga nunca.
- Los videos tampoco se descargan todos juntos: cada uno se baja cuando se mira (≈ 450 KB).
- Peso real: **la app, 900 KB (≈ 1 MB con la presentación de la 1.4.0)** · **la IA, 26 MB (solo si se usa la cámara)** · **los 75 videos, 35 MB (de a uno)**.

## Novedades de la versión 1.3 (3/11/2026)

- **Ya están los 73 videos del plan, más la LL y la RR: 75 señas, las 75 con video.**
  - Se suman las **17 consonantes** que faltaban (B, C, D, F, G, N, Ñ, P, Q, R, S, T, V, W, X, Y, Z).
  - Se suman los **12 meses**.
  - **La RR** entra como seña aparte, igual que la LL (nivel 7, «R, S, LL, RR»). Las dos están **pendientes de validación por el referente sordo**.
- **Todos los videos están filmados, pero ninguno está validado todavía.** Por eso la app sigue mostrando el aviso «Versión de prueba» y cada video dice «Pendiente de validación».
- Falta cargar el **crédito** (quién señó cada video) para que deje de decir «Seña: —».

## Novedades de la versión 1.2 (3/11/2026)

- **Cortesía 2 completa: 8 de 8.** «Me llamo» se carga desde el archivo `yo-me-llamo.mp4` (el usuario lo había filmado con ese nombre; se cambió el nombre en la app, no el del archivo).
- **La LL se suma como seña aparte** (nivel 7, «Consonantes N a S»), con su video `ll.mp4`. No es parte del deletreo: la RAE la sacó como letra en 2010, pero muchas escuelas la siguen enseñando. **Pendiente de validación por el referente sordo.**
- Con esto son **45 videos de 74 señas**: vocales (5), colores (12), días (7), cortesía 1 (7), consonantes H a M (5), cortesía 2 (8) y la LL.
- El nivel 7 pasa a tener cuatro lecciones parejas: N, Ñ · P, Q · R, S · LL.

## Novedades de la versión 1.1.9 (3/11/2026)

- **Saludos y cortesía 2: 7 de los 8 videos** (falta «Me llamo»). Con todo lo anterior son **43 de las 73 señas** con video.
- Se agrega la hoja **Abecedario en orden** para saber qué archivo corresponde a cada letra.

## Novedades de la versión 1.1.8 (3/11/2026)

- **Saludos y cortesía 1 (7 videos)** y **consonantes H, J, K, L, M (5 videos)**. Con las vocales, los colores y los días, suman **36 de las 73 señas** con video.

## Novedades de la versión 1.1.7 (3/11/2026)

- **Los siete días de la semana ya tienen video.** Con las vocales y los colores son **24 de las 73 señas** con video.

## Novedades de la versión 1.1.6 (3/11/2026)

- **Los doce colores ya tienen video.** Se suman a las cinco vocales: son **17 de las 73 señas** con video (mientras no los revise otro referente sordo, figuran como «Pendiente de validación»).

## Novedades de la versión 1.1.5 (3/11/2026)

- **Zoom más amplio.** El zoom de la cámara ahora va de **0,5× a 3×** y arranca en 0,5×. A 0,5× se ve **todo el cuadro de la cámara**, sin recortar los costados: la mano y los puntos entran completos aunque la persona esté lejos. Con **+** se acerca (1× a 3×).
- **Botón «Activar cámara» siempre visible en el celular.** Antes quedaba abajo del recuadro y había que girar el teléfono. Ahora el botón va primero, el texto se achica en pantallas chicas y el recuadro se puede desplazar si no entra.

## Novedades de la versión 1.1.4 (2/11/2026)

- **Las primeras cinco señas con video.** Los videos de las vocales (A, E, I, O, U) ya están en `media/senas/` y la app los muestra en las lecciones. Mientras no los revise otro referente sordo, figuran como «Pendiente de validación».
- Los videos se achicaron antes de subirlos: 960 px de ancho, MP4 H.264, 5 segundos. Pesan entre 300 y 700 KB cada uno (antes, 15 a 20 MB).

## Novedades de la versión 1.1.3 (30/10/2026)

1. **Zoom en la cámara, para no tener que alejarse.** Las pantallas de práctica tienen ahora un control **− 1× +** que acerca la imagen (hasta 3×) recortando el centro y analizando ese recorte. Así la mano se ve bien de tamaño sin mover el celular, la tablet ni la compu. El zoom elegido se recuerda.
2. **Guía de encuadre.** Adentro del recuadro punteado aparece la silueta de una mano: si tu mano entra en esa silueta, la cámara la lee bien.
3. **Mejor resolución.** La cámara se pide en 960 × 720 (antes 640 × 480), lo que da más detalle a la detección de la mano sin cambiar el encuadre.
4. **«La cara también habla» (`#/cara`).** Lo pidió la comunidad sorda: como la app no analiza el rostro, la expresión se enseña con palabras. Hay cinco expresiones (tranquila, pregunta, afirmar, saludo e intensidad), cada una con cómo se ve, cuándo se usa y un ejemplo.
5. **Cada práctica recuerda la cara.** Al practicar una seña y al deletrear aparece una tarjeta con la expresión que corresponde (por ejemplo, «¿Cómo estás?» lleva cara de pregunta). En el deletreo la tarjeta cambia según la palabra.
6. **La política de privacidad lo dice explícitamente:** la app no analiza el rostro, no hace reconocimiento facial ni estima emociones.

Archivos tocados: `js/vision.js`, `js/views-learn.js`, `js/content.js`, `js/iconos.js`, `js/core.js`, `js/main.js`, `js/privacidad.js`, `css/app.css`, `sw.js` y `README.md`.

## Trabajo en equipo (GitHub + Vercel)

Ver **[TRABAJO_EN_EQUIPO.md](TRABAJO_EN_EQUIPO.md)**: configuración inicial, trabajo diario con ramas y pull requests, vistas previas para compartir por WhatsApp y pruebas automáticas.

| Archivo | Para qué |
|---|---|
| `vercel.json` | Permisos (cámara sí, micrófono no) y caché (`sw.js` nunca queda en caché) |
| `.vercelignore` | Lo que no se publica (pruebas, documentación, lanzadores) |
| `.gitignore` | Lo que nunca se sube a GitHub (`_test/`, `capturas/`) |
| `.github/workflows/pruebas.yml` | Pruebas automáticas en cada cambio |
| `_pruebas/ci.py` | La prueba integral: pantallas, 32 lecciones, contenido, escritura, aviso, sin conexión |
| `media/senas/` | Videos definitivos de las señas |

## Carpetas de prueba (no son parte de la app publicada)

- `_pruebas/`: scripts. `ci.py` es la prueba integral (la usa GitHub). `pruebas_app.py`, `todas_lecciones.py` y `aviso.py` son recorridos detallados. `capturas.py` genera las capturas. `experimento.py` y `umbral.py` reproducen el experimento del informe técnico v3 (necesitan las fotos de `_test/`).
- `_test/`: fotos de manos de bancos de imágenes, usadas **solo** para el experimento. **No se suben a GitHub** (`.gitignore`) porque no tienen licencia para redistribuirse.

- App publicada en: https://conectalsa.vercel.app
