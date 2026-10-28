# -*- coding: utf-8 -*-
"""Experimento de reconocimiento dentro de ConectaLSA con fotos reales de personas distintas.
Cada foto = una persona; la foto espejada simula su otra mano.
Usa el mismo código de la app: MediaPipe → App.Vision.canonical → Modelo k-NN → «Medir precisión».
Requiere el servidor en http://localhost:8080 sirviendo /home/user/conectalsa."""
import asyncio, json, os
from playwright.async_api import async_playwright

BASE = "http://localhost:8080/"
TEST = "/home/user/conectalsa/_test"
OUT_JSON = "/home/user/informes/experimento_rasgos/resultado_conectalsa.json"
OUT_IMG = "/home/user/conectalsa/capturas/15_medir_precision.png"
FILES = sorted(os.listdir(TEST))

JS = """async (files) => {
  const mp = await import(new URL("vendor/mediapipe/vision_bundle.mjs", location.href).href);
  const fs = await mp.FilesetResolver.forVisionTasks(new URL("vendor/mediapipe", location.href).href);
  const lm = await mp.HandLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: new URL("vendor/mediapipe/hand_landmarker.task", location.href).href, delegate: "CPU" }, runningMode: "IMAGE", numHands: 1, minHandDetectionConfidence: 0.3 });
  const NAMES = { open: "mano-abierta", fist: "puno", peace: "v", index: "indice" };
  const M = App.Vision.Model; M.clear(); const rows = [];
  for (const name of files) {
    const img = new Image(); img.src = "_test/" + name;
    try { await img.decode(); } catch (e) { rows.push({ name, err: "no decodifica" }); continue; }
    for (const mirror of [false, true]) {
      const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const x = cv.getContext("2d");
      if (mirror) { x.translate(cv.width, 0); x.scale(-1, 1); } x.drawImage(img, 0, 0);
      const r = lm.detect(cv);
      if (!r.landmarks.length) { rows.push({ name, mirror, found: false }); continue; }
      const label = r.handedness[0][0].categoryName, score = r.handedness[0][0].score;
      const c = App.Vision.canonical(r.landmarks[0], label, cv.width / cv.height);
      const cls = NAMES[name.split("_")[0]];
      M.add(cls, c, "persona-" + name.split(".")[0]);
      rows.push({ name, mirror, found: true, cls, mano: label, score: +score.toFixed(2), ext: c.ext.map(v => +v.toFixed(2)), palm: +c.palm.toFixed(2) });
    }
  }
  M.save();
  const e = M.evaluate();
  return { model: M.export(), rows, labels: M.labels(), people: M.people().length, acc: e.acc, frr: e.frr, far: e.far, n: e.n, method: e.method, per: e.per, single: e.single, matrix: e.matrix, labelsOrder: e.labels };
}"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 900}, service_workers="block")
        pg = await ctx.new_page()
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        await pg.evaluate("App.createProfile({name:'Equipo',avatar:'owl',hand:'right',goal:30})")
        res = await pg.evaluate(JS, FILES)
        det = [r for r in res["rows"] if r.get("found")]
        fotos_ok = sorted(set(r["name"] for r in det))
        print("Fotos:", len(FILES), "· con mano detectada:", len(fotos_ok), "· ejemplos (con espejo):", len(det))
        print("Descartadas:", sorted(set(r["name"] for r in res["rows"] if not r.get("found")) - set(fotos_ok)))
        print("Ejemplos por forma:", res["labels"], "· personas:", res["people"])
        print("PRECISIÓN: %.1f %% · FALSO RECHAZO: %.1f %% · FALSA ACEPTACIÓN: %s · n = %d · %s" % (res["acc"] * 100, res["frr"] * 100, ("%.1f %%" % (res["far"] * 100)) if res.get("far") is not None else "—", res["n"], res["method"]))
        for k, q in res["per"].items():
            print("  %-13s personas=%d  acierto=%d/%d  rechazos=%d  falsas aceptaciones=%d/%d" % (k, q["people"], q["ok"], q["n"], q["rej"], q.get("fa", 0), q.get("fn", 0)))
        print("Matriz (real → respuesta):", json.dumps(res["matrix"], ensure_ascii=False))
        os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
        open("/home/user/conectalsa/_pruebas/modelo_fotos.json", "w").write(res.pop("model"))
        json.dump(res, open(OUT_JSON, "w"), ensure_ascii=False, indent=1)
        await pg.goto(BASE + "#/entrenar"); await pg.wait_for_timeout(600)
        await pg.click("[data-eval]"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelectorAll('.toast').forEach(t=>t.remove())")
        el = pg.locator("[data-evalout]")
        await el.screenshot(path=OUT_IMG)
        print("Captura:", OUT_IMG)
        await b.close()

asyncio.run(main())
