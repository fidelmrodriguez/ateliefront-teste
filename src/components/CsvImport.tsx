import { useCsvImport } from "../hooks/useCsvImport";
import CsvPreview from "./CsvPreview";
export default function CsvImport() {
  const { rows, error, loaded, busy, valid, upload } = useCsvImport();
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
        {rows.length > 0 && <CsvPreview rows={rows} />}
      </details>
    </section>
  );
}
