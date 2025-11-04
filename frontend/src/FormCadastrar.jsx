import { useEffect, useState } from "react";

function FormCadastrar(props) {
  const [inp, setInput] = useState({ login: "", senha: "" });

  useEffect(() => {
    resetForm();
  }, []);

  function resetForm(e) {
    if (e) {
      e.preventDefault();
    }
    setInput({ login: "", senha: "" });
  }

  function atualizarForm(e) {
    setInput({ ...inp, [e.target.name]: e.target.value });
  }

  async function cadastrar(e) {
    try {
      e.preventDefault();
      const res = await fetch("http://localhost:3000/user", {
        method: "POST",
        body: JSON.stringify(inp),
        headers: {"Content-type" : "application/json"}
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.msg);
        return;
      }
      alert("Cadastro realizado com sucesso!");
      resetForm();
    } catch (e) {
      alert("Erro ao realizar o cadastro");
    }
  }

  return (
    <>
      <h2 className="title has-text-centered">Fazer cadastro</h2>
      <form onSubmit={cadastrar}>
        <div className="field">
          <label className="label">Login</label>
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Login"
              required
              name="login"
              onChange={atualizarForm}
              value={inp.login}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Senha</label>
          <div className="control">
            <input
              className="input"
              type="password"
              placeholder="Senha"
              required
              name="senha"
              onChange={atualizarForm}
              value={inp.senha}
            />
          </div>
        </div>
        <div className="field is-grouped">
          <div className="control">
            <button className="button is-link">Cadastrar</button>
          </div>
          <div className="control">
            <button className="button is-link is-light" onClick={resetForm}>
              Limpar
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default FormCadastrar;
