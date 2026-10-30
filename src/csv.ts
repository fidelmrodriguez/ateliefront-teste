import { participanteSchema } from "./api";
export type CsvRow = {
  linha: number;
  nome: string;
  email: string;
  origem: string;
  erros: string[];
  avisos: string[];
};
/** Parser CSV com campos entre aspas, aspas escapadas, CRLF e quebra de linha em campo. */
export function parseCsv(text: string): string[][] {
  if (text.length > 2000000)
    throw new Error("O arquivo deve ter no máximo 2 MB.");
  text = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += char;
      continue;
    }
    if (char === '"') {
      if (field !== "" || closed)
        throw new Error("Aspas em posição inválida no CSV.");
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
      closed = false;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      closed = false;
    } else {
      if (closed)
        throw new Error("Caractere inesperado após fechamento de aspas.");
      field += char;
    }
  }
  if (quoted) throw new Error("Há um campo com aspas não fechadas.");
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  if (rows.length > 1001)
    throw new Error("Limite de 1.000 registros por prévia.");
  return rows;
}
export function validateCsv(text: string): CsvRow[] {
  const [header, ...rows] = parseCsv(text);
  if (
    !header ||
    header.length !== 3 ||
    header.map((v) => v.trim().toLowerCase()).join(",") !== "nome,email,origem"
  )
    throw new Error("O cabeçalho deve ser nome,email,origem, nessa ordem.");
  const seen = new Set<string>();
  return rows.map((cells, index) => {
    const [nome = "", email = "", origem = ""] = cells.map((v) => v.trim());
    const parsed = participanteSchema.safeParse({ nome, email, origem });
    const erros = parsed.success
      ? []
      : parsed.error.issues.map((i) => i.message);
    if (cells.length !== 3)
      erros.push("Quantidade de colunas diferente do cabeçalho.");
    const avisos: string[] = [];
    const normalized = email.toLowerCase();
    if (normalized && seen.has(normalized))
      avisos.push("E-mail repetido no arquivo; pode gerar conflito na API.");
    if (normalized) seen.add(normalized);
    return { linha: index + 2, nome, email, origem, erros, avisos };
  });
}
