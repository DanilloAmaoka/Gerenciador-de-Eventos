import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { CATEGORIAS_EVENTO, CONFIG_EVENTOS_PADRAO, criarId } from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

function serializarCategorias(categorias = []) {
  return categorias.map((categoria) => categoria.id + " | " + categoria.nome + " | " + categoria.descricao).join("\n");
}

function parseCategorias(texto) {
  return texto
    .split("\n")
    .map((linha, index) => {
      const partes = linha.split("|").map((parte) => parte.trim()).filter(Boolean);
      const nome = partes.length > 1 ? partes[1] : partes[0];

      if (!nome) return null;

      return {
        id: partes.length > 1 ? criarId(partes[0], "categoria-" + (index + 1)) : criarId(nome, "categoria-" + (index + 1)),
        nome,
        descricao: partes.length > 2 ? partes.slice(2).join(" | ") : "Categoria personalizada do evento.",
      };
    })
    .filter(Boolean);
}

export default function Configuracoes() {
  const { configuracoesEventos, salvarConfiguracoesEventos } = useSchoolData();
  const { mostrarFeedback } = useFeedback();
  const [alertaOrcamento, setAlertaOrcamento] = useState(CONFIG_EVENTOS_PADRAO.alertaOrcamento);
  const [linhasCategorias, setLinhasCategorias] = useState(serializarCategorias(CATEGORIAS_EVENTO));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setAlertaOrcamento(configuracoesEventos.alertaOrcamento || CONFIG_EVENTOS_PADRAO.alertaOrcamento);
    setLinhasCategorias(serializarCategorias(configuracoesEventos.categorias || CATEGORIAS_EVENTO));
  }, [configuracoesEventos]);

  const categorias = useMemo(() => parseCategorias(linhasCategorias), [linhasCategorias]);

  async function salvarConfiguracoes() {
    if (categorias.length === 0) {
      mostrarFeedback("Informe ao menos uma categoria de custo.", "erro");
      return;
    }

    try {
      setSalvando(true);
      await salvarConfiguracoesEventos({
        alertaOrcamento: Number(alertaOrcamento) || CONFIG_EVENTOS_PADRAO.alertaOrcamento,
        categorias,
      });
      mostrarFeedback("Configurações salvas no banco de dados.");
    } catch (error) {
      mostrarFeedback("Não foi possível salvar as configurações.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  function restaurarCategorias() {
    setLinhasCategorias(serializarCategorias(CATEGORIAS_EVENTO));
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Preferências</span>
          <h1>Configurações</h1>
          <p>Ajuste as categorias de custo e o ponto em que o orçamento passa a chamar atenção.</p>
        </div>
      </header>

      <section className="content-grid two-columns">
        <div className="panel" data-tour="config-orcamento">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Orçamento</span>
              <h2>Alerta de uso</h2>
              <p>Quando um evento atingir esse percentual, ele aparece em atenção.</p>
            </div>
          </div>

          <div className="settings-list">
            <label>
              <div>
                <strong>Limite de atenção</strong>
                <span>Percentual usado pelo painel e pela sidebar</span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={alertaOrcamento}
                onChange={(event) => setAlertaOrcamento(event.target.value)}
              />
            </label>
          </div>

          <div className="notice-banner">
            <strong>Como funciona</strong>
            <p>
              Se o evento tem orçamento, os custos são comparados com ele. Se não tem, o sistema
              mostra apenas o total gasto, sem classificar como acima ou abaixo.
            </p>
          </div>
        </div>

        <div className="panel" data-tour="config-categorias">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Categorias</span>
              <h2>Áreas opcionais do evento</h2>
              <p>Use uma linha por categoria no formato id | nome | descrição.</p>
            </div>
          </div>

          <label className="field-group">
            <span>Categorias disponíveis</span>
            <textarea
              value={linhasCategorias}
              onChange={(event) => setLinhasCategorias(event.target.value)}
              rows="13"
              className="student-editor"
            />
          </label>

          <div className="tag-list">
            {categorias.map((categoria) => (
              <span key={categoria.id}>{categoria.nome}</span>
            ))}
          </div>

          <div className="button-row">
            <button type="button" className="button secondary" onClick={restaurarCategorias}>
              Restaurar padrão
            </button>
          </div>
        </div>
      </section>

      <div className="button-row">
        <button
          type="button"
          className="button primary"
          data-tour="config-salvar"
          onClick={salvarConfiguracoes}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar configurações"}
        </button>

        <NavLink className="button secondary" to="/arquivo" data-tour="config-arquivo">
          Consultar arquivo
        </NavLink>
      </div>
    </div>
  );
}
