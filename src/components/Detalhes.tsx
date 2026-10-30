import { useEffect, useRef } from "react";
import { mensagemErro, origemLabel } from "../api";
import { useInscricao } from "../hooks/useInscricoes";
import StatusBadge from "./StatusBadge";
export default function Detalhes({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  function close() {
    dialog.current?.close();
    onClose();
  }
  const detail = useInscricao(id);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="detail-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="modal-content">
        <div className="modal-heading">
          <h2 id="detail-title">Detalhes da inscrição</h2>
          <button autoFocus aria-label="Fechar detalhes" onClick={close}>
            Fechar ×
          </button>
        </div>
        {detail.isPending ? (
          <p role="status" className="detail-loading">Buscando detalhes…</p>
        ) : detail.isError ? (
          <div role="alert">
            <p>{mensagemErro(detail.error)}</p>
            <button
              disabled={detail.isFetching}
              onClick={() => void detail.refetch()}
            >
              {detail.isFetching ? "Tentando…" : "Tentar novamente"}
            </button>
          </div>
        ) : (
          <dl className="detail-list">
            {Object.entries({
              Nome: detail.data.nome,
              "E-mail": detail.data.email,
              "Origem do cadastro": origemLabel[detail.data.origem],
              Status: <StatusBadge status={detail.data.status} />,
              "Data da inscrição": new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "America/Sao_Paulo",
              }).format(new Date(detail.data.criadoEm)),
              Código: detail.data.id,
            }).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </dialog>
  );
}
