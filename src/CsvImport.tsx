import { useRef, useState, type ChangeEvent } from "react";
import { validateCsv, type CsvRow } from "./csv";
export default function CsvImport() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const current = ++generation.current;
    setError("");
    setRows([]);
    setLoaded(false);
    setBusy(false);
    if (!file) return;
    if (file.size > 2000000) {
      setError("O arquivo deve ter no máximo 2 MB.");
      return;
    }
    setBusy(true);
    try {
      const data = validateCsv(await file.text());
      if (current !== generation.current) return;
      setRows(data);
      setLoaded(true);
    } catch (e) {
      if (current === generation.current)
        setError(
          e instanceof Error ? e.message : "Não foi possível ler o CSV.",
        );
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  const valid = rows.filter((row) => row.erros.length === 0).length;
  return (
    <section className="panel csv-panel" aria-label="Importação local de CSV">
      <details open>
        <summary>
          Importação de CSV <span className="small">· opcional</span>
        </summary>
        <p className="small">
          Prévia local: nenhum arquivo ou registro é enviado à API. Até 2 MB e
          1.000 registros. Colunas: nome, email, origem.
        </p>
        <div className="csv-controls">
          <div>
            <label htmlFor="csv-file">Selecionar arquivo CSV</label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => void upload(e)}
            />
          </div>
          <a href="/inscricoes-exemplo.csv" download>
            Baixar CSV de exemplo
          </a>
        </div>
        <p role="status" className="csv-message">
          {busy
            ? "Lendo arquivo…"
            : loaded
              ? `${rows.length} registros: ${valid} válidos e ${rows.length - valid} inválidos. ${rows.filter((r) => r.avisos.length > 0).length} com aviso de duplicidade.`
              : ""}
        </p>
        {error && (
          <p role="alert" className="failure">
            {error}
          </p>
        )}
        {loaded && rows.length === 0 && (
          <p>O arquivo contém apenas o cabeçalho.</p>
        )}
        {rows.length > 0 && (
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
                  {["Linha", "Nome", "E-mail", "Origem", "Validação"].map(
                    (h) => (
                      <th scope="col" key={h}>
                        {h}
                      </th>
                    ),
                  )}
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
        )}
      </details>
    </section>
  );
}
