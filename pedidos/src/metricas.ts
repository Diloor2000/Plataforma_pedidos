import type { NextFunction, Request, Response } from "express";

interface Muestra {
  total: number;
  acumuladoMs: number;
  maxMs: number;
  lentas: number;
}

const rutas = new Map<string, Muestra>();
const umbralLentaMs = Number(process.env.UMBRAL_LENTA_MS ?? 1000);

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

export function obtenerMetricas() {
  return {
    umbralLentaMs,
    rutas: [...rutas].map(([ruta, dato]) => ({
      ruta,
      peticiones: dato.total,
      promedioMs: dato.acumuladoMs / dato.total,
      maxMs: dato.maxMs,
      lentas: dato.lentas
    }))
  };
}
