# -*- coding: utf-8 -*-
"""Capturas de ConectaLSA para el informe (celular 390×844 y escritorio 1280×820)."""
import asyncio, os
from playwright.async_api import async_playwright

BASE = "http://localhost:8080/"; OUT = "/home/user/conectalsa/capturas/"
os.makedirs(OUT, exist_ok=True)
SIN_AVISOS = "document.querySelectorAll('.toast').forEach(t=>t.remove())"

async def ir(pg, ruta, espera=400):
    """Navega siempre con recarga real (evita capturar una pantalla vieja si el hash no cambia)."""
    await pg.goto("about:blank"); await pg.goto(BASE + ruta); await pg.wait_for_timeout(espera); await pg.evaluate(SIN_AVISOS)

async def foto(pg, nombre, full=False):
    await pg.evaluate(SIN_AVISOS); await pg.screenshot(path=OUT + nombre, full_page=full); print("  ✓", nombre)

VIDEO_PRUEBA = """new Promise(res=>{const c=document.createElement('canvas');c.width=480;c.height=360;const g=c.getContext('2d');const s=c.captureStream(15);const r=new MediaRecorder(s);const ch=[];r.ondataavailable=e=>ch.push(e.data);
  let t=0;const iv=setInterval(()=>{g.fillStyle='#E8F1F0';g.fillRect(0,0,480,360);g.fillStyle='#0F6B6F';g.beginPath();g.arc(240+80*Math.sin(t/5),170,50,0,7);g.fill();g.fillStyle='#41545B';g.font='18px sans-serif';g.textAlign='center';g.fillText('video de prueba (lo grabará un referente sordo)',240,330);t++},66);
  r.onstop=()=>{clearInterval(iv);const bl=new Blob(ch,{type:'video/webm'});Promise.all(['rojo','azul','amarillo','verde'].map(id=>App.Media.put(id,bl,'Referente de prueba'))).then(()=>App.Media.validate('rojo','Segunda referente')).then(res)};r.start();setTimeout(()=>r.stop(),1500)})"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, service_workers="block")
        pg = await ctx.new_page()
        await pg.goto(BASE); await pg.wait_for_timeout(700)
        await foto(pg, "01_bienvenida.png")
        await pg.fill("[data-name]", "Rocío"); await pg.click("[data-ava=llama]"); await pg.click("form [type=submit]"); await pg.wait_for_timeout(300)
        await pg.evaluate("""(()=>{App.setStars('vocales/l1',3);App.setStars('vocales/l2',2);App.setStars('colores/l1',3);App.addXp(14);
          ['letra-a','letra-e','rojo'].forEach(i=>App.track(i,'seen'));App.track('rojo','write-fail');App.track('rojo','write-fail');App.track('letra-e','rep');App.save();})()""")
        await pg.evaluate(VIDEO_PRUEBA)
        await ir(pg, "#/niveles"); await foto(pg, "02_niveles.png", True)
        await ir(pg, "#/nivel/colores"); await foto(pg, "03_nivel.png")
        await ir(pg, "#/leccion/colores/l1"); await foto(pg, "04_observa.png", True)
        await pg.click("[data-next]"); await pg.wait_for_timeout(300); await foto(pg, "05_practica.png", True)
        await ir(pg, "#/leccion/colores/l1")
        for _ in range(10):
            if await pg.locator("#wr").count(): break
            if await pg.locator("[data-v=ok]").count(): await pg.click("[data-v=ok]")
            else: await pg.click("[data-next]")
            await pg.wait_for_timeout(150)
        await pg.fill("#wr", "zzz"); await pg.press("#wr", "Enter"); await pg.wait_for_timeout(500)
        await foto(pg, "06_escribi.png", True)
        await ir(pg, "#/sena/rojo", 700); await foto(pg, "07_sena_video.png", True)
        await ir(pg, "#/diccionario"); await foto(pg, "08_diccionario.png")
        await ir(pg, "#/perfil"); await foto(pg, "09_perfil.png", True)
        await pg.evaluate("App.createProfile({name:'Tomás',avatar:'cat',hand:'left',goal:30});App.setStars('vocales/l1',2);App.track('letra-o','write-fail');App.switchProfile(App.state().order[0])")
        await ir(pg, "#/perfiles"); await foto(pg, "10_perfiles.png")
        await pg.set_viewport_size({"width": 1280, "height": 820})
        await ir(pg, "#/progreso"); await foto(pg, "11_progreso.png")
        await ir(pg, "#/niveles"); await foto(pg, "12_niveles_escritorio.png")
        await ir(pg, "#/referente"); await foto(pg, "13_referente.png")
        await pg.evaluate("App.state().settings.theme='dark';App.save()")
        await ir(pg, "#/ajustes"); await foto(pg, "14_ajustes_oscuro.png")
        await pg.evaluate("App.state().settings.theme='auto';App.save()")
        await pg.set_viewport_size({"width": 390, "height": 844})
        await ir(pg, "#/camara"); await foto(pg, "16_camara.png", True)
        await b.close()

asyncio.run(main())
