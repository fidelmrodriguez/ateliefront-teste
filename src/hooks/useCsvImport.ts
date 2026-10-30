import { useRef, useState, type ChangeEvent } from "react";
import { validateCsv, type CsvRow } from "../csv";
export function useCsvImport() {
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
  return { rows, error, loaded, busy, valid, upload };
}
