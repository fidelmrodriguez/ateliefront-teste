import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
const inscricoesKey = ["inscricoes"] as const;
export function useInscricoes() {
  return useQuery({
    queryKey: inscricoesKey,
    queryFn: ({ signal }) => api.list(signal),
  });
}
export function useInscricao(id: string) {
  return useQuery({
    queryKey: [...inscricoesKey, id],
    queryFn: ({ signal }) => api.detail(id, signal),
  });
}
export function useAtualizarInscricoes() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: inscricoesKey });
}
