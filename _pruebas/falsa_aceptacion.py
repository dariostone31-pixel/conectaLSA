# -*- coding: utf-8 -*-
"""Prueba de conjunto abierto (falsa aceptación).
Para cada forma X: se entrena el modelo SIN X y se le muestran los ejemplos de X.
Lo correcto es «no reconozco». Si responde otra forma, es una falsa aceptación.
Además mide qué pasa en la práctica real de la app, donde se pide una seña objetivo concreta:
¿la forma desconocida habría sido aprobada como esa seña objetivo?"""
import asyncio, json
from playwright.async_api import async_playwright

JS = """() => {
  const M = App.Vision.Model, ALL = M.samples.slice(), labels = Object.keys(M.labels()).sort(), out = {};
  for (const X of labels) {
    M.samples = ALL.filter(s => s.l !== X); M._cal = null;
    const cal = M.calibration(); let rej = 0, acc = 0, n = 0, conf = {}, approved = 0;
    ALL.filter(s => s.l === X).forEach(s => {
      const r = M.predict(s.f); n++;
      if (r.unknown) rej++; else { acc++; conf[r.top[0].label] = (conf[r.top[0].label] || 0) + 1; if (r.top[0].p >= 0.5) approved++; }
    });
    out[X] = { n, rechazadas: rej, aceptadas_como_otra: acc, aprobadas_p50: approved, a_que: conf, umbral: +cal.reject.toFixed(2), p90: +cal.p90.toFixed(2), inter: +cal.inter.toFixed(2) };
  }
  M.samples = ALL; M._cal = null;
  // distancias de referencia con el modelo completo
  const cal = M.calibration();
  return { out, completo: { umbral: +cal.reject.toFixed(2), p90: +cal.p90.toFixed(2), inter: +cal.inter.toFixed(2), piso: App.Vision.REJECT_FLOOR } };
}"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(service_workers="block"); pg = await ctx.new_page()
        # El modelo quedó guardado en localStorage por experimento.py; se vuelve a crear el contexto, así que se recarga desde el JSON exportado.
        await pg.goto("http://localhost:8080/"); await pg.wait_for_timeout(400)
        modelo = open("/home/user/conectalsa/_pruebas/modelo_fotos.json").read()
        n = await pg.evaluate("t => App.Vision.Model.import(t, true)", modelo)
        print("Ejemplos importados:", n)
        print(json.dumps(await pg.evaluate(JS), ensure_ascii=False, indent=1))
        await b.close()

asyncio.run(main())
