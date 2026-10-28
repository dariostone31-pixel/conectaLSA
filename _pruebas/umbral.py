# -*- coding: utf-8 -*-
"""Compara estrategias de umbral de rechazo con el modelo exportado (modelo_fotos.json).
FRR (falso rechazo): señas correctas de una persona NUEVA que la app no aprueba
      (se deja afuera a la persona completa, y el umbral se recalcula sin ella).
FAR (falsa aceptación): formas NO entrenadas que la app aprueba como alguna seña
      (se deja afuera la forma completa).
Regla de aprobación igual que en la app: la seña objetivo es la más probable y está dentro del umbral."""
import json, math, itertools

S = json.load(open("/home/user/conectalsa/_pruebas/modelo_fotos.json"))["samples"]
FLOOR = 2.5

def dist(a, b): return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

def scores(f, pool, k=3):
    best = {}
    for s in pool:
        best.setdefault(s["l"], []).append(dist(f, s["f"]))
    out = {}
    for l, ds in best.items():
        ds.sort(); out[l] = (sum(ds[:k]) / len(ds[:k]), ds[0])  # (media k=3, mínima)
    return out

def intra(pool, label):
    """Para cada ejemplo de la seña: distancia al ejemplo más parecido de la MISMA seña hecho por OTRA persona."""
    xs = [s for s in pool if s["l"] == label]; ds = []
    for s in xs:
        o = [dist(s["f"], t["f"]) for t in xs if t["w"] != s["w"]]
        if o: ds.append(min(o))
    return sorted(ds)

def q(ds, p):
    if not ds: return FLOOR
    return ds[min(len(ds) - 1, int(math.ceil(p * len(ds))) - 1)]

def inter_med(pool):
    xs = []
    for s in pool:
        o = [dist(s["f"], t["f"]) for t in pool if t["l"] != s["l"]]
        if o: xs.append(min(o))
    xs.sort(); return xs[len(xs) // 2] if xs else 0

def thr_global(pool):  # estrategia actual de la app
    ds = sorted(itertools.chain.from_iterable(intra(pool, l) for l in set(s["l"] for s in pool)))
    return {l: max(FLOOR, q(ds, 0.9) * 1.5, inter_med(pool) * 0.9) for l in set(s["l"] for s in pool)}

def thr_per_class(pct, fac):
    def f(pool):
        return {l: max(FLOOR, q(intra(pool, l), pct) * fac) for l in set(s["l"] for s in pool)}
    return f

def approve(f, pool, thr):
    sc = scores(f, pool)
    top = min(sc, key=lambda l: sc[l][0])
    return top, sc[top][1] <= thr[top]

def evaluate(name, strat):
    labels = sorted(set(s["l"] for s in S))
    # FRR: dejando afuera a cada persona
    ok = rej = 0
    for s in S:
        pool = [t for t in S if t["w"] != s["w"]]
        top, inside = approve(s["f"], pool, strat(pool))
        if top == s["l"]:
            ok += 1
            if not inside: rej += 1
    frr = rej / ok if ok else 0
    # FAR: dejando afuera la forma completa
    acc = n = 0
    for X in labels:
        pool = [t for t in S if t["l"] != X]; thr = strat(pool)
        for s in S:
            if s["l"] != X: continue
            n += 1; top, inside = approve(s["f"], pool, thr)
            if inside: acc += 1
    far = acc / n
    print("%-46s FRR %5.1f %%   FAR %5.1f %%" % (name, frr * 100, far * 100))
    return frr, far

print("Ejemplos:", len(S), "· personas:", len(set(s["w"] for s in S)), "· formas:", sorted(set(s["l"] for s in S)))
evaluate("Actual: global máx(piso, 1,5·p90, 0,9·inter)", thr_global)
for pct, fac in [(0.90, 1.0), (0.90, 1.25), (0.95, 1.25), (1.0, 1.0), (1.0, 1.15), (1.0, 1.25), (1.0, 1.5)]:
    evaluate("Por seña: %d%% de la distancia intra × %.2f" % (pct * 100, fac), thr_per_class(pct, fac))
