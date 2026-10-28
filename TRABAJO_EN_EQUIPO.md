# Trabajo en equipo con GitHub y Vercel

**Cómo funciona:** el código vive en **GitHub**. Cada cambio se propone en un *pull request* y **GitHub prueba la app sola**. **Vercel publica una vista previa con su propio enlace**, que se comparte por WhatsApp para opinar desde el celular. Cuando el equipo aprueba, el cambio se une a `main` y Vercel lo publica en el enlace oficial en alrededor de un minuto.

```
rama nueva → cambios → pull request → ✔ pruebas automáticas
                                     → 🔗 vista previa en Vercel (por WhatsApp)
                                     → revisión → unir a main → 🌐 enlace oficial
```

---

## 1. Configuración inicial (una sola vez, la hace quien es dueño de las cuentas)

### 1.1 Crear el repositorio en GitHub

1. En github.com: **New repository**. Nombre: `conectalsa`.
2. Visibilidad: **Public**. Hay dos motivos:
   - En el plan gratuito de Vercel (Hobby), con un repositorio **privado** solo se publican los cambios del dueño de la cuenta; los de los compañeros quedan bloqueados. Con uno **público** esa restricción no aplica.
   - La app no tiene contraseñas ni datos personales, y el código abierto suma transparencia a un proyecto municipal.
3. **No** marques «Add a README» (la carpeta ya trae uno). Tocá **Create repository**.

### 1.2 Subir los archivos

**Opción recomendada: GitHub Desktop** (desktop.github.com, sin comandos)

1. *File → Clone repository* → elegí `conectalsa` → *Clone*.
2. Abrí la carpeta clonada (*Repository → Show in Explorer/Finder*) y copiá adentro **todo** el contenido de `ConectaLSA_repositorio.zip`.
   - Incluye archivos ocultos: `.github/`, `.gitignore` y `.vercelignore`. En Mac, para verlos: `Cmd + Shift + .`. En Windows: Explorador → Vista → *Elementos ocultos*.
3. En GitHub Desktop: escribí «Primera versión de ConectaLSA» → **Commit to main** → **Push origin**.

**Opción con terminal:**

```bash
cd carpeta-descomprimida
git init -b main
git add .
git commit -m "Primera versión de ConectaLSA"
git remote add origin https://github.com/TU-USUARIO/conectalsa.git
git push -u origin main
```

4. En GitHub, pestaña **Actions**: tiene que aparecer «Pruebas» en verde ✔ (tarda 3 a 5 minutos).

### 1.3 Conectar Vercel

1. En vercel.com: **Add New → Project → Import Git Repository**. Elegí `conectalsa`. Si no aparece, tocá *Adjust GitHub App Permissions* y dale acceso al repositorio.
2. Configuración:
   - **Framework Preset:** `Other`
   - **Build Command:** vacío (la app no necesita compilarse)
   - **Output Directory:** vacío
   - **Root Directory:** `./`
3. **Deploy**. En menos de un minuto tenés el enlace oficial, por ejemplo `https://conectalsa.vercel.app`. El nombre se cambia en *Settings → Domains*.
4. **Importante, para que las vistas previas se abran desde WhatsApp:** *Settings → Deployment Protection → Vercel Authentication*. Si está activada, quien no tenga cuenta de Vercel no puede abrir las vistas previas. Desactivala (o dejala solo para producción).
5. Si algún día un cambio no se publica: *Account Settings → Authentication* tiene que tener GitHub conectado, y el correo de git de quien sube el cambio tiene que coincidir con el de su cuenta de GitHub.

### 1.4 Sumar a las compañeras y compañeros

- En GitHub: *Settings → Collaborators → Add people*. **No necesitan cuenta de Vercel.**

### 1.5 Proteger `main` (recomendado)

En GitHub: *Settings → Branches → Add branch protection rule*, con el patrón `main`:

- ☑ *Require a pull request before merging*. Opcional: pedir 1 aprobación.
- ☑ *Require status checks to pass* → elegí **Probar la app**.

Así nadie puede publicar algo que rompa la app por accidente.

---

## 2. Trabajo diario (cualquier integrante)

1. **Rama nueva:** en GitHub Desktop, *Current branch → New branch*. Usá un nombre que diga qué vas a hacer: `colores-nuevos`, `logo`, `videos-vocales`.
2. **Hacé los cambios** (ver la tabla de abajo).
3. **Subí la versión** en `sw.js`, línea 4: `conectalsa-v1.0.3` → `conectalsa-v1.0.4`. Si te olvidás, las pruebas te avisan.
4. **Probá en tu compu:** `iniciar-windows.bat` (necesita Python) o `iniciar-linux-mac.sh`. Se abre en `http://localhost:8000`, donde la cámara también funciona.
5. **Commit** (mensaje en castellano que diga qué cambiaste) → **Push** → **Create Pull Request**.
6. En el pull request vas a ver:
   - **Pruebas** (3 a 5 minutos): ✔ verde o ✘ roja. Si es roja, tocá *Details*: dice qué se rompió, con archivo y línea.
   - **Vercel** comenta un enlace de **vista previa**. **Mandalo al grupo de WhatsApp** para que lo prueben en el celular.
7. Cuando alguien más lo revisa y aprueba: **Merge pull request**. En alrededor de un minuto queda en el enlace oficial.

### ¿Qué archivo toco para…?

| Quiero cambiar… | Archivo |
|---|---|
| Colores | Variables al principio de `css/app.css` (`--accent`, `--coral`, `--sun`, `--bg`…) para el tema claro, el oscuro y el alto contraste. También `theme_color` en `manifest.webmanifest`. |
| Logo e ícono de la app | `icons/` (SVG + PNG de 192 y 512 px + versión maskable de 512 px), `brand-mark` en `index.html` |
| Textos, señas, niveles, consejos | `js/content.js` |
| Íconos de niveles y consejos | Campo `ico` en `js/content.js` |
| Avatares | `App.AVATARS` en `js/core.js` |
| Videos de las señas | `media/senas/<id>.mp4` y `C.MEDIA` en `js/content.js` (ver README) |
| Cámara e IA | `js/vision.js`. **Solo personal técnico**, y siempre volviendo a medir la precisión |
| No tocar | `vendor/mediapipe/` |

---

## 3. Reglas del equipo

- **Nunca subir fotos o videos de personas sin su consentimiento escrito.** Los videos de las señas llevan el nombre de quien señó y de quien validó.
- **Nunca subir la carpeta `_test/`** (fotos de bancos de imágenes, sin licencia). `.gitignore` ya la excluye.
- **Nunca generar señas con IA ni dibujarlas:** las señas solo se aprenden con videos de referentes sordos.
- Videos en MP4 H.264, menos de 3 MB cada uno.
- Un pull request por tema (más fácil de revisar y de deshacer).
- Si algo se rompe en producción: en Vercel, *Deployments* → la versión anterior → **Promote to Production** (vuelve atrás en segundos).

## 4. Qué se publica y qué no

- **GitHub guarda todo**, salvo `_test/` y `capturas/`.
- **Vercel publica solo la app.** `.vercelignore` deja afuera `_pruebas/`, los `.md`, los lanzadores y la configuración de GitHub.
- `vercel.json` permite la **cámara** (no el micrófono, que la app no usa) y hace que `sw.js` nunca quede guardado en caché, para que las actualizaciones lleguen.

## 5. Pruebas automáticas (`_pruebas/ci.py`)

Corren en cada pull request y en cada cambio a `main`. Revisan:

- sintaxis de todos los archivos JavaScript, `manifest.webmanifest` y `vercel.json`;
- que se haya subido `VERSION` en `sw.js` si cambió algún archivo de la app;
- que las 24 pantallas abran sin error;
- que las **32 lecciones y desafíos** se puedan terminar;
- que haya 73 señas y que cada nivel apunte a señas existentes;
- que **cada video declarado en `C.MEDIA` exista** en `media/senas/`;
- la corrección tolerante de escritura;
- que el aviso «Versión de prueba» aparezca con la cuenta real y desaparezca cuando están las 73 señas;
- que la app funcione **sin conexión**;
- que no haya errores de consola ni archivos faltantes.

Para correrlas en tu compu: `python -m http.server 8080` en la carpeta de la app y, en otra terminal, `python _pruebas/ci.py` (requiere `pip install playwright` y `python -m playwright install chromium`).

---

### Nota sobre el plan de Vercel

El plan gratuito **Hobby** alcanza para desarrollar y probar en equipo con el repositorio público. Sus condiciones lo pensaron para proyectos personales y no comerciales. Para el **lanzamiento oficial institucional** conviene revisarlas con el área legal y evaluar Vercel Pro o el servidor de la Municipalidad. La app es estática, así que el mismo repositorio sirve para cualquiera de esas opciones.
