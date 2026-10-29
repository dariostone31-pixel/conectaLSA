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
| Mapa de niveles | 10 niveles: Vocales, Colores, Días, Saludos 1, Consonantes (4 bloques), Meses y Saludos 2. Son 73 señas. **Todos abiertos**, con un orden sugerido. |
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
js/content.js      niveles, lecciones, 73 señas, consejos
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

Mientras falten videos validados, la app muestra el aviso **«🚧 Versión de prueba»** con la cuenta real («Por ahora hay 0 de 73 señas con video»):

- en la bienvenida y en el inicio;
- al empezar cada desafío, con la cuenta de ese nivel.

No hay que acordarse de quitarlo: el aviso de cada desafío desaparece cuando su nivel tiene todos los videos validados, y el general cuando están las 73 señas.

## Publicar los videos para todo el público

Un video grabado desde **Modo referente** queda guardado **solo en ese equipo** (sirve para grabar, revisar y validar). Para que lo vea cualquier persona que abra la app publicada:

1. Guardá cada video validado como `media/senas/<id>.mp4` (el `id` aparece en la dirección de la seña, por ejemplo `#/sena/buen-dia` → `buen-dia.mp4`).
2. Declaralo en `js/content.js`, en `C.MEDIA`:
   `C.MEDIA["buen-dia"] = { src: "media/senas/buen-dia.mp4", signer: "Nombre de quien señó", validatedBy: "Nombre de quien validó" };`
3. Subí `VERSION` en `sw.js` y volvé a subir la carpeta.

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
