# Punto de partida del deber

Esta rama `main` contiene el avance de clase: middleware para medir latencias
por ruta, el reporte sincrono `/reporte/bloqueante` y el reporte con un worker
nuevo por solicitud `/reporte/worker`.

La rama `s2/deber` debe agregar monitorEventLoopDelay, availableParallelism,
una cola acotada y `GET /reporte/pool`. Conservar este archivo permite demostrar
la diferencia entre el trabajo previo y el deber individual.
