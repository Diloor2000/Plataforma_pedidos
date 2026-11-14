import express from "express";

const app = express();
const puerto = Number(process.env.PORT ?? 3001);
const retardoMs = Number(process.env.RETARDO_MS ?? 0);
const disponibles = new Map<string, number>([
  ["MOUSE-USB", 40], ["Secadora", 5], ["Lavadora", 40],
  ["Refrigerador", 12], ["Microondas", 0]
]);
const dormir = (ms: number) => new Promise<void>(ok => setTimeout(ok, ms));

app.use(express.json());
app.get("/health", (_req, res) => { res.type("text").send("OK"); });

app.get("/stock/:sku", async (req, res) => {
  if (retardoMs > 0) await dormir(retardoMs);
  const { sku } = req.params;
  const disponible = disponibles.get(sku);
  if (disponible === undefined) {
    res.status(404).json({ error: "SKU no registrado", sku });
    return;
  }
  res.json({ sku, disponible });
});

app.post("/stock/:sku/reservar", async (req, res) => {
  const { sku } = req.params;
  const cantidad: unknown = req.body?.cantidad;
  if (!Number.isInteger(cantidad) || (cantidad as number) <= 0) {
    res.status(400).json({ error: "cantidad debe ser un entero positivo" });
    return;
  }
  if (!disponibles.has(sku)) {
    res.status(404).json({ error: "SKU no registrado", sku });
    return;
  }
  if (retardoMs > 0) await dormir(retardoMs);
  const actual = disponibles.get(sku)!;
  if ((cantidad as number) > actual) {
    res.status(409).json({ error: "Stock insuficiente", sku, solicitado: cantidad, disponible: actual });
    return;
  }
  const restante = actual - (cantidad as number);
  disponibles.set(sku, restante);
  res.json({ sku, reservado: cantidad, restante });
});

app.listen(puerto, () => console.log(`Inventario: puerto ${puerto}`));
