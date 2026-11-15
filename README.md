# Plataforma de Pedidos | Deber S2

Servicios de Inventario y Pedidos (Express y TypeScript). Este desarrollo agrega:
- Distribucion p50, p99 y maximo del retardo del bucle de eventos.
- Conteo de nucleos visibles para Node.js.
- Pool con limite configurable, cola acotada y 503 + `Retry-After`.
- Metricas internas por ruta y estado del despachador.

## Ejecutar

```powershell
docker compose up -d --build
docker compose ps
```

Se exponen `/reporte/bloqueante`, `/reporte/worker`, `/reporte/pool` y `/metricas`.

## Configuracion por defecto del laboratorio

`MAX_TRABAJADORES=2` y `MAX_COLA=4` en `compose.yaml` para observar saturacion.
Sin las variables, se usa `os.availableParallelism()` y el doble para la cola.

## Evidencia experimental

Ejecuta las mediciones en el equipo del estudiante. **No incluyas** resultados de
otro equipo. Conserva salidas, JSON de `/metricas` y capturas, y transcribe los
datos a `docs/s2/BITACORA.md`. La plantilla esta intencionalmente incompleta.
