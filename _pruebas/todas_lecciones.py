# -*- coding: utf-8 -*-
"""Recorre las 32 lecciones (22 + 10 desafíos) SIN videos cargados, como las vería una persona nueva hoy."""
import asyncio
from collections import Counter
from playwright.async_api import async_playwright
BASE = "http://localhost:8080/"; OUT = "/home/user/conectalsa/capturas/sin_videos_"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, service_workers="block")
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(BASE); await pg.wait_for_timeout(600)
        await pg.fill("[data-name]", "Prueba"); await pg.click("form [type=submit]"); await pg.wait_for_timeout(300)
        lessons = await pg.evaluate("App.CONTENT.LEVELS.flatMap(l=>l.lessons.map(x=>[l.id,x.id,l.title]))")
        print("Videos cargados:", await pg.evaluate("Object.keys(App.CONTENT.MEDIA).length"), "· lecciones a recorrer:", len(lessons))
        vistos = set(); total = Counter(); fallas = []
        for lv, ls, title in lessons:
            await pg.goto("about:blank"); await pg.goto(BASE + "#/leccion/%s/%s" % (lv, ls)); await pg.wait_for_timeout(300)
            pasos = Counter(); ok = False
            for _ in range(120):
                if await pg.locator(".celebrate").count(): ok = True; break
                k = (await pg.evaluate("(document.querySelector('.step-kicker')||{}).textContent||''")).split(" ", 1)[-1].strip()
                pasos[k] += 1
                if k and k not in vistos:
                    vistos.add(k); await pg.evaluate("document.querySelectorAll('.toast').forEach(t=>t.remove())")
                    await pg.screenshot(path=OUT + "%02d.png" % len(vistos), full_page=True)
                    txt = await pg.evaluate("document.querySelector('.step, main').innerText.replace(/\\n+/g,' | ').slice(0,260)")
                    print("  Tipo de paso «%s» (en %s/%s): %s" % (k, lv, ls, txt))
                if await pg.locator("[data-v=ok]").count(): await pg.click("[data-v=ok]")
                elif await pg.locator("[data-nextl]").count(): await pg.click("[data-nextl]")
                elif await pg.locator(".option:not([disabled])").count(): await pg.locator(".option").first.click(); await pg.click("[data-next]")
                elif await pg.locator("#wr").count() and await pg.locator("[data-next][disabled]").count():
                    for _ in range(2): await pg.fill("#wr", "zzz"); await pg.press("#wr", "Enter")
                else: await pg.click("[data-next]")
                await pg.wait_for_timeout(60)
            total.update(pasos)
            if not ok: fallas.append("%s/%s" % (lv, ls))
            print("%-9s %-9s %s %s" % (lv, ls, "✔" if ok else "✘ NO TERMINÓ", dict(pasos)))
        print("\nLecciones que no terminaron:", fallas or "ninguna", "· errores de consola:", len(errs), errs[:3])
        print("Pasos en total:", dict(total))
        await b.close()
asyncio.run(main())
