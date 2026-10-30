import type { CsvRow } from "../csv";
export default function CsvPreview({ rows }: { rows: CsvRow[] }) {
  return (
    <div
      className="csv-preview"
      role="region"
      aria-label="Prévia das linhas do CSV"
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
      <div className="csv-cards">
        {rows.map((row) => (
          <article className="csv-card" key={row.linha} aria-label={`Linha ${row.linha} do CSV`}>
            <div className="csv-card-heading">
              <h3>Linha {row.linha}</h3>
              <span className={"csv-validation " + (row.erros.length ? "csv-invalid" : "csv-valid")}>
                {row.erros.length ? "Inválido" : "Válido"}
              </span>
            </div>
            <dl>
              <div><dt>Nome</dt><dd>{row.nome || "Ausente"}</dd></div>
              <div><dt>E-mail</dt><dd>{row.email || "Ausente"}</dd></div>
              <div><dt>Origem</dt><dd>{row.origem || "Ausente"}</dd></div>
            </dl>
            {row.erros.length > 0 && <div className="csv-card-errors"><strong>Erros</strong><ul>{row.erros.map((error, index) => <li key={index}>{error}</li>)}</ul></div>}
            {row.avisos.length > 0 && <div className="csv-card-warnings"><strong>Avisos</strong><ul>{row.avisos.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
          </article>
        ))}
      </div>
    </div>
  );
}
