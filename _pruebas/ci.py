# -*- coding: utf-8 -*-
"""
Prueba integral de ConectaLSA para GitHub Actions (y para correr a mano).
Falla (código de salida 1) si algo se rompe, así GitHub frena el cambio antes de publicarlo.

Uso:  python -m http.server 8080   (en la carpeta de la app, en otra terminal)
      python _pruebas/ci.py         (opcional: CONECTALSA_URL=http://localhost:8080/)
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("CONECTALSA_URL", "http://localhost:8080/")
RUTAS = ["#/niveles", "#/nivel/vocales", "#/nivel/saludos2", "#/diccionario", "#/diccionario/colores", "#/sena/buen-dia", "#/sena/letra-ñ",
         "#/consejos", "#/practica", "#/repaso", "#/deletreo", "#/camara", "#/perfil", "#/perfiles", "#/progreso", "#/ajustes", "#/acerca",
         "#/referente", "#/grabar/hola", "#/entrenar", "#/practicar/rojo", "#/leccion/colores/desafio", "#/bienvenida", "#/ruta-inexistente"]
fallas = []

def check(ok, que):
    print(("  ✔ " if ok else "  ✘ ") + que)
    if not ok: fallas.append(que)

async def nuevo_perfil(pg, nombre="Prueba"):
    await pg.goto(BASE); await pg.wait_for_timeout(700)
    await pg.fill("[data-name]", nombre); await pg.click("form [type=submit]"); await pg.wait_for_timeout(400)

async def ir(pg, ruta, espera=350):
    await pg.goto("about:blank"); await pg.goto(BASE + ruta); await pg.wait_for_timeout(espera)

async def hacer_leccion(pg, nivel, leccion):
    await ir(pg, "#/leccion/%s/%s" % (nivel, leccion), 300)
    for _ in range(140):
        if await pg.locator(".celebrate").count(): return True
        if await pg.locator("[data-v=ok]").count(): await pg.click("[data-v=ok]")
        elif await pg.locator("[data-nextl]").count(): await pg.click("[data-nextl]")
        elif await pg.locator(".option:not([disabled])").count(): await pg.locator(".option").first.click(); await pg.click("[data-next]")
        elif await pg.locator("#wr").count() and await pg.locator("[data-next][disabled]").count():
            for _ in range(2): await pg.fill("#wr", "zzz"); await pg.press("#wr", "Enter")
        else: await pg.click("[data-next]")
        await pg.wait_for_timeout(50)
    return False

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs = []
        def vigilar(pg):
            pg.on("pageerror", lambda e: errs.append("Error de página: " + str(e)))
            pg.on("console", lambda m: errs.append("Consola: " + m.text) if m.type == "error" else None)
            pg.on("response", lambda r: errs.append("404: " + r.url) if r.status == 404 else None)

        # ---------- 1. Pantallas ----------
        print("1) Pantallas")
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pg = await ctx.new_page(); vigilar(pg)
        await pg.goto(BASE); await pg.wait_for_timeout(700)
        check(await pg.evaluate("location.hash") == "#/bienvenida", "La primera vez abre la bienvenida")
        await pg.fill("[data-name]", "Prueba"); await pg.click("form [type=submit]"); await pg.wait_for_timeout(400)
        check(await pg.evaluate("location.hash") == "#/niveles", "Después de la bienvenida va al inicio")
        malas = []
        for r in RUTAS:
            await ir(pg, r)
            if "Ocurrió un error" in await pg.evaluate("document.querySelector('main').innerText"): malas.append(r)
        check(not malas, "Las %d pantallas abren sin error %s" % (len(RUTAS), malas or ""))

        # ---------- 2. Todas las lecciones y desafíos ----------
        print("2) Lecciones y desafíos (sin videos)")
        lecciones = await pg.evaluate("App.CONTENT.LEVELS.flatMap(l=>l.lessons.map(x=>[l.id,x.id]))")
        no_terminan = [("%s/%s" % (lv, ls)) for lv, ls in lecciones if not await hacer_leccion(pg, lv, ls)]
        check(not no_terminan, "Las %d lecciones y desafíos se pueden terminar %s" % (len(lecciones), no_terminan or ""))
        check(await pg.evaluate("App.totalStars()") > 0, "Se guardan estrellas y progreso")

        # ---------- 3. Contenido ----------
        print("3) Contenido")
        n = await pg.evaluate("Object.keys(App.CONTENT.ITEMS).length")
        check(n == 73, "Hay 73 señas (hay %d)" % n)
        rotos = await pg.evaluate("App.CONTENT.LEVELS.flatMap(l=>l.items.filter(id=>!App.CONTENT.ITEMS[id]).map(id=>l.id+':'+id))")
        check(not rotos, "Todos los niveles apuntan a señas existentes %s" % (rotos or ""))
        sin_archivo = await pg.evaluate("""Promise.all(Object.entries(App.CONTENT.MEDIA).map(([id,m])=>fetch(m.src,{method:'HEAD'}).then(r=>r.ok?null:id).catch(()=>id))).then(a=>a.filter(Boolean))""")
        check(not sin_archivo, "Cada video declarado en C.MEDIA existe en media/senas/ %s" % (sin_archivo or ""))

        # ---------- 4. Corrección tolerante ----------
        print("4) Corrección de escritura")
        casos = await pg.evaluate("""[['  BUEN DIA ','buen-dia',true],['como estas','como-estas',true],['ñ','letra-ñ',true],['n','letra-ñ',false],['rojos','rojo',false]]
            .map(([t,id,esp])=>[t,App.answerOk(t,App.CONTENT.ITEMS[id])===esp])""")
        check(all(ok for _, ok in casos), "Mayúsculas, tildes y espacios no cuentan; la Ñ se respeta %s" % [t for t, ok in casos if not ok])
        casos = await pg.evaluate("""[['miercole','miercoles',true],['domngo','domingo',true],['rpjo','rojo',false]].map(([t,id,esp])=>[t,!!App.nearMiss(t,App.CONTENT.ITEMS[id])===esp])""")
        check(all(ok for _, ok in casos), "Un error de tipeo se acepta solo en palabras largas %s" % [t for t, ok in casos if not ok])

        # ---------- 5. Aviso de versión de prueba ----------
        print("5) Aviso «Versión de prueba»")
        aviso = "(document.querySelector('.beta-note')||{innerText:''}).innerText"
        st = await pg.evaluate("App.Media.status()")
        await ir(pg, "#/niveles")
        txt = await pg.evaluate(aviso)
        if st["complete"]:
            check(txt == "", "Con todas las señas validadas, el aviso no aparece")
        else:
            check(("%d de 73" % st["videos"]) in txt, "El inicio muestra el aviso con la cuenta real (%d de 73)" % st["videos"])
            await ir(pg, "#/leccion/vocales/desafio", 400)
            check("Versión de prueba" in await pg.evaluate(aviso), "El desafío muestra el aviso")
        await pg.evaluate("""Promise.all(Object.keys(App.CONTENT.ITEMS).map(id=>App.Media.put(id,new Blob(['x'],{type:'video/webm'}),'A').then(()=>App.Media.validate(id,'B'))))""")
        await ir(pg, "#/niveles", 500)
        check(await pg.evaluate(aviso) == "", "El aviso desaparece solo cuando están las 73 señas validadas")
        await ctx.close()

        # ---------- 6. Sin conexión (service worker activo) ----------
        print("6) Funcionamiento sin conexión")
        ctx = await b.new_context(viewport={"width": 390, "height": 844})
        pg = await ctx.new_page(); vigilar(pg)
        await nuevo_perfil(pg, "Offline")
        await pg.evaluate("navigator.serviceWorker.ready"); await pg.wait_for_timeout(3000)
        info = await pg.evaluate("caches.keys().then(async k=>k.length?[k[0],(await (await caches.open(k[0])).keys()).length]:['',0])")
        version = await pg.evaluate("fetch('sw.js').then(r=>r.text()).then(t=>(t.match(/VERSION = \"([^\"]+)\"/)||[])[1])")
        check(info[0] == version and info[1] >= 25, "El service worker guarda la app (%s, %d archivos)" % (info[0], info[1]))
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1200)
        check("Seguimos aprendiendo" in await pg.evaluate("document.querySelector('main').innerText"), "Abre sin internet")
        await ctx.close()

        # ---------- 7. Errores ----------
        print("7) Errores de consola y archivos faltantes")
        check(not errs, "Sin errores ni archivos faltantes %s" % (errs[:5] or ""))
        await b.close()

    print("\n" + ("✅ TODO BIEN" if not fallas else "❌ FALLARON %d PRUEBAS:\n- " % len(fallas) + "\n- ".join(fallas)))
    sys.exit(1 if fallas else 0)

asyncio.run(main())
