# Bitacora de ejecucion | S2 | Diego Loor

> Documento de campo: completar SOLO con las lecturas de esta ejecucion.
> Al terminar, incluir salidas textuales y respuestas JSON integras.

## Equipo y parametros

| Variable | Lectura |
|:--|:--|
| Procesador | PENDIENTE DE MEDIR |
| Memoria RAM | PENDIENTE DE MEDIR |
| Nucleos que devuelve /metricas | PENDIENTE DE MEDIR |
| Limite de trabajadores | 2 |
| Capacidad de cola | 4 |
| Reporte individual n=2000000 | PENDIENTE DE MEDIR (ms) |

## 1. Registro de escenarios

| Prueba | p50 (ms) | Max (ms) | 2xx | 503 | Timeouts | bucle.maxMs |
|:--|--:|--:|--:|--:|--:|--:|
| A - /health + bloqueo | - | - | - | - | - | - |
| B - /reporte/worker | - | - | - | - | - | - |
| C - /reporte/pool | - | - | - | - | - | - |

### A. Bloqueo del hilo principal

**Salida autocannon:** pegar contenido real de `escenario-1-autocannon.txt`.

**JSON `/metricas`:** pegar contenido real de `escenario-1-metricas.json`.

### B. Hilos sin limite

**Salida autocannon:** pegar contenido real de `escenario-2-autocannon.txt`.

**JSON `/metricas`:** pegar contenido real de `escenario-2-metricas.json`.

### C. Despachador acotado

**Salida autocannon:** pegar contenido real de `escenario-3-autocannon.txt`.

**JSON `/metricas`:** pegar contenido real de `escenario-3-metricas.json`.

## 2. Interpretacion y modelos de fallo

### 2.1. Diferencia entre la demora global del bucle y la medicion de /health

[4 a 8 lineas, citar maxMs real del bucle y de GET /health.]

### 2.2. Comportamiento de 50 workers concurrentes

[4 a 8 lineas, citar completadas, timeouts y tiempo de reporte individual.]

### 2.3. Rechazo explicito vs ausencia de respuesta

[4 a 8 lineas, citar 2xx y 503.]

### 2.4. Reintentos de autocannon ante 503

[4 a 8 lineas, citar rechazadas en estadoPool y proponer backoff.]

### 2.5. Tres replicas detras de un balanceador

[4 a 8 lineas, explicar metricas locales, 3 × maxTrabajadores y cola global.]

## 3. Incidencias de la practica

[Registrar un problema que realmente haya aparecido y su solucion, o indicar que no hubo.]

## 4. Herramientas de IA utilizadas

[Describir de manera veraz el apoyo recibido, incluyendo cualquier ayuda en el codigo o la redaccion.]
