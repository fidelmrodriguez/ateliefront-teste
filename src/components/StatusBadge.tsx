import { statusLabel, type Inscricao } from "../api";
export default function StatusBadge({
  status,
}: {
  status: Inscricao["status"];
}) {
  return <span className={"badge " + status}>{statusLabel[status]}</span>;
}
