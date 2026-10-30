export type FiltroStatus = "todos" | "pendente" | "aprovado";
interface Props {
  busca: string;
  status: FiltroStatus;
  setBusca: (value: string) => void;
  setStatus: (value: FiltroStatus) => void;
}
const options: [FiltroStatus, string][] = [
  ["todos", "Todos"],
  ["pendente", "Pendente"],
  ["aprovado", "Aprovado"],
];
export default function FiltrosInscricoes({
  busca,
  status,
  setBusca,
  setStatus,
}: Props) {
  return (
    <div className="filters">
      <div>
        <label className="sr-only" htmlFor="busca">
          Buscar participante
        </label>
        <input
          id="busca"
          type="search"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <fieldset className="status-filter">
        <legend className="sr-only">Filtrar por status</legend>
        {options.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="status"
              value={value}
              checked={status === value}
              onChange={() => setStatus(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
