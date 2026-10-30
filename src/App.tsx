import CsvImport from "./CsvImport";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  ApiError,
  dataLabel,
  demo,
  mensagemErro,
  origemLabel,
  participanteSchema,
  statusLabel,
  type NovoParticipante,
} from "./api";
export default function App() {
  const client = useQueryClient();
  const list = useQuery({
    queryKey: ["inscricoes"],
    queryFn: ({ signal }) => api.list(signal),
  });
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const opener = useRef<HTMLButtonElement | null>(null);
  const dados = list.data || [];
  const filtrados = dados.filter(
    (i) =>
      (status === "todos" || i.status === status) &&
      `${i.nome} ${i.email}`
        .toLocaleLowerCase("pt-BR")
        .includes(busca.trim().toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <a href="#conteudo" className="skip">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <a href="#conteudo" className="brand">
          <img
            src="/logo-negativo.svg"
            alt="Conexão Ateliê"
            width="132"
            height="40"
          />
        </a>
        <span className="campaign">Painel da equipe · Conexão Ateliê</span>
      </header>
      <main id="conteudo" tabIndex={-1} className="page">
        <div className="intro">
          <div>
            <h1>Inscrições</h1>
            <p className="lead">
              Campanha Conexão Ateliê. Acompanhe as inscrições e cadastre novos
              participantes.
            </p>
          </div>
        </div>
        {demo && (
          <p className="demo">
            Modo demonstração · Dados fictícios, mantidos somente nesta sessão.
          </p>
        )}
        <div role="status" className={notice ? "success" : "sr-only"}>
          {notice}
        </div>
        <section aria-labelledby="resumo">
          <h2 id="resumo" className="sr-only">
            Resumo das inscrições
          </h2>
          <dl className="stats">
            {[
              ["Total de inscrições", dados.length, ""],
              [
                "Pendentes",
                dados.filter((i) => i.status === "pendente").length,
                "",
              ],
              [
                "Aprovadas",
                dados.filter((i) => i.status === "aprovado").length,
                "",
              ],
            ].map(([label, total, desc], index) => (
              <div className={"stat stat-" + index} key={label}>
                <dt>
                  {label}
                  <span aria-hidden="true">{["↗", "◷", "✓"][index]}</span>
                </dt>
                <dd className="stat-number">
                  {list.isPending || list.isError ? "—" : total}
                </dd>
                <dd className="stat-desc">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="workspace">
          <section className="panel" aria-labelledby="list-title">
            <h2 id="list-title" className="sr-only">
              Lista de inscrições
            </h2>
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
                {[
                  ["todos", "Todos"],
                  ["pendente", "Pendente"],
                  ["aprovado", "Aprovado"],
                ].map(([value, label]) => (
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
                <p>
                  Nenhuma inscrição cadastrada. Cadastre o primeiro
                  participante.
                </p>
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
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">
                    Inscrições da campanha. As datas usam o horário de São
                    Paulo.
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
                    {filtrados.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <strong>{i.nome}</strong>
                        </td>
                        <td className="email-cell">
                          <span className="email">{i.email}</span>
                        </td>
                        <td>
                          <time dateTime={i.criadoEm}>
                            {dataLabel(i.criadoEm)}
                          </time>
                        </td>
                        <td>
                          <span className={"badge " + i.status}>
                            {statusLabel[i.status]}
                          </span>
                        </td>
                        <td>
                          <button
                            className="detail-button"
                            aria-label={`Ver detalhes de ${i.nome}`}
                            onClick={(e) => {
                              opener.current = e.currentTarget;
                              setSelected(i.id);
                            }}
                          >
                            Ver detalhes <span aria-hidden="true">›</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="panel-foot">
              Os indicadores acima consideram todas as inscrições.
            </p>
          </section>
          <section
            onSubmitCapture={() => setNotice("")}
            className="panel form-panel"
            id="cadastro"
            aria-labelledby="cadastro-title"
          >
            <h2 id="cadastro-title">Cadastrar participante</h2>
            <p className="small">Todos os campos são obrigatórios.</p>
            <Cadastro
              onSuccess={() => {
                setNotice(
                  "Participante cadastrado com sucesso. Os indicadores e a listagem serão atualizados.",
                );
                void client.invalidateQueries({ queryKey: ["inscricoes"] });
              }}
            />
          </section>
        </div>
        <CsvImport />
      </main>
      {selected && (
        <Detalhes
          id={selected}
          onClose={() => {
            setSelected(null);
            opener.current?.focus();
          }}
        />
      )}
    </>
  );
}
export function Cadastro({ onSuccess }: { onSuccess: () => void }) {
  const [values, setValues] = useState({ nome: "", email: "", origem: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const mutation = useMutation({
    mutationFn: (data: NovoParticipante) => api.create(data),
  });
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const parsed = participanteSchema.safeParse(values);
    setFailure("");
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      form.current
        ?.querySelector<
          HTMLInputElement | HTMLSelectElement
        >(`[name="${String(parsed.error.issues[0].path[0])}"]`)
        ?.focus();
      return;
    }
    setErrors({});
    lock.current = true;
    try {
      await mutation.mutateAsync(parsed.data);
      setValues({ nome: "", email: "", origem: "" });
      onSuccess();
    } catch (error) {
      setFailure(mensagemErro(error));
      if (error instanceof ApiError && error.status === 409) {
        setErrors({
          email: "Este e-mail já está inscrito. Use outro endereço.",
        });
        form.current
          ?.querySelector<HTMLInputElement>('[name="email"]')
          ?.focus();
      }
    } finally {
      lock.current = false;
    }
  }
  return (
    <form
      ref={form}
      onSubmit={(e) => void submit(e)}
      noValidate
      aria-busy={mutation.isPending}
    >
      {(["nome", "email", "origem"] as const).map((name) => (
        <div className="field" key={name}>
          <label htmlFor={"novo-" + name}>
            {name === "nome"
              ? "Nome completo"
              : name === "email"
                ? "E-mail"
                : "Origem"}
          </label>
          {name === "origem" ? (
            <select
              id={"novo-" + name}
              name={name}
              value={values[name]}
              required
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? name + "-error" : undefined}
              onChange={(e) => setValues({ ...values, [name]: e.target.value })}
            >
              <option value="">Selecione a origem</option>
              {Object.entries(origemLabel).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={"novo-" + name}
              name={name}
              type={name === "email" ? "email" : "text"}
              autoComplete={name === "email" ? "email" : "name"}
              value={values[name]}
              required
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? name + "-error" : undefined}
              placeholder={
                name === "nome" ? "Ex.: Marina Albuquerque" : "nome@exemplo.com"
              }
              onChange={(e) => setValues({ ...values, [name]: e.target.value })}
            />
          )}
          {errors[name] && (
            <p className="field-error" id={name + "-error"}>
              {errors[name]}
            </p>
          )}
        </div>
      ))}
      {failure && (
        <p role="alert" className="failure">
          {failure} Seus dados foram preservados.
        </p>
      )}
      <button
        className="primary full"
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Cadastrando…" : "Cadastrar participante"}
        <span aria-hidden="true"> →</span>
      </button>
      <p className="form-note" role="status">
        {mutation.isPending
          ? "Enviando cadastro. Aguarde a confirmação."
          : "Novos cadastros entram com status Pendente."}
      </p>
    </form>
  );
}
export function Detalhes({ id, onClose }: { id: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  function close() {
    dialog.current?.close();
    onClose();
  }
  const detail = useQuery({
    queryKey: ["inscricoes", id],
    queryFn: ({ signal }) => api.detail(id, signal),
  });
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
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
          <p role="status">Buscando detalhes…</p>
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
              Status: (
                <span className={"badge " + detail.data.status}>
                  {statusLabel[detail.data.status]}
                </span>
              ),
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
