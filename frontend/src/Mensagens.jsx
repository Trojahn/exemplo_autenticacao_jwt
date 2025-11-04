import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from 'date-fns/locale';

function Mensagens(props) {
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    carregarMensagens();
  }, []);

  function humanizeDate(dateTime) {
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true, locale: ptBR });
  }

  async function carregarMensagens() {
    const res = await fetch("http://localhost:3000/msg", {
      headers: { Authorization: `Bearer ${props.token}` },
    });
    const json = await res.json();
    setMensagens(json);
  }

  let items = [];
  for (let item of mensagens) {
    let novo = (
      <div className="box my-5" data-id={item.id} key={item.id}>
        <article className="media">
          <div className="media-content">
            <div className="content">
              <h3>{item.texto}</h3>
              <p>{humanizeDate(item.data)}</p>
            </div>
          </div>
        </article>
      </div>
    );
    items.push(novo);
  }

  function resetForm(e) {
    if (e) {
      e.preventDefault();
    }
    setTexto("");
  }

  function atualizarForm(e) {
    setTexto(e.target.value);
  }

  async function adicionar(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/msg", {
      method: "POST",
      body: JSON.stringify({ texto: texto }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.token}`,
      },
    });
    if (!res.ok) {
      alert("Erro ao cadastrar mensagem");
      return;
    }
    carregarMensagens();
    resetForm();
  }

  return (
    <>
      <h2 className="subtitle has-text-centered my-5">
        Cadastrar uma nova mensagem
      </h2>
      <form onSubmit={adicionar}>
        <div className="field">
          <label className="label">Texto</label>
          <div className="control">
            <textarea
              className="textarea has-fixed-size"
              placeholder="Mensagem de texto"
              required
              name="texto"
              onChange={atualizarForm}
              value={texto}
              maxLength={255}
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
      <h2 className="subtitle has-text-centered my-5">Mensagens cadastradas</h2>
      {items}
    </>
  );
}

export default Mensagens;
