import { availableParallelism } from "node:os";
import path from "node:path";
import { Worker } from "node:worker_threads";

type Pendiente = { n: number; resolve: (primos: number) => void; reject: (error: Error) => void };

function limiteEntero(valor: string | undefined, predeterminado: number, minimo: number): number {
  if (valor === undefined) return predeterminado;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= minimo ? numero : predeterminado;
}

const maxTrabajadores = limiteEntero(process.env.MAX_TRABAJADORES, availableParallelism(), 1);
const maxCola = limiteEntero(process.env.MAX_COLA, maxTrabajadores * 2, 0);
const pendientes: Pendiente[] = [];
let activos = 0;
let rechazadas = 0;

export class PoolLleno extends Error {
  constructor() {
    super("Capacidad agotada: trabajadores y cola ocupados");
    this.name = "PoolLleno";
  }
}

function ejecutar(tarea: Pendiente): void {
  activos++;
  try {
    const archivo = path.resolve(__dirname, "worker-reporte.js");
    const hilo = new Worker(archivo, { workerData: { n: tarea.n } });
    let primos: number | undefined;
    let error: Error | undefined;

    hilo.once("message", (resultado: number) => { primos = resultado; });
    hilo.once("error", (motivo: Error) => { error = motivo; });
    hilo.once("exit", (codigo: number) => {
      activos--;
      if (error) tarea.reject(error);
      else if (codigo !== 0 || primos === undefined) tarea.reject(new Error(`Worker finalizado con codigo ${codigo}`));
      else tarea.resolve(primos);
      continuar();
    });
  } catch (motivo) {
    activos--;
    tarea.reject(motivo instanceof Error ? motivo : new Error(String(motivo)));
    continuar();
  }
}

function continuar(): void {
  while (activos < maxTrabajadores && pendientes.length) {
    const siguiente = pendientes.shift()!;
    ejecutar(siguiente);
  }
}

export function contarPrimosEnPool(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const tarea = { n, resolve, reject };
    if (activos < maxTrabajadores && pendientes.length === 0) {
      ejecutar(tarea);
    } else if (pendientes.length < maxCola) {
      pendientes.push(tarea);
      continuar();
    } else {
      rechazadas++;
      reject(new PoolLleno());
    }
  });
}

export function estadoPool() {
  return { maxTrabajadores, activos, enCola: pendientes.length, maxCola, rechazadas };
}
