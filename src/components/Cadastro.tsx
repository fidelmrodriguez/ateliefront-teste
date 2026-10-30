import { origemLabel } from "../api";
import { useCadastro } from "../hooks/useCadastro";
export default function Cadastro({ onSuccess }: { onSuccess: () => void }) {
  const { values, setValues, errors, failure, form, mutation, submit } =
    useCadastro(onSuccess);
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
