import type { Inscricao } from "../api";
interface Props {
  dados: Inscricao[];
  unavailable: boolean;
}
export default function ResumoInscricoes({ dados, unavailable }: Props) {
  return (
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
            <dd className="stat-number">{unavailable ? "—" : total}</dd>
            <dd className="stat-desc">{desc}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
