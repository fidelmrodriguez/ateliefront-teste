import { useRef, useState } from "react";
import { demo } from "./api";
import { useInscricoes, useAtualizarInscricoes } from "./hooks/useInscricoes";
import Header from "./components/Header";
import ResumoInscricoes from "./components/ResumoInscricoes";
import ListaInscricoes from "./components/ListaInscricoes";
import CadastroPanel from "./components/CadastroPanel";
import Detalhes from "./components/Detalhes";
import CsvImport from "./components/CsvImport";

export default function App() {
  const list = useInscricoes();
  const atualizarInscricoes = useAtualizarInscricoes();
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const opener = useRef<HTMLButtonElement | null>(null);

  function handleCadastroSuccess() {
    setNotice(
      "Participante cadastrado com sucesso. Os indicadores e a listagem serão atualizados.",
    );
    void atualizarInscricoes();
  }

  return (
    <>
      <Header />
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
        <ResumoInscricoes
          dados={list.data ?? []}
          unavailable={list.isPending || list.isError}
        />
        <div className="workspace">
          <ListaInscricoes
            list={list}
            onSelect={(id, button) => {
              opener.current = button;
              setSelected(id);
            }}
          />
          <CadastroPanel
            onSubmit={() => setNotice("")}
            onSuccess={handleCadastroSuccess}
          />
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
