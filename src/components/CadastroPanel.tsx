import Cadastro from "./Cadastro";
interface Props {
  onSubmit: () => void;
  onSuccess: () => void;
}
export default function CadastroPanel({ onSubmit, onSuccess }: Props) {
  return (
    <section
      onSubmitCapture={onSubmit}
      className="panel form-panel"
      id="cadastro"
      aria-labelledby="cadastro-title"
    >
      <h2 id="cadastro-title">Cadastrar participante</h2>
      <p className="small">Todos os campos são obrigatórios.</p>
      <Cadastro onSuccess={onSuccess} />
    </section>
  );
}
