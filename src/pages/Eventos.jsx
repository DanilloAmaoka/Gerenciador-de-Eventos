import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  TIPOS_EVENTO,
  calcularResumoEvento,
  formatarData,
  formatarMoeda,
  normalizarTexto,
  obterStatusEvento,
} from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

const FILTROS_EVENTOS_KEY = "gerenciador-eventos:filtros-eventos";

function lerFiltrosEventos() {
  const padrao = { busca: "", status: "Todos", tipo: "Todos" };

  try {
    const salvo = JSON.parse(window.localStorage.getItem(FILTROS_EVENTOS_KEY) || "null");
    return { ...padrao, ...(salvo || {}) };
  } catch (error) {
    return padrao;
  }
}

function salvarFiltrosEventos(filtros) {
  try {
    window.localStorage.setItem(FILTROS_EVENTOS_KEY, JSON.stringify(filtros));
  } catch (error) {
    // A consulta continua funcionando mesmo quando o navegador bloqueia o armazenamento local.
  }
}

const eventoInicial = {
  nome: "",
  tipo: "Outro",
  data: "",
  responsavel: "",
  local: "",
  descricao: "",
  orcamentoAtivo: false,
  orcamento: "",
};

export default function Eventos() {
  const {
    eventos,
    carregandoEventos,
    adicionarEvento,
    concluirEvento,
    arquivarEvento,
    reabrirEvento,
  } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const filtrosIniciais = useMemo(() => lerFiltrosEventos(), []);
  const [busca, setBusca] = useState(filtrosIniciais.busca);
  const [status, setStatus] = useState(filtrosIniciais.status);
  const [tipo, setTipo] = useState(filtrosIniciais.tipo);
  const [novoEvento, setNovoEvento] = useState(eventoInicial);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    salvarFiltrosEventos({ busca, status, tipo });
  }, [busca, status, tipo]);

  const eventosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return eventos.filter((evento) => {
      const buscaValida = !termo || normalizarTexto(evento.nome + " " + evento.responsavel + " " + evento.local).includes(termo);
      const statusValido = status === "Todos" || evento.status === status;
      const tipoValido = tipo === "Todos" || evento.tipo === tipo;

      return buscaValida && statusValido && tipoValido;
    });
  }, [busca, eventos, status, tipo]);

  const eventosAtivos = eventos.filter((evento) => !evento.arquivado).length;
  const eventosConcluidos = eventos.filter((evento) => evento.status === "concluido").length;
  const eventosArquivados = eventos.filter((evento) => evento.arquivado).length;

  async function cadastrarEvento(event) {
    event.preventDefault();

    if (!novoEvento.nome.trim()) {
      mostrarFeedback("Informe o nome do evento antes de criar.", "erro");
      return;
    }

    try {
      setSalvando(true);
      const eventoCriado = await adicionarEvento(novoEvento);
      setNovoEvento(eventoInicial);
      mostrarFeedback("Evento criado vazio. Agora selecione as partes que deseja detalhar.");

      window.history.replaceState(null, "", "/eventos");
      window.setTimeout(() => {
        const card = document.querySelector(`[data-event-card="${eventoCriado.id}"]`);
        card?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    } catch (error) {
      mostrarFeedback("Não foi possível criar o evento.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function concluir(evento) {
    const confirmado = await pedirConfirmacao({
      titulo: "Marcar como concluído",
      mensagem: "Deseja marcar " + evento.nome + " como concluído? Ele continuará visível até ser arquivado.",
      textoConfirmar: "Concluir",
    });

    if (!confirmado) return;

    try {
      await concluirEvento(evento.id);
      mostrarFeedback("Evento marcado como concluído.");
    } catch (error) {
      mostrarFeedback("Não foi possível concluir o evento.", "erro");
    }
  }

  async function arquivar(evento) {
    const confirmado = await pedirConfirmacao({
      titulo: "Arquivar evento",
      mensagem: "Deseja arquivar " + evento.nome + "? Ele ficará guardado para consultas futuras.",
      textoConfirmar: "Arquivar",
      perigo: true,
    });

    if (!confirmado) return;

    try {
      await arquivarEvento(evento.id);
      mostrarFeedback("Evento arquivado no banco de dados.");
    } catch (error) {
      mostrarFeedback("Não foi possível arquivar o evento.", "erro");
    }
  }

  async function reabrir(evento) {
    try {
      await reabrirEvento(evento.id);
      mostrarFeedback("Evento reaberto para edição.");
    } catch (error) {
      mostrarFeedback("Não foi possível reabrir o evento.", "erro");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Cadastro</span>
          <h1>Eventos</h1>
          <p>
            Crie eventos vazios e detalhe somente o que fizer sentido: local, alimentação,
            decoração, envolvidos, orçamento, tarefas e custos.
          </p>
        </div>
      </header>

      <section className="metrics-grid">
        <article className="metric-card">
          <span>Total cadastrado</span>
          <strong>{eventos.length}</strong>
          <p>Todos os registros</p>
        </article>
        <article className="metric-card success">
          <span>Ativos</span>
          <strong>{eventosAtivos}</strong>
          <p>Planejamento ou execução</p>
        </article>
        <article className="metric-card warning">
          <span>Concluídos</span>
          <strong>{eventosConcluidos}</strong>
          <p>Prontos para arquivar</p>
        </article>
        <article className="metric-card">
          <span>Arquivados</span>
          <strong>{eventosArquivados}</strong>
          <p>Histórico consultável</p>
        </article>
      </section>

      <section className="content-grid two-columns narrow-left">
        <form className="panel form-stack" onSubmit={cadastrarEvento} data-tour="evento-criar">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Novo registro</span>
              <h2>Criar evento vazio</h2>
              <p>Depois de criar, você escolhe quais áreas serão usadas.</p>
            </div>
          </div>

          <label className="field-group">
            <span>Nome do evento</span>
            <input
              type="text"
              value={novoEvento.nome}
              onChange={(event) => setNovoEvento({ ...novoEvento, nome: event.target.value })}
              placeholder="Ex.: Feira Cultural 2026"
              data-tour="evento-nome"
              disabled={salvando}
            />
          </label>

          <div className="form-grid">
            <label className="field-group">
              <span>Tipo</span>
              <select
                value={novoEvento.tipo}
                onChange={(event) => setNovoEvento({ ...novoEvento, tipo: event.target.value })}
                disabled={salvando}
              >
                {TIPOS_EVENTO.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Data prevista</span>
              <input
                type="date"
                value={novoEvento.data}
                onChange={(event) => setNovoEvento({ ...novoEvento, data: event.target.value })}
                disabled={salvando}
              />
            </label>
          </div>

          <label className="field-group">
            <span>Responsável</span>
            <input
              type="text"
              value={novoEvento.responsavel}
              onChange={(event) => setNovoEvento({ ...novoEvento, responsavel: event.target.value })}
              placeholder="Pessoa ou equipe responsável"
              disabled={salvando}
            />
          </label>

          <label className="field-group">
            <span>Local inicial opcional</span>
            <input
              type="text"
              value={novoEvento.local}
              onChange={(event) => setNovoEvento({ ...novoEvento, local: event.target.value })}
              placeholder="Pode deixar em branco"
              disabled={salvando}
            />
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              checked={novoEvento.orcamentoAtivo}
              onChange={(event) => setNovoEvento({ ...novoEvento, orcamentoAtivo: event.target.checked })}
              disabled={salvando}
            />
            <span>Adicionar orçamento inicial</span>
          </label>

          {novoEvento.orcamentoAtivo && (
            <label className="field-group">
              <span>Valor do orçamento</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={novoEvento.orcamento}
                onChange={(event) => setNovoEvento({ ...novoEvento, orcamento: event.target.value })}
                placeholder="0,00"
                disabled={salvando}
              />
            </label>
          )}

          <label className="field-group">
            <span>Descrição rápida</span>
            <textarea
              value={novoEvento.descricao}
              onChange={(event) => setNovoEvento({ ...novoEvento, descricao: event.target.value })}
              placeholder="Objetivo, público, observações iniciais..."
              rows="4"
              disabled={salvando}
            />
          </label>

          <button
            type="submit"
            className="button primary full-width"
            data-tour="evento-cadastrar"
            disabled={salvando}
          >
            {salvando ? "Criando..." : "Criar evento"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Consulta</span>
              <h2>{eventosFiltrados.length} eventos encontrados</h2>
            </div>
          </div>

          <div className="filter-row" data-tour="eventos-filtros">
            <label>
              <span>Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Nome, responsável ou local"
              />
            </label>

            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>Todos</option>
                <option value="planejamento">Planejamento</option>
                <option value="em-andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </label>

            <label>
              <span>Tipo</span>
              <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
                <option>Todos</option>
                {TIPOS_EVENTO.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          {carregandoEventos ? (
            <p className="muted-text">Carregando eventos do banco...</p>
          ) : (
            <div className="event-card-grid">
              {eventosFiltrados.length === 0 && (
                <div className="empty-state">Nenhum evento encontrado para estes filtros.</div>
              )}

              {eventosFiltrados.map((evento) => {
                const resumo = calcularResumoEvento(evento);
                const statusEvento = obterStatusEvento(evento.status);

                return (
                  <article className="event-card" key={evento.id} data-event-card={evento.id}>
                    <div className="event-card-header">
                      <div>
                        <span className={"status-badge " + statusEvento.classe}>{statusEvento.nome}</span>
                        <h3>{evento.nome}</h3>
                        <p>{evento.tipo} · {formatarData(evento.data)}</p>
                      </div>
                      <strong>{formatarMoeda(resumo.total)}</strong>
                    </div>

                    <div className="event-card-meta">
                      <span>Responsável: {evento.responsavel || "Não informado"}</span>
                      <span>Local: {evento.local || "Opcional não definido"}</span>
                      <span>{evento.categoriasAtivas?.length || 0} áreas selecionadas</span>
                      <span>{resumo.totalCustos} custos · {resumo.pendentesComprovante} sem comprovante</span>
                    </div>

                    {resumo.orcamentoAtivo ? (
                      <div className="budget-progress">
                        <div>
                          <span>Orçamento</span>
                          <strong>{resumo.percentual}%</strong>
                        </div>
                        <div className="budget-bar">
                          <span style={{ width: Math.min(100, resumo.percentual) + "%" }} />
                        </div>
                        <small>
                          {resumo.restante >= 0 ? "Restam " : "Excedeu "}
                          {formatarMoeda(Math.abs(resumo.restante))}
                        </small>
                      </div>
                    ) : (
                      <div className="notice-inline">Sem orçamento definido. Os custos serão acompanhados sem comparação.</div>
                    )}

                    <div className="button-row">
                      {!evento.arquivado && (
                        <NavLink className="button primary small" to={"/custos?evento=" + evento.id}>
                          Abrir custos
                        </NavLink>
                      )}

                      {!evento.arquivado && evento.status !== "concluido" && (
                        <button type="button" className="button secondary small" onClick={() => concluir(evento)}>
                          Concluir
                        </button>
                      )}

                      {!evento.arquivado && (
                        <button type="button" className="button danger small" onClick={() => arquivar(evento)}>
                          Arquivar
                        </button>
                      )}

                      {evento.arquivado && (
                        <button type="button" className="button secondary small" onClick={() => reabrir(evento)}>
                          Reabrir
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
