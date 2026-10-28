# -*- coding: utf-8 -*-
"""Prueba automática de ConectaLSA: bienvenida, todas las pantallas, lecciones completas y errores de consola.
Requiere el servidor en http://localhost:8080."""
import asyncio
from collections import Counter
from playwright.async_api import async_playwright

BASE = "http://localhost:8080/"
RUTAS = ["#/niveles", "#/nivel/vocales", "#/nivel/saludos2", "#/diccionario", "#/diccionario/colores", "#/sena/buen-dia", "#/sena/letra-ñ",
         "#/consejos", "#/practica", "#/repaso", "#/deletreo", "#/camara", "#/perfil", "#/perfiles", "#/progreso", "#/ajustes", "#/acerca",
         "#/referente", "#/grabar/hola", "#/entrenar", "#/practicar/rojo", "#/leccion/colores/desafio", "#/bienvenida", "#/ruta-inexistente"]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"])
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("ERROR DE PÁGINA " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLA " + m.text) if m.type == "error" else None)
        await pg.goto(BASE); await pg.wait_for_timeout(800)
        print("1) Al abrir por primera vez:", await pg.evaluate("location.hash"))
        await pg.fill("[data-name]", "Rocío"); await pg.click("[data-ava=owl]"); await pg.click("[data-goal='20']")
        await pg.click("form [type=submit]"); await pg.wait_for_timeout(400)
        print("   Después de la bienvenida:", await pg.evaluate("location.hash"), "·", await pg.evaluate("App.P().name+' · avatar '+App.P().avatar+' · meta '+App.P().goal"))

        print("2) Pantallas:")
        malas = 0
        for r in RUTAS:
            await pg.goto(BASE + r); await pg.wait_for_timeout(350)
            txt = await pg.evaluate("document.querySelector('main').innerText")
            bad = "Ocurrió un error" in txt; malas += bad
            print("   " + ("ERROR " if bad else "ok    ") + r.ljust(28), txt[:60].replace("\n", " | "))
        print("   Pantallas con error:", malas, "· errores de consola:", len(errs), errs[:5]); errs.clear()

        async def leccion(h, tag):
            await pg.goto(BASE + h); await pg.wait_for_timeout(300); pasos = []
            for _ in range(90):
                if await pg.locator(".celebrate").count(): break
                k = await pg.evaluate("(document.querySelector('.step-kicker')||{}).textContent||''"); pasos.append(k.split(" ", 1)[-1][:12])
                if await pg.locator("[data-v=ok]").count(): await pg.click("[data-v=ok]")
                elif await pg.locator("button:has-text('Ver la seña')").count(): await pg.click("button:has-text('Ver la seña')")
                elif await pg.locator("[data-nextl]").count(): await pg.click("[data-nextl]")
                elif await pg.locator(".option:not([disabled])").count(): await pg.locator(".option").first.click(); await pg.click("[data-next]")
                elif await pg.locator("#wr").count() and await pg.locator("[data-next][disabled]").count():
                    for _ in range(2): await pg.fill("#wr", "zzz"); await pg.press("#wr", "Enter")
                else: await pg.click("[data-next]")
                await pg.wait_for_timeout(120)
            fin = await pg.evaluate("document.querySelector('.celebrate') && document.querySelector('.celebrate').innerText.replace(/\\n/g,' ').replace(/ +/g,' ')")
            print("   %-26s %s\n   %-26s → %s" % (tag, dict(Counter(pasos)), "", fin))

        print("3) Lecciones completas:")
        await leccion("#/leccion/vocales/l1", "Vocales · lección 1")
        await leccion("#/leccion/saludos1/l1", "Saludos 1 · lección 1")
        await leccion("#/leccion/cons3/l1", "Consonantes N–S (Ñ)")
        await pg.evaluate("Promise.all(['rojo','azul','amarillo','verde','blanco'].map(id=>App.Media.put(id,new Blob(['x'],{type:'video/webm'}),'Prueba')))")
        await leccion("#/leccion/colores/l1", "Colores (con videos)")
        await leccion("#/leccion/colores/desafio", "Colores · desafío")
        await leccion("#/repaso", "Repaso inteligente")
        print("4) Progreso:", await pg.evaluate("JSON.stringify(App.P().stars)"), "· estrellas", await pg.evaluate("App.totalStars()"), "· puntos", await pg.evaluate("App.P().xp"))
        print("5) Corrección tolerante:", await pg.evaluate("""[['  BUEN DIA ','buen-dia'],['como estas','como-estas'],['n','letra-ñ'],['ñ','letra-ñ'],['marron','marron'],['rojos','rojo']]
            .map(x=>'«'+x[0].trim()+'» '+(App.answerOk(x[0],App.CONTENT.ITEMS[x[1]])?'✔':'✘')).join(' · ')"""))
        print("   Error de tipeo:", await pg.evaluate("""[['miercole','miercoles'],['domngo','domingo'],['amariyo','amarillo'],['rpjo','rojo']]
            .map(x=>'«'+x[0]+'» '+(App.nearMiss(x[0],App.CONTENT.ITEMS[x[1]])?'✔':'✘')).join(' · ')"""))
        print("6) Errores de consola en las lecciones:", len(errs), errs[:5])
        await b.close()

asyncio.run(main())
