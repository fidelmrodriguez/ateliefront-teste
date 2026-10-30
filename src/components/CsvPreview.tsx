import type { CsvRow } from "../csv";
export default function CsvPreview({ rows }: { rows: CsvRow[] }) {
  return (
    <div
      className="csv-preview"
      tabIndex={0}
      role="region"
      aria-label="Prévia das linhas do CSV, role horizontalmente para ver todas as colunas"
    >
      <table>
        <caption className="sr-only">
          Prévia de registros, erros e avisos por linha
        </caption>
        <thead>
          <tr>
            {["Linha", "Nome", "E-mail", "Origem", "Validação"].map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.linha}>
              <td>{row.linha}</td>
              <td>{row.nome || "Ausente"}</td>
              <td>{row.email || "Ausente"}</td>
              <td>{row.origem || "Ausente"}</td>
              <td>
                {row.erros.length
                  ? "Inválido: " + row.erros.join(" ")
                  : "Válido"}
                {row.avisos.length > 0 && <p>{row.avisos.join(" ")}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
