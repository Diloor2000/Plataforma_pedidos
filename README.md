# Plataforma de Pedidos - base de clase

Implementacion previa al **deber S2**, con dos servicios (Inventario y Pedidos),
reservas, comprobaciones de salud, reportes bloqueantes y reportes en un worker
por solicitud, y el interceptor de latencias por ruta.

Este punto de partida **no incluye** monitor del bucle de eventos ni pool de
trabajadores: ambos se desarrollan en la rama `s2/deber`.

## Inicio rapido

Desde esta carpeta y con Docker Desktop funcionando:

```powershell
docker compose up -d --build
docker compose ps
```

Endpoints principales:
- http://localhost:3000/health
- http://localhost:3000/health/ready
- http://localhost:3000/reporte/bloqueante?n=2000000
- http://localhost:3000/reporte/worker?n=2000000
- http://localhost:3000/metricas
- http://localhost:3001/stock/MOUSE-USB

## Trabajo independiente

El estudiante debe realizar sus propias mediciones en su maquina, conservar
las capturas y completar la bitacora. Los valores no son transferibles entre equipos.
