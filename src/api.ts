import { z } from "zod";
export const participanteSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  origem: z.enum(["site", "evento", "redes_sociais"], {
    error: "Selecione a origem.",
  }),
});
export type NovoParticipante = z.infer<typeof participanteSchema>;
export const inscricaoSchema = participanteSchema.extend({
  id: z.string(),
  status: z.enum(["pendente", "aprovado"]),
  criadoEm: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
});
export type Inscricao = z.infer<typeof inscricaoSchema>;
export const demo = import.meta.env.VITE_DEMO === "true";
const cenario = import.meta.env.VITE_CENARIO || "";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const seed: Inscricao[] = [
  {
    id: "insc_1042",
    nome: "Marina Albuquerque",
    email: "marina.albuquerque@exemplo.com",
    origem: "evento",
    status: "pendente",
    criadoEm: "2026-10-14T09:12:00-03:00",
  },
  {
    id: "insc_1043",
    nome: "Rafael Tanaka",
    email: "rafael.tanaka@exemplo.com",
    origem: "redes_sociais",
    status: "aprovado",
    criadoEm: "2026-10-15T14:30:00-03:00",
  },
  {
    id: "insc_1044",
    nome: "Joana Prado",
    email: "joana.prado@exemplo.com",
    origem: "site",
    status: "aprovado",
    criadoEm: "2026-10-16T10:45:00-03:00",
  },
  {
    id: "insc_1045",
    nome: "Pedro Nascimento",
    email: "pedro.nascimento@exemplo.com",
    origem: "evento",
    status: "pendente",
    criadoEm: "2026-10-17T08:20:00-03:00",
  },
];
let registros = [...seed];
// A demonstração fica apenas na memória. Recarregar a página restaura os dados fictícios.
async function request(
  path: string,
  method = "GET",
  body?: NovoParticipante,
  signal?: AbortSignal,
): Promise<unknown> {
  if (demo) {
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException("Cancelado", "AbortError"));
      };
      const timer = setTimeout(
        () => {
          signal?.removeEventListener("abort", abort);
          resolve();
        },
        cenario === "lento" ? 3000 : 300,
      );
      if (signal?.aborted) abort();
      else signal?.addEventListener("abort", abort, { once: true });
    });
    if (cenario === "erro")
      throw new ApiError(
        500,
        "Não foi possível acessar o serviço. Tente novamente.",
      );
    if (method === "POST" && body) {
      if (
        cenario === "conflito" ||
        registros.some(
          (i) => i.email.toLowerCase() === body.email.toLowerCase(),
        )
      )
        throw new ApiError(409, "Este e-mail já está inscrito.");
      const item: Inscricao = {
        ...body,
        id: crypto.randomUUID(),
        status: "pendente",
        criadoEm: new Date().toISOString(),
      };
      registros = [item, ...registros];
      return item;
    }
    if (path === "/inscricoes")
      return cenario === "vazio" ? [] : [...registros];
    const item = registros.find(
      (i) => i.id === decodeURIComponent(path.split("/").pop() || ""),
    );
    if (!item) throw new ApiError(404, "Inscrição não encontrada.");
    return item;
  }
  const base = import.meta.env.VITE_API_URL;
  const codigo = import.meta.env.VITE_CANDIDATO;
  if (!base || !codigo)
    throw new ApiError(
      0,
      "Configure a URL da API e o código de candidato no arquivo .env.local.",
    );
  const url = new URL(base.replace(/\/$/, "") + path);
  if (cenario) url.searchParams.set("cenario", cenario);
  const response = await fetch(url, {
    method,
    signal,
    headers: {
      "X-Candidato": codigo,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      response.status === 409
        ? "Este e-mail já está inscrito."
        : response.status === 404
          ? "Inscrição não encontrada."
          : "Não foi possível concluir a operação. Tente novamente.",
    );
  return response.json();
}
export const api = {
  list: async (signal?: AbortSignal) =>
    z
      .array(inscricaoSchema)
      .parse(await request("/inscricoes", "GET", undefined, signal)),
  detail: async (id: string, signal?: AbortSignal) =>
    inscricaoSchema.parse(
      await request(
        "/inscricoes/" + encodeURIComponent(id),
        "GET",
        undefined,
        signal,
      ),
    ),
  create: async (data: NovoParticipante) =>
    inscricaoSchema.parse(await request("/inscricoes", "POST", data)),
};
export const origemLabel = {
  site: "Site",
  evento: "Evento",
  redes_sociais: "Redes sociais",
};
export const statusLabel = { pendente: "Pendente", aprovado: "Aprovado" };
export const dataLabel = (v: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(v));
export const mensagemErro = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "Não foi possível concluir a operação. Verifique sua conexão ou tente novamente.";
