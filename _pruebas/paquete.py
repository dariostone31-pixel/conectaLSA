# -*- coding: utf-8 -*-
"""Prueba del paquete para publicar (servido en :8090) con el service worker ACTIVADO y sin conexión."""
import asyncio
from playwright.async_api import async_playwright
BASE = "http://localhost:8090/"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844})
        pg = await ctx.new_page(); errs = []; faltan = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("response", lambda r: faltan.append(r.url) if r.status >= 400 else None)
        await pg.goto(BASE); await pg.wait_for_timeout(1500)
        await pg.evaluate("navigator.serviceWorker.ready"); await pg.wait_for_timeout(3000)
        cache = await pg.evaluate("caches.keys().then(async k=>{const c=await caches.open(k[0]);return [k,(await c.keys()).length]})")
        print("1) Service worker:", cache[0], "·", cache[1], "archivos guardados")
        await pg.fill("[data-name]", "Público"); await pg.click("form [type=submit]"); await pg.wait_for_timeout(400)
        print("2) Inicio con aviso:", await pg.evaluate("!!document.querySelector('.beta-note')"))
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("document.querySelector('main').innerText.slice(0,80).replace(/\\n/g,' | ')")
        print("3) Sin conexión, recargando:", txt)
        await pg.goto(BASE + "#/leccion/colores/desafio"); await pg.wait_for_timeout(600)
        print("   Desafío sin conexión:", await pg.evaluate("document.querySelector('.beta-note').innerText.slice(0,60)"))
        await pg.goto(BASE + "#/camara"); await pg.wait_for_timeout(600)
        print("   Prueba de cámara sin conexión carga:", "Ocurrió un error" not in await pg.evaluate("document.querySelector('main').innerText"))
        print("4) Archivos que faltan (404):", faltan or "ninguno", "· errores de consola:", len(errs), errs[:3])
        await b.close()
asyncio.run(main())
