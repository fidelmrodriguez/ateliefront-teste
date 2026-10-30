import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import axe from "axe-core";
import { api, ApiError, type Inscricao } from "./api";
vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return {
    ...actual,
    api: { list: vi.fn(), detail: vi.fn(), create: vi.fn() },
  };
});
const registros: Inscricao[] = [
  {
    id: "1",
    nome: "Ana Silva",
    email: "ana@exemplo.com",
    origem: "site",
    status: "aprovado",
    criadoEm: "2026-10-14T09:12:00-03:00",
  },
  {
    id: "2",
    nome: "Bruno Souza",
    email: "bruno@exemplo.com",
    origem: "evento",
    status: "pendente",
    criadoEm: "2026-10-15T09:12:00-03:00",
  },
];
const clients: QueryClient[] = [];
afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
});
function mount() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.list).mockResolvedValue(registros);
});
describe("Painel de inscrições", () => {
  it("valida campos obrigatórios e coloca o foco no primeiro erro", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(
      screen.getByRole("button", { name: "Cadastrar participante" }),
    );
    expect(screen.getByText("Informe o nome completo.")).toBeVisible();
    expect(screen.getByText("Informe um e-mail válido.")).toBeVisible();
    expect(screen.getByLabelText("Nome completo")).toHaveFocus();
    expect(api.create).not.toHaveBeenCalled();
  });
  it("combina busca e filtro sem alterar os indicadores globais", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByText("Ana Silva");
    await user.click(screen.getByRole("radio", { name: "Pendente" }));
    expect(screen.queryByText("Ana Silva")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno Souza")).toBeVisible();
    const resumo = screen.getByRole("region", {
      name: "Resumo das inscrições",
    });
    expect(within(resumo).getByText("2")).toBeVisible();
    await user.type(
      screen.getByLabelText("Buscar participante"),
      "inexistente",
    );
    expect(
      screen.getByRole("heading", { name: "Nenhum resultado" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Limpar busca e filtro" }),
    );
    expect(screen.getByText("Ana Silva")).toBeVisible();
  });
  it("preserva dados e associa o conflito ao campo de e-mail", async () => {
    const user = userEvent.setup();
    vi.mocked(api.create).mockRejectedValue(
      new ApiError(409, "Este e-mail já está inscrito."),
    );
    mount();
    await user.type(screen.getByLabelText("Nome completo"), "Carla Dias");
    await user.type(
      screen.getByLabelText("E-mail", { exact: true }),
      "carla@exemplo.com",
    );
    await user.selectOptions(screen.getByLabelText("Origem"), "site");
    await user.click(
      screen.getByRole("button", { name: "Cadastrar participante" }),
    );
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Carla Dias");
    expect(screen.getByLabelText("E-mail", { exact: true })).toHaveFocus();
    expect(screen.getByLabelText("E-mail", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
  it("permite tentar novamente após falha na consulta", async () => {
    const user = userEvent.setup();
    vi.mocked(api.list)
      .mockRejectedValueOnce(new ApiError(500, "Serviço indisponível."))
      .mockResolvedValueOnce(registros);
    mount();
    await screen.findByText("Serviço indisponível.");
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Ana Silva")).toBeVisible();
  });
  it("bloqueia cadastro repetido e atualiza os dados após sucesso", async () => {
    const user = userEvent.setup();
    let resolve!: (v: Inscricao) => void;
    vi.mocked(api.create).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    mount();
    await user.type(screen.getByLabelText("Nome completo"), "Carla Dias");
    await user.type(
      screen.getByLabelText("E-mail", { exact: true }),
      "carla@exemplo.com",
    );
    await user.selectOptions(screen.getByLabelText("Origem"), "evento");
    await user.dblClick(
      screen.getByRole("button", { name: "Cadastrar participante" }),
    );
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Cadastrando/ })).toBeDisabled();
    const nova: Inscricao = {
      ...registros[0],
      id: "3",
      nome: "Carla Dias",
      email: "carla@exemplo.com",
      origem: "evento",
      status: "pendente",
    };
    vi.mocked(api.list).mockResolvedValue([...registros, nova]);
    resolve(nova);
    await waitFor(() =>
      expect(screen.getByLabelText("Nome completo")).toHaveValue(""),
    );
    expect(await screen.findByText("Carla Dias")).toBeVisible();
    expect(
      within(
        screen.getByRole("region", { name: "Resumo das inscrições" }),
      ).getByText("3"),
    ).toBeVisible();
  });
  it("não apresenta violações automáticas de semântica no painel carregado", async () => {
    const { container } = mount();
    await screen.findByText("Ana Silva");
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
