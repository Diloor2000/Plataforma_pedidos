import type { NextFunction, Request, Response } from "express";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { availableParallelism } from "node:os";

interface Muestra {
  total: number;
  acumuladoMs: number;
  maxMs: number;
  lentas: number;
}

const rutas = new Map<string, Muestra>();
const umbralLentaMs = Number(process.env.UMBRAL_LENTA_MS ?? 1000);
const relojDelBucle = monitorEventLoopDelay({ resolution: 10 });
relojDelBucle.enable();

export function registrarPeticion(req: Request, res: Response, next: NextFunction): void {
  const comienzo = performance.now();
  res.once("finish", () => {
    const clave = `${req.method} ${req.path}`;
    const demora = performance.now() - comienzo;
    const dato = rutas.get(clave) ?? { total: 0, acumuladoMs: 0, maxMs: 0, lentas: 0 };
    dato.total += 1;
    dato.acumuladoMs += demora;
    dato.maxMs = Math.max(dato.maxMs, demora);
    if (demora > umbralLentaMs) dato.lentas++;
    rutas.set(clave, dato);
  });
  next();
}

const enMilisegundos = (nanosegundos: number) => Math.round(nanosegundos / 1_000_000);

export function obtenerMetricas() {
  return {
    umbralLentaMs,
    nucleos: availableParallelism(),
    bucle: {
      p50Ms: enMilisegundos(relojDelBucle.percentile(50)),
      p99Ms: enMilisegundos(relojDelBucle.percentile(99)),
      maxMs: enMilisegundos(relojDelBucle.max)
    },
    rutas: [...rutas].map(([ruta, dato]) => ({
      ruta,
      peticiones: dato.total,
      promedioMs: dato.acumuladoMs / dato.total,
      maxMs: dato.maxMs,
      lentas: dato.lentas
    }))
  };
}
