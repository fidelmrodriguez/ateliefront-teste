import { describe, it, expect } from "vitest";
import officialCsv from "../public/inscricoes-exemplo.csv?raw";
import { parseCsv, validateCsv } from "./csv";
describe("Prévia de CSV", () => {
  it("lê o arquivo oficial, preserva nome com vírgula e detecta erros e duplicidade", () => {
    const rows = validateCsv(officialCsv);
    expect(rows).toHaveLength(16);
    expect(
      rows.find((r) => r.nome === "Fernanda Souza, Jr.")?.erros,
    ).toHaveLength(0);
    expect(rows.filter((r) => r.erros.length === 0)).toHaveLength(9);
    expect(rows.filter((r) => r.erros.length > 0)).toHaveLength(7);
    expect(rows.at(-1)?.avisos).toHaveLength(1);
  });
  it("lê BOM, CRLF, quebra de linha e aspas escapadas", () => {
    expect(
      parseCsv(
        '\uFEFFnome,email,origem\r\n"Ana ""Maria""\nSilva",ana@exemplo.com,site',
      ),
    ).toEqual([
      ["nome", "email", "origem"],
      ['Ana "Maria"\nSilva', "ana@exemplo.com", "site"],
    ]);
  });
  it("rejeita aspas abertas e cabeçalho incorreto", () => {
    expect(() => parseCsv('"não fecha')).toThrow(/aspas/);
    expect(() => validateCsv("email,nome,origem")).toThrow(/cabeçalho/);
  });
});
