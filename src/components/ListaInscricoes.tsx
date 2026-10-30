import { useState } from "react";
import { mensagemErro } from "../api";
import type { useInscricoes } from "../hooks/useInscricoes";
import FiltrosInscricoes, { type FiltroStatus } from "./FiltrosInscricoes";
import TabelaInscricoes from "./TabelaInscricoes";
interface Props {
  list: ReturnType<typeof useInscricoes>;
  onSelect: (id: string, button: HTMLButtonElement) => void;
}
export default function ListaInscricoes({ list, onSelect }: Props) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const dados = list.data ?? [];
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const filtrados = dados.filter(
    (i) =>
      (status === "todos" || i.status === status) &&
      `${i.nome} ${i.email}`.toLocaleLowerCase("pt-BR").includes(termo),
  );
  return (
    <section className="panel" aria-labelledby="list-title">
      <h2 id="list-title" className="sr-only">
        Lista de inscrições
      </h2>
      <FiltrosInscricoes
        busca={busca}
        status={status}
        setBusca={setBusca}
        setStatus={setStatus}
      />
      <p className="results" role="status">
        {!list.isPending && !list.isError
          ? `Mostrando ${filtrados.length} de ${dados.length} inscrições`
          : ""}
      </p>
      {list.isPending ? (
        <div className="empty" role="status">
          Buscando inscrições…
        </div>
      ) : list.isError ? (
        <div className="empty" role="alert">
          <h3>Não foi possível carregar</h3>
          <p>{mensagemErro(list.error)}</p>
          <button
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            {list.isFetching ? "Tentando…" : "Tentar novamente"}
          </button>
        </div>
      ) : dados.length === 0 ? (
        <div className="empty">
          <h3>A primeira conexão vem aí</h3>
          <p>Nenhuma inscrição cadastrada. Cadastre o primeiro participante.</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty">
          <h3>Nenhum resultado</h3>
          <p>Tente outro nome, e-mail ou status.</p>
          <button
            onClick={() => {
              setBusca("");
              setStatus("todos");
            }}
          >
            Limpar busca e filtro
          </button>
        </div>
      ) : (
        <TabelaInscricoes inscricoes={filtrados} onSelect={onSelect} />
      )}
      <p className="panel-foot">
        Os indicadores acima consideram todas as inscrições.
      </p>
    </section>
  );
}
