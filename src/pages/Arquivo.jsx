import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  calcularResumoEvento,
  formatarData,
  formatarMoeda,
  obterCategoria,
  obterStatusEvento,
} from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

export default function Arquivo() {
  const {
    eventos,
    eventosArquivados,
    concluirEvento,
    arquivarEvento,
    reabrirEvento,
    configuracoesEventos,
  } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const [aba, setAba] = useState("arquivados");
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");

  const concluidosNaoArquivados = useMemo(
    () => eventos.filter((evento) => !evento.arquivado && evento.status === "concluido"),
    [eventos],
  );

  const ativosNaoConcluidos = useMemo(
    () => eventos.filter((evento) => !evento.arquivado && evento.status !== "concluido"),
    [eventos],
  );

  const listaAtual = aba === "arquivados" ? eventosArquivados : aba === "concluidos" ? concluidosNaoArquivados : ativosNaoConcluidos;
  const eventoSelecionado = useMemo(() => {
    if (!listaAtual.length) return null;
    return listaAtual.find((evento) => evento.id === eventoSelecionadoId) || listaAtual[0];
  }, [eventoSelecionadoId, listaAtual]);

  async function concluir(evento) {
    const confirmado = await pedirConfirmacao({
      titulo: "Concluir evento",
      mensagem: "Deseja marcar " + evento.nome + " como concluído?",
      textoConfirmar: "Concluir",
    });

    if (!confirmado) return;

    try {
      await concluirEvento(evento.id);
      setAba("concluidos");
      mostrarFeedback("Evento concluído.");
    } catch (error) {
      mostrarFeedback("Não foi possível concluir o evento.", "erro");
    }
  }

  async function arquivar(evento) {
    const confirmado = await pedirConfirmacao({
      titulo: "Arquivar evento",
      mensagem: "Deseja arquivar " + evento.nome + "? Custos e comprovantes continuarão disponíveis para consulta.",
      textoConfirmar: "Arquivar",
      perigo: true,
    });

    if (!confirmado) return;

    try {
      await arquivarEvento(evento.id);
      setAba("arquivados");
      mostrarFeedback("Evento arquivado no banco de dados.");
    } catch (error) {
      mostrarFeedback("Não foi possível arquivar o evento.", "erro");
    }
  }

  async function reabrir(evento) {
    try {
      await reabrirEvento(evento.id);
      setAba("ativos");
      mostrarFeedback("Evento reaberto.");
    } catch (error) {
      mostrarFeedback("Não foi possível reabrir o evento.", "erro");
    }
  }

  const resumoSelecionado = eventoSelecionado ? calcularResumoEvento(eventoSelecionado) : null;
  const statusSelecionado = eventoSelecionado ? obterStatusEvento(eventoSelecionado.status) : null;

  return (
    <div className="page old-years-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Arquivo</h1>
          <p>Conclua eventos e arquive no banco para consultas futuras, sem perder custos e comprovantes.</p>
        </div>

        <NavLink className="button secondary" to="/eventos">
          Voltar para eventos
        </NavLink>
      </header>

      <div className="tab-bar" data-tour="arquivo-abas">
        <button type="button" className={aba === "arquivados" ? "active" : ""} onClick={() => setAba("arquivados")}>
          Arquivados ({eventosArquivados.length})
        </button>
        <button type="button" className={aba === "concluidos" ? "active" : ""} onClick={() => setAba("concluidos")}>
          Concluídos ({concluidosNaoArquivados.length})
        </button>
        <button type="button" className={aba === "ativos" ? "active" : ""} onClick={() => setAba("ativos")}>
          Ativos ({ativosNaoConcluidos.length})
        </button>
      </div>

      <section className="content-grid two-columns narrow-left">
        <div className="panel" data-tour="arquivo-lista">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Eventos</span>
              <h2>{listaAtual.length} registros</h2>
            </div>
          </div>

          <div className="old-year-list">
            {listaAtual.length === 0 && (
              <p className="muted-text">Nenhum evento nesta aba.</p>
            )}

            {listaAtual.map((evento) => {
              const resumo = calcularResumoEvento(evento);

              return (
                <button
                  key={evento.id}
                  type="button"
                  className={eventoSelecionado?.id === evento.id ? "old-year-card active" : "old-year-card"}
                  onClick={() => setEventoSelecionadoId(evento.id)}
                >
                  <strong>{evento.nome}</strong>
                  <span>{formatarData(evento.data)} · {formatarMoeda(resumo.total)}</span>
                  <small>{resumo.totalCustos} custos · {resumo.comprovantes} comprovantes</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel">
          {eventoSelecionado ? (
            <>
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Consulta</span>
                  <h2>{eventoSelecionado.nome}</h2>
                  <p>{formatarData(eventoSelecionado.data)} · {eventoSelecionado.local || "Sem local definido"}</p>
                </div>

                <span className={"status-badge " + statusSelecionado.classe}>{statusSelecionado.nome}</span>
              </div>

              <div className="report-summary">
                <div>
                  <span>Total gasto</span>
                  <strong>{formatarMoeda(resumoSelecionado.total)}</strong>
                </div>
                <div>
                  <span>Orçamento</span>
                  <strong>{resumoSelecionado.orcamentoAtivo ? formatarMoeda(resumoSelecionado.orcamento) : "-"}</strong>
                </div>
                <div>
                  <span>Custos</span>
                  <strong>{resumoSelecionado.totalCustos}</strong>
                </div>
                <div>
                  <span>Comprovantes</span>
                  <strong>{resumoSelecionado.comprovantes}</strong>
                </div>
              </div>

              <div className="button-row">
                {!eventoSelecionado.arquivado && eventoSelecionado.status !== "concluido" && (
                  <button type="button" className="button secondary" onClick={() => concluir(eventoSelecionado)}>
                    Marcar concluído
                  </button>
                )}
                {!eventoSelecionado.arquivado && (
                  <button type="button" className="button danger" onClick={() => arquivar(eventoSelecionado)}>
                    Arquivar no banco
                  </button>
                )}
                {eventoSelecionado.arquivado && (
                  <button type="button" className="button secondary" onClick={() => reabrir(eventoSelecionado)}>
                    Reabrir evento
                  </button>
                )}
              </div>

              <div className="table-wrap student-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Gasto</th>
                      <th>Área</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Comprovante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(eventoSelecionado.custos || []).map((custo) => {
                      const categoria = obterCategoria(custo.categoriaId, configuracoesEventos.categorias);
                      const comprovanteHref = custo.comprovanteUrl || custo.comprovanteArquivo?.dados || "";

                      return (
                        <tr key={custo.id}>
                          <td>{custo.descricao}</td>
                          <td>{categoria?.nome || "Categoria"}</td>
                          <td>{formatarData(custo.data)}</td>
                          <td>{formatarMoeda(custo.valor)}</td>
                          <td>
                            {comprovanteHref ? (
                              <a className="receipt-link" href={comprovanteHref} target="_blank" rel="noreferrer">
                                Abrir
                              </a>
                            ) : (
                              "Pendente"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="muted-text">Selecione uma aba com eventos para consultar o histórico.</p>
          )}
        </div>
      </section>
    </div>
  );
}
