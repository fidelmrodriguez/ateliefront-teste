import { dataLabel, type Inscricao } from "../api";
import StatusBadge from "./StatusBadge";
interface Props {
  inscricoes: Inscricao[];
  onSelect: (id: string, button: HTMLButtonElement) => void;
}
export default function TabelaInscricoes({ inscricoes, onSelect }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">
          Inscrições da campanha. As datas usam o horário de São Paulo.
        </caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
            <th scope="col">Data</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {inscricoes.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>{i.nome}</strong>
              </td>
              <td className="email-cell">
                <span className="email">{i.email}</span>
              </td>
              <td>
                <time dateTime={i.criadoEm}>{dataLabel(i.criadoEm)}</time>
              </td>
              <td>
                <StatusBadge status={i.status} />
              </td>
              <td>
                <button
                  className="detail-button"
                  aria-label={`Ver detalhes de ${i.nome}`}
                  onClick={(e) => onSelect(i.id, e.currentTarget)}
                >
                  Ver detalhes <span aria-hidden="true">›</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
