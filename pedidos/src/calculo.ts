/** Calcula cuantos numeros primos hay hasta n (incluido). */
export function contarPrimos(n: number): number {
  let total = 0;
  for (let candidato = 2; candidato <= n; candidato++) {
    let primo = true;
    for (let divisor = 2; divisor * divisor <= candidato; divisor++) {
      if (candidato % divisor === 0) {
        primo = false;
        break;
      }
    }
    if (primo) total++;
  }
  return total;
}
