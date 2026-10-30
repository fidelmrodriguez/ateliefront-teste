import { afterEach, describe, expect, it, vi } from "vitest";
const item = {
  id: "1",
  nome: "Ana Silva",
  email: "ana@exemplo.com",
  origem: "site",
  status: "pendente",
  criadoEm: "2026-10-14T09:12:00-03:00",
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
async function setup() {
  vi.resetModules();
  vi.stubEnv("VITE_DEMO", "false");
  vi.stubEnv("VITE_API_URL", "https://api.example.test");
  vi.stubEnv("VITE_CANDIDATO", "codigo-de-teste");
  vi.stubEnv("VITE_CENARIO", "");
  return import("./api");
}
describe("Contrato do adaptador REST", () => {
  it("envia o código e o cenário na listagem e permite cancelamento", async () => {
    const { api } = await setup();
    vi.stubEnv("VITE_CENARIO", "lento");
    vi.resetModules();
    const module = await import("./api");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([item]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    expect(await module.api.list(controller.signal)).toEqual([item]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.test/inscricoes?cenario=lento",
    );
    expect(options.headers["X-Candidato"]).toBe("codigo-de-teste");
    expect(options.signal).toBe(controller.signal);
    expect(api).toBeDefined();
  });
  it("envia apenas nome, email e origem e identifica conflito 409", async () => {
    const { api, ApiError } = await setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 409 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      api.create({
        nome: "Ana Silva",
        email: "ana@exemplo.com",
        origem: "site",
      }),
    ).rejects.toBeInstanceOf(ApiError);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/inscricoes");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      nome: "Ana Silva",
      email: "ana@exemplo.com",
      origem: "site",
    });
    expect(options.headers["X-Candidato"]).toBe("codigo-de-teste");
  });
  it("rejeita uma resposta fora do contrato", async () => {
    const { api } = await setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ items: [item] }), { status: 200 }),
        ),
    );
    await expect(api.list()).rejects.toThrow();
  });
});
