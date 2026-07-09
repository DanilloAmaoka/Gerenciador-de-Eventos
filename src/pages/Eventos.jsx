import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  EVENTO_TEMAS,
  TIPOS_EVENTO,
  calcularResumoEvento,
  escolherTemaPorIndice,
  formatarData,
  formatarMoeda,
  normalizarTexto,
  obterStatusEvento,
  obterTemaEvento,
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
  temaId: EVENTO_TEMAS[0].id,
  capaArquivo: null,
};

export default function Eventos() {
  const {
    eventos,
    carregandoEventos,
    adicionarEvento,
    concluirEvento,
    arquivarEvento,
    reabrirEvento,
    selecionarEvento,
    eventoSelecionadoId,
  } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const filtrosIniciais = useMemo(() => lerFiltrosEventos(), []);
  const [busca, setBusca] = useState(filtrosIniciais.busca);
  const [status, setStatus] = useState(filtrosIniciais.status);
  const [tipo, setTipo] = useState(filtrosIniciais.tipo);
  const [novoEvento, setNovoEvento] = useState(() => ({
    ...eventoInicial,
    temaId: escolherTemaPorIndice(Date.now()).id,
  }));
  const [eventoAbertoId, setEventoAbertoId] = useState(eventoSelecionadoId || "");
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

  function processarCapa(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) {
      setNovoEvento((valorAtual) => ({ ...valorAtual, capaArquivo: null }));
      return;
    }

    if (arquivo.size > 700000) {
      mostrarFeedback("A imagem de capa precisa ser menor. Use uma imagem comprimida.", "erro");
      event.target.value = "";
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      setNovoEvento((valorAtual) => ({
        ...valorAtual,
        capaArquivo: {
          nome: arquivo.name,
          tipo: arquivo.type,
          tamanho: arquivo.size,
          dados: leitor.result,
        },
      }));
    };
    leitor.readAsDataURL(arquivo);
  }

  async function cadastrarEvento(event) {
    event.preventDefault();

    if (!novoEvento.nome.trim()) {
      mostrarFeedback("Informe o nome do evento antes de criar.", "erro");
      return;
    }

    try {
      setSalvando(true);
      const eventoCriado = await adicionarEvento(novoEvento);
      setNovoEvento({
        ...eventoInicial,
        temaId: escolherTemaPorIndice(eventos.length + 1).id,
      });
      setEventoAbertoId(eventoCriado.id);
      selecionarEvento(eventoCriado.id);
      mostrarFeedback("Evento criado. Clique no card para ver ações e detalhes.");

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

  function abrirEvento(evento) {
    const jaAberto = eventoAbertoId === evento.id;
    setEventoAbertoId(jaAberto ? "" : evento.id);
    selecionarEvento(evento.id);
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
            Crie eventos com cor e capa. A lista mostra cartões destacados; as ações aparecem
            somente quando você abre um evento.
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
              <h2>Criar evento</h2>
              <p>Defina a identidade visual agora e detalhe os custos depois.</p>
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

          <label className="field-group">
            <span>Cor de destaque</span>
            <select
              value={novoEvento.temaId}
              onChange={(event) => setNovoEvento({ ...novoEvento, temaId: event.target.value })}
              disabled={salvando}
            >
              {EVENTO_TEMAS.map((tema) => (
                <option key={tema.id} value={tema.id}>
                  {tema.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="theme-swatch-row">
            {EVENTO_TEMAS.map((tema) => (
              <button
                key={tema.id}
                type="button"
                className={novoEvento.temaId === tema.id ? "theme-swatch active" : "theme-swatch"}
                style={{ background: tema.cor }}
                aria-label={tema.nome}
                onClick={() => setNovoEvento({ ...novoEvento, temaId: tema.id })}
              />
            ))}
          </div>

          <label className="field-group">
            <span>Imagem de capa opcional</span>
            <input type="file" accept="image/*" onChange={processarCapa} disabled={salvando} />
          </label>

          {novoEvento.capaArquivo && (
            <div className="cover-preview" style={{ backgroundImage: `url(${novoEvento.capaArquivo.dados})` }}>
              <span>{novoEvento.capaArquivo.nome}</span>
            </div>
          )}

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

        <div className="panel event-list-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Consulta</span>
              <h2>{eventosFiltrados.length} eventos encontrados</h2>
              <p>Clique em um card para abrir ações, detalhes e atalhos.</p>
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
            <div className="event-showcase-grid">
              {eventosFiltrados.length === 0 && (
                <div className="empty-state">Nenhum evento encontrado para estes filtros.</div>
              )}

              {eventosFiltrados.map((evento) => {
                const resumo = calcularResumoEvento(evento);
                const statusEvento = obterStatusEvento(evento.status);
                const tema = obterTemaEvento(evento.temaId);
                const aberto = eventoAbertoId === evento.id;
                const capa = evento.capaArquivo?.dados;

                return (
                  <article
                    className={aberto ? "event-showcase-card open" : "event-showcase-card"}
                    key={evento.id}
                    data-event-card={evento.id}
                    style={{ "--event-color": tema.cor, "--event-strong": tema.corForte, "--event-soft": tema.corSuave }}
                    onClick={() => abrirEvento(evento)}
                  >
                    <div className="event-cover" style={{ backgroundImage: capa ? `url(${capa})` : undefined }}>
                      {!capa && <span>{evento.nome.slice(0, 2).toUpperCase()}</span>}
                    </div>

                    <div className="event-showcase-main">
                      <div className="event-showcase-title">
                        <span className={"status-badge " + statusEvento.classe}>{statusEvento.nome}</span>
                        <h3>{evento.nome}</h3>
                        <p>{evento.tipo} · {formatarData(evento.data)}</p>
                      </div>

                      <strong>{formatarMoeda(resumo.total)}</strong>
                    </div>

                    <div className="event-card-meta">
                      <span>Responsável: {evento.responsavel || "Não informado"}</span>
                      <span>Local: {evento.local || "Opcional não definido"}</span>
                      <span>{resumo.totalCustos} custos registrados</span>
                      <span>{resumo.pendentesComprovante} sem comprovante</span>
                    </div>

                    <div className="budget-progress">
                      <div>
                        <span>{resumo.orcamentoAtivo ? "Orçamento" : "Sem orçamento"}</span>
                        <strong>{resumo.orcamentoAtivo ? resumo.percentual + "%" : "Livre"}</strong>
                      </div>
                      <div className="budget-bar">
                        <span style={{ width: resumo.orcamentoAtivo ? Math.min(100, resumo.percentual) + "%" : "0%" }} />
                      </div>
                      <small>
                        {resumo.orcamentoAtivo
                          ? (resumo.restante >= 0 ? "Restam " : "Excedeu ") + formatarMoeda(Math.abs(resumo.restante))
                          : "Os custos serão acompanhados sem comparação."}
                      </small>
                    </div>

                    {aberto && (
                      <div className="event-expanded-actions" onClick={(event) => event.stopPropagation()}>
                        {!evento.arquivado && (
                          <NavLink
                            className="event-action-button primary-action"
                            to={"/custos?evento=" + evento.id}
                            onClick={() => selecionarEvento(evento.id)}
                          >
                            <span>Custos</span>
                            <strong>Abrir custos</strong>
                          </NavLink>
                        )}

                        {!evento.arquivado && (
                          <NavLink
                            className="event-action-button"
                            to="/cronograma"
                            onClick={() => selecionarEvento(evento.id)}
                          >
                            <span>Agenda</span>
                            <strong>Cronograma</strong>
                          </NavLink>
                        )}

                        {!evento.arquivado && evento.status !== "concluido" && (
                          <button type="button" className="event-action-button" onClick={() => concluir(evento)}>
                            <span>Status</span>
                            <strong>Concluir</strong>
                          </button>
                        )}

                        {!evento.arquivado && (
                          <button type="button" className="event-action-button danger-action" onClick={() => arquivar(evento)}>
                            <span>Histórico</span>
                            <strong>Arquivar</strong>
                          </button>
                        )}

                        {evento.arquivado && (
                          <button type="button" className="event-action-button primary-action" onClick={() => reabrir(evento)}>
                            <span>Edição</span>
                            <strong>Reabrir</strong>
                          </button>
                        )}
                      </div>
                    )}
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
