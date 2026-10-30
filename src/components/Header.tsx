export default function Header() {
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
    </>
  );
}
