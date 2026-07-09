import { useMemo, useState } from "react";

import { calcularResumoEvento, formatarData, formatarMoeda, obterTemaEvento } from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

const tarefaInicial = {
  titulo: "",
  responsavel: "",
  prazo: "",
  status: "pendente",
  observacoes: "",
};

function compararPrazo(a, b) {
  return String(a.prazo || "9999-12-31").localeCompare(String(b.prazo || "9999-12-31"));
}

function estaAtrasada(tarefa) {
  if (!tarefa.prazo || tarefa.status === "concluida") return false;
  return new Date(tarefa.prazo + "T23:59:59") < new Date();
}

function classeStatusTarefa(tarefa) {
  if (estaAtrasada(tarefa)) return "overdue";
  if (tarefa.status === "concluida") return "done";
  if (tarefa.status === "andamento") return "doing";
  return "pending";
}

export default function Cronograma() {
  const {
    eventosAtivos,
    carregandoEventos,
    eventoSelecionadoId,
    selecionarEvento,
    adicionarTarefa,
    atualizarTarefa,
    deletarTarefa,
  } = useSchoolData();
  const { mostrarFeedback } = useFeedback();
  const [tarefa, setTarefa] = useState(tarefaInicial);
  const [filtro, setFiltro] = useState("Todas");
  const [salvando, setSalvando] = useState(false);

  const eventoSelecionado = useMemo(
    () => eventosAtivos.find((evento) => String(evento.id) === String(eventoSelecionadoId)) || null,
    [eventoSelecionadoId, eventosAtivos],
  );
  const tema = obterTemaEvento(eventoSelecionado?.temaId);

  const tarefas = useMemo(() => {
    const lista = [...(eventoSelecionado?.tarefas || [])].sort(compararPrazo);

    if (filtro === "Pendentes") return lista.filter((item) => item.status === "pendente");
    if (filtro === "Em andamento") return lista.filter((item) => item.status === "andamento");
    if (filtro === "Concluídas") return lista.filter((item) => item.status === "concluida");
    if (filtro === "Atrasadas") return lista.filter(estaAtrasada);
    return lista;
  }, [eventoSelecionado?.tarefas, filtro]);

  const pendentes = (eventoSelecionado?.tarefas || []).filter((item) => item.status === "pendente").length;
  const andamento = (eventoSelecionado?.tarefas || []).filter((item) => item.status === "andamento").length;
  const concluidas = (eventoSelecionado?.tarefas || []).filter((item) => item.status === "concluida").length;
  const atrasadas = (eventoSelecionado?.tarefas || []).filter(estaAtrasada).length;

  async function cadastrarTarefa(event) {
    event.preventDefault();

    if (!eventoSelecionado) return;

    if (!tarefa.titulo.trim()) {
      mostrarFeedback("Informe o título da tarefa.", "erro");
      return;
    }

    try {
      setSalvando(true);
      await adicionarTarefa(eventoSelecionado.id, tarefa);
      setTarefa(tarefaInicial);
      mostrarFeedback("Tarefa adicionada ao cronograma.");
    } catch (error) {
      mostrarFeedback("Não foi possível adicionar a tarefa.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(tarefaItem, status) {
    if (!eventoSelecionado) return;

    try {
      await atualizarTarefa(eventoSelecionado.id, tarefaItem.id, { status });
      mostrarFeedback("Status da tarefa atualizado.");
    } catch (error) {
      mostrarFeedback("Não foi possível atualizar a tarefa.", "erro");
    }
  }

  async function excluir(tarefaItem) {
    if (!eventoSelecionado) return;

    try {
      await deletarTarefa(eventoSelecionado.id, tarefaItem.id);
      mostrarFeedback("Tarefa removida.");
    } catch (error) {
      mostrarFeedback("Não foi possível remover a tarefa.", "erro");
    }
  }

  if (carregandoEventos) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Cronograma</span>
            <h1>Cronograma</h1>
            <p>Carregando eventos salvos para escolher qual receberá tarefas.</p>
          </div>
        </header>

        <section className="empty-state">Carregando eventos...</section>
      </div>
    );
  }

  if (eventosAtivos.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Cronograma</span>
            <h1>Cronograma</h1>
            <p>Crie um evento para organizar tarefas, prazos e responsáveis.</p>
          </div>
        </header>

        <section className="empty-state">Nenhum evento ativo encontrado.</section>
      </div>
    );
  }

  if (!eventoSelecionado) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Escolha necessária</span>
            <h1>Cronograma</h1>
            <p>Selecione o evento que vai receber tarefas. A escolha fica salva nas próximas páginas.</p>
          </div>
        </header>

        <section className="event-picker-panel" data-tour="cronograma-evento">
          <div>
            <span className="pill">Primeiro passo</span>
            <h2>Qual evento vai receber o cronograma?</h2>
            <p>Depois de selecionar, você verá tarefas, prazos e responsáveis do evento.</p>
          </div>

          <div className="event-picker-grid">
            {eventosAtivos.map((evento) => {
              const temaEvento = obterTemaEvento(evento.temaId);
              const resumoEvento = calcularResumoEvento(evento);

              return (
                <button
                  key={evento.id}
                  type="button"
                  className="event-picker-card"
                  style={{ "--event-color": temaEvento.cor, "--event-soft": temaEvento.corSuave }}
                  onClick={() => selecionarEvento(evento.id)}
                >
                  <div className="event-picker-thumb" style={{ backgroundImage: evento.capaArquivo?.dados ? `url(${evento.capaArquivo.dados})` : undefined }}>
                    {!evento.capaArquivo?.dados && evento.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{evento.tipo}</span>
                  <strong>{evento.nome}</strong>
                  <small>{formatarData(evento.data)} · {formatarMoeda(resumoEvento.total)}</small>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="page themed-event-page"
      style={{ "--event-color": tema.cor, "--event-strong": tema.corForte, "--event-soft": tema.corSuave }}
    >
      <header className="page-header">
        <div>
          <span className="eyebrow">Execução</span>
          <h1>Cronograma</h1>
          <p>Organize tarefas, responsáveis e prazos para o evento selecionado.</p>
        </div>

        <div className="filter-row compact">
          <label>
            <span>Evento selecionado</span>
            <select
              value={eventoSelecionado.id}
              onChange={(event) => selecionarEvento(event.target.value)}
              data-tour="cronograma-evento"
            >
              {eventosAtivos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="selected-event-hero compact-hero">
        <div className="selected-event-cover" style={{ backgroundImage: eventoSelecionado.capaArquivo?.dados ? `url(${eventoSelecionado.capaArquivo.dados})` : undefined }}>
          {!eventoSelecionado.capaArquivo?.dados && <span>{eventoSelecionado.nome.slice(0, 2).toUpperCase()}</span>}
        </div>

        <div>
          <span className="pill light">{eventoSelecionado.tipo}</span>
          <h2>{eventoSelecionado.nome}</h2>
          <p>{formatarData(eventoSelecionado.data)} · {eventoSelecionado.responsavel || "Responsável não informado"}</p>
        </div>
      </section>

      <section className="metrics-grid" data-tour="cronograma-metricas">
        <article className="metric-card warning">
          <span>Pendentes</span>
          <strong>{pendentes}</strong>
          <p>Aguardando início</p>
        </article>

        <article className="metric-card">
          <span>Em andamento</span>
          <strong>{andamento}</strong>
          <p>Em execução</p>
        </article>

        <article className="metric-card success">
          <span>Concluídas</span>
          <strong>{concluidas}</strong>
          <p>Finalizadas</p>
        </article>

        <article className="metric-card danger">
          <span>Atrasadas</span>
          <strong>{atrasadas}</strong>
          <p>Prazo vencido</p>
        </article>
      </section>

      <section className="content-grid two-columns narrow-left">
        <form className="panel form-stack timeline-entry-panel" onSubmit={cadastrarTarefa} data-tour="cronograma-criar">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Nova etapa</span>
              <h2>Adicionar tarefa</h2>
              <p>O item será vinculado a {eventoSelecionado.nome}.</p>
            </div>
          </div>

          <label className="field-group">
            <span>Tarefa</span>
            <input
              type="text"
              value={tarefa.titulo}
              onChange={(event) => setTarefa({ ...tarefa, titulo: event.target.value })}
              placeholder="Ex.: Confirmar buffet"
              disabled={salvando}
            />
          </label>

          <label className="field-group">
            <span>Responsável</span>
            <input
              type="text"
              value={tarefa.responsavel}
              onChange={(event) => setTarefa({ ...tarefa, responsavel: event.target.value })}
              placeholder="Pessoa ou equipe"
              disabled={salvando}
            />
          </label>

          <div className="form-grid">
            <label className="field-group">
              <span>Prazo</span>
              <input
                type="date"
                value={tarefa.prazo}
                onChange={(event) => setTarefa({ ...tarefa, prazo: event.target.value })}
                disabled={salvando}
              />
            </label>

            <label className="field-group">
              <span>Status</span>
              <select
                value={tarefa.status}
                onChange={(event) => setTarefa({ ...tarefa, status: event.target.value })}
                disabled={salvando}
              >
                <option value="pendente">Pendente</option>
                <option value="andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </label>
          </div>

          <label className="field-group">
            <span>Observações</span>
            <textarea
              value={tarefa.observacoes}
              onChange={(event) => setTarefa({ ...tarefa, observacoes: event.target.value })}
              rows="4"
              placeholder="Detalhes da tarefa"
              disabled={salvando}
            />
          </label>

          <button type="submit" className="button primary large" disabled={salvando}>
            {salvando ? "Salvando..." : "Adicionar tarefa"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Lista</span>
              <h2>{tarefas.length} tarefas</h2>
            </div>

            <div className="segmented-control" data-tour="cronograma-filtros">
              {["Todas", "Pendentes", "Em andamento", "Concluídas", "Atrasadas"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filtro === item ? "active" : ""}
                  onClick={() => setFiltro(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="timeline-list" data-tour="cronograma-lista">
            {tarefas.length === 0 && (
              <div className="empty-state compact">Nenhuma tarefa encontrada.</div>
            )}

            {tarefas.map((item) => (
              <article className={"timeline-item task-" + classeStatusTarefa(item)} key={item.id}>
                <div>
                  <span className="eyebrow">{formatarData(item.prazo)}</span>
                  <h3>{item.titulo}</h3>
                  <p>{item.responsavel || "Sem responsável"} · {item.observacoes || "Sem observações"}</p>
                </div>

                <div className="timeline-actions">
                  <select value={item.status} onChange={(event) => mudarStatus(item, event.target.value)}>
                    <option value="pendente">Pendente</option>
                    <option value="andamento">Em andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                  <button type="button" className="button danger small" onClick={() => excluir(item)}>
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
