import { useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  api,
  ApiError,
  mensagemErro,
  participanteSchema,
  type NovoParticipante,
} from "../api";
export function useCadastro(onSuccess: () => void) {
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
        ?.querySelector<HTMLInputElement | HTMLSelectElement>(
          `[name="${String(parsed.error.issues[0].path[0])}"]`,
        )
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
  return { values, setValues, errors, failure, form, mutation, submit };
}
