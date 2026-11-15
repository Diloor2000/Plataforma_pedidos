import express from "express";
import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";
import path from "node:path";
import { contarPrimos } from "./calculo";
import { registrarPeticion, obtenerMetricas } from "./metricas";
import { contarPrimosEnPool, PoolLleno, estadoPool } from "./pool";

const app = express();
const puerto = Number(process.env.PORT ?? 3000);
const baseInventario = process.env.INVENTARIO_URL ?? "http://localhost:3001";
const nPredeterminado = Number(process.env.REPORTE_N ?? 8_000_000);

type Pedido = { id: string; sku: string; cantidad: number; creadoEn: string };
const pedidos: Pedido[] = [];

app.use(express.json());
app.use(registrarPeticion);

app.get("/health", (_req, res) => res.type("text").send("OK"));
app.get("/health/ready", async (_req, res) => {
  const inicio = performance.now();
  try {
    const respuesta = await fetch(`${baseInventario}/health`, { signal: AbortSignal.timeout(1000) });
    if (!respuesta.ok) throw new Error(`Inventario HTTP ${respuesta.status}`);
    res.json({ status: "listo", inventario: "ok", ms: Math.round(performance.now() - inicio) });
  } catch (error) {
    res.status(503).json({ status: "no-listo", motivo: String(error), ms: Math.round(performance.now() - inicio) });
  }
});

app.get("/pedidos", (_req, res) => res.json(pedidos));
app.post("/pedidos", async (req, res) => {
  const { sku, cantidad } = req.body ?? {};
  if (typeof sku !== "string" || !sku.trim() || !Number.isInteger(cantidad) || cantidad <= 0) {
    res.status(400).json({ error: "sku y cantidad entera positiva son obligatorios" });
    return;
  }
  try {
    const respuesta = await fetch(`${baseInventario}/stock/${encodeURIComponent(sku)}/reservar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
      signal: AbortSignal.timeout(3000)
    });
    const detalle = await respuesta.json();
    if (!respuesta.ok) {
      res.status(respuesta.status).json(detalle);
      return;
    }
    const pedido = { id: randomUUID(), sku, cantidad, creadoEn: new Date().toISOString() };
    pedidos.push(pedido);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(503).json({ error: "Inventario no disponible", detalle: String(error) });
  }
});

function limite(req: express.Request): number {
  const valor = Number(req.query.n ?? nPredeterminado);
  return Number.isSafeInteger(valor) && valor > 0 && valor <= 50_000_000 ? valor : nPredeterminado;
}

app.get("/reporte/bloqueante", (req, res) => {
  const n = limite(req);
  const inicio = performance.now();
  const primos = contarPrimos(n);
  res.json({ modo: "bloqueando", n, primos, duracionMS: Math.round(performance.now() - inicio) });
});

function ejecutarEnWorker(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "worker-reporte.js"), { workerData: { n } });
    let valor: number | undefined;
    let fallo: Error | undefined;
    worker.once("message", (resultado: number) => { valor = resultado; });
    worker.once("error", (error: Error) => { fallo = error; });
    worker.once("exit", (codigo) => {
      if (fallo) reject(fallo);
      else if (codigo !== 0 || valor === undefined) reject(new Error(`Worker: salida ${codigo}`));
      else resolve(valor);
    });
  });
}

app.get("/reporte/worker", async (req, res) => {
  const n = limite(req);
  const inicio = performance.now();
  try {
    const primos = await ejecutarEnWorker(n);
    res.json({ modo: "worker", n, primos, duracionMS: Math.round(performance.now() - inicio) });
  } catch (error) {
    res.status(500).json({ error: "Worker fallo", detalle: String(error) });
  }
});

app.get("/reporte/pool", async (req, res) => {
  const n = limite(req);
  const inicio = performance.now();
  try {
    const primos = await contarPrimosEnPool(n);
    res.json({ modo: "pool", n, primos, duracionMS: Math.round(performance.now() - inicio) });
  } catch (error) {
    if (error instanceof PoolLleno) {
      res.setHeader("Retry-After", "1");
      res.status(503).json({ error: error.message, pool: estadoPool() });
      return;
    }
    res.status(500).json({ error: "No se pudo completar el reporte", detalle: String(error) });
  }
});

app.get("/metricas", (_req, res) => res.json({ ...obtenerMetricas(), pool: estadoPool() }));
app.listen(puerto, () => console.log(`Pedidos: puerto ${puerto}; inventario=${baseInventario}`));
