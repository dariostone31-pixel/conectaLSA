# -*- coding: utf-8 -*-
"""Verifica el aviso «Versión de prueba»: aparece sin videos, cuenta bien y desaparece cuando todo está validado."""
import asyncio
from playwright.async_api import async_playwright
BASE = "http://localhost:8080/"; OUT = "/home/user/conectalsa/capturas/"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, service_workers="block")
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        aviso = "(document.querySelector('.beta-note')||{innerText:'(SIN AVISO)'}).innerText.replace(/\\n+/g,' ')"
        await pg.goto(BASE); await pg.wait_for_timeout(700)
        print("1) Bienvenida:", await pg.evaluate(aviso)); await pg.screenshot(path=OUT + "17_aviso_bienvenida.png")
        await pg.fill("[data-name]", "Ana"); await pg.click("form [type=submit]"); await pg.wait_for_timeout(400)
        print("2) Inicio:", await pg.evaluate(aviso)); await pg.screenshot(path=OUT + "18_aviso_inicio.png")
        await pg.goto("about:blank"); await pg.goto(BASE + "#/leccion/vocales/desafio"); await pg.wait_for_timeout(400)
        print("3) Desafío (primer paso):", await pg.evaluate(aviso)); await pg.screenshot(path=OUT + "19_aviso_desafio.png")
        await pg.click("[data-next]"); await pg.wait_for_timeout(200)
        print("   Desafío (segundo paso):", await pg.evaluate(aviso))
        await pg.goto("about:blank"); await pg.goto(BASE + "#/leccion/vocales/l1"); await pg.wait_for_timeout(300)
        print("   Lección común:", await pg.evaluate(aviso))
        # Simula que se cargan y validan los 5 videos de Vocales: el aviso del desafío de Vocales debe desaparecer
        await pg.evaluate("""Promise.all(App.level('vocales').items.map(id=>App.Media.put(id,new Blob(['x'],{type:'video/webm'}),'Ref A').then(()=>App.Media.validate(id,'Ref B'))))""")
        await pg.goto("about:blank"); await pg.goto(BASE + "#/leccion/vocales/desafio"); await pg.wait_for_timeout(400)
        print("4) Desafío de Vocales con sus 5 videos validados:", await pg.evaluate(aviso))
        await pg.goto("about:blank"); await pg.goto(BASE + "#/niveles"); await pg.wait_for_timeout(400)
        print("   Inicio (faltan 68):", await pg.evaluate(aviso))
        # Todas validadas → el aviso general desaparece
        await pg.evaluate("""Promise.all(Object.keys(App.CONTENT.ITEMS).map(id=>App.Media.put(id,new Blob(['x'],{type:'video/webm'}),'Ref A').then(()=>App.Media.validate(id,'Ref B'))))""")
        await pg.goto("about:blank"); await pg.goto(BASE + "#/niveles"); await pg.wait_for_timeout(500)
        print("5) Inicio con las 73 validadas:", await pg.evaluate(aviso))
        # Tema oscuro, sin videos (contexto nuevo)
        ctx2 = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, service_workers="block", color_scheme="dark")
        pg2 = await ctx2.new_page(); await pg2.goto(BASE); await pg2.wait_for_timeout(500)
        await pg2.fill("[data-name]", "Ana"); await pg2.click("form [type=submit]"); await pg2.wait_for_timeout(300)
        await pg2.evaluate("App.state().settings.theme='dark';App.save()"); await pg2.goto("about:blank"); await pg2.goto(BASE + "#/niveles"); await pg2.wait_for_timeout(400)
        await pg2.screenshot(path=OUT + "20_aviso_oscuro.png")
        print("6) Errores de consola:", len(errs), errs[:3])
        await b.close()
asyncio.run(main())
