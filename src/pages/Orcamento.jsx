import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  calcularResumoEvento,
  formatarData,
  formatarMoeda,
  normalizarTexto,
  ordenarEventosPorData,
} from "../data/eventosData";
import { useSchoolData } from "../context/SchoolDataContext";

export default function Orcamento() {
  const { eventosAtivos, configuracoesEventos } = useSchoolData();
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");

  const eventosComResumo = useMemo(
    () =>
      ordenarEventosPorData(eventosAtivos).map((evento) => ({
        evento,
        resumo: calcularResumoEvento(evento),
      })),
    [eventosAtivos],
  );

  const filtrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return eventosComResumo.filter(({ evento, resumo }) => {
      const buscaValida = !termo || normalizarTexto(evento.nome + " " + evento.local + " " + evento.responsavel).includes(termo);
      const tipoValido =
        tipo === "Todos" ||
        (tipo === "Sem orçamento" && !resumo.orcamentoAtivo) ||
        (tipo === "Dentro do orçamento" && resumo.orcamentoAtivo && resumo.percentual < configuracoesEventos.alertaOrcamento) ||
        (tipo === "Em atenção" && resumo.orcamentoAtivo && resumo.percentual >= configuracoesEventos.alertaOrcamento && resumo.percentual <= 100) ||
        (tipo === "Acima do orçamento" && resumo.orcamentoAtivo && resumo.percentual > 100);

      return buscaValida && tipoValido;
    });
  }, [busca, configuracoesEventos.alertaOrcamento, eventosComResumo, tipo]);

  const semOrcamento = eventosComResumo.filter((item) => !item.resumo.orcamentoAtivo).length;
  const emAtencao = eventosComResumo.filter(
    (item) => item.resumo.orcamentoAtivo && item.resumo.percentual >= configuracoesEventos.alertaOrcamento && item.resumo.percentual <= 100,
  ).length;
  const acima = eventosComResumo.filter((item) => item.resumo.orcamentoAtivo && item.resumo.percentual > 100).length;
  const totalPrevisto = eventosComResumo.reduce((total, item) => total + (item.resumo.orcamentoAtivo ? item.resumo.orcamento : 0), 0);
  const totalGasto = eventosComResumo.reduce((total, item) => total + item.resumo.total, 0);

  function classeCard(resumo) {
    if (!resumo.orcamentoAtivo) return "risk-card budget-neutral";
    if (resumo.percentual > 100) return "risk-card risk-critical";
    if (resumo.percentual >= configuracoesEventos.alertaOrcamento) return "risk-card risk-warning";
    return "risk-card budget-ok";
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Acompanhamento</span>
          <h1>Orçamento</h1>
          <p>
            Compare custos com orçamento quando o evento tiver um valor previsto. Eventos sem
            orçamento continuam sendo acompanhados apenas pelo total gasto.
          </p>
        </div>
      </header>

      <section className="panel filters-panel" data-tour="orcamento-filtros">
        <div className="filter-row">
          <label>
            <span>Buscar evento</span>
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Nome, local ou responsável"
            />
          </label>

          <label>
            <span>Situação</span>
            <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option>Todos</option>
              <option>Dentro do orçamento</option>
              <option>Em atenção</option>
              <option>Acima do orçamento</option>
              <option>Sem orçamento</option>
            </select>
          </label>
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <span>Total gasto</span>
          <strong>{formatarMoeda(totalGasto)}</strong>
          <p>Eventos ativos</p>
        </article>

        <article className="metric-card success">
          <span>Total previsto</span>
          <strong>{formatarMoeda(totalPrevisto)}</strong>
          <p>Somente com orçamento</p>
        </article>

        <article className="metric-card warning">
          <span>Em atenção</span>
          <strong>{emAtencao}</strong>
          <p>A partir de {configuracoesEventos.alertaOrcamento}%</p>
        </article>

        <article className="metric-card danger">
          <span>Acima</span>
          <strong>{acima}</strong>
          <p>{semOrcamento} sem orçamento</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Lista de orçamento</span>
            <h2>{filtrados.length} eventos</h2>
          </div>

          <div className="segmented-control" data-tour="orcamento-segmentos">
            {["Todos", "Em atenção", "Acima do orçamento", "Sem orçamento"].map((item) => (
              <button
                key={item}
                type="button"
                className={tipo === item ? "active" : ""}
                onClick={() => setTipo(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="list-stack" data-tour="orcamento-lista">
          {filtrados.length === 0 && (
            <div className="empty-state compact">Nenhum evento encontrado nesta situação.</div>
          )}

          {filtrados.map(({ evento, resumo }) => (
            <div className={classeCard(resumo)} key={evento.id}>
              <div>
                <span className="eyebrow">{formatarData(evento.data)}</span>
                <h3>{evento.nome}</h3>
                <p>
                  {resumo.orcamentoAtivo
                    ? formatarMoeda(resumo.total) + " de " + formatarMoeda(resumo.orcamento)
                    : formatarMoeda(resumo.total) + " gastos sem orçamento definido"}
                </p>
              </div>

              <div className="risk-actions budget-actions">
                {resumo.orcamentoAtivo ? (
                  <div className="budget-progress compact">
                    <strong>{resumo.percentual}%</strong>
                    <div className="budget-bar">
                      <span style={{ width: Math.min(100, resumo.percentual) + "%" }} />
                    </div>
                    <small>
                      {resumo.restante >= 0 ? "Restam " : "Excedeu "}
                      {formatarMoeda(Math.abs(resumo.restante))}
                    </small>
                  </div>
                ) : (
                  <span className="status-badge status-reforco">Sem orçamento</span>
                )}

                <NavLink className="button primary small" to={"/custos?evento=" + evento.id}>
                  Ajustar
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
