import { parentPort, workerData } from "node:worker_threads";
import { contarPrimos } from "./calculo";

const n: number = workerData.n;
parentPort?.postMessage(contarPrimos(n));
