import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FORMAS_PAGAMENTO,
  calcularResumoEvento,
  despesasPorCategoria,
  formatarData,
  formatarMoeda,
  obterCategoria,
  obterCorCategoria,
  obterTemaEvento,
} from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

const custoInicial = {
  categoriaId: "",
  descricao: "",
  fornecedor: "",
  valor: "",
  data: "",
  formaPagamento: "Pix",
  comprovanteUrl: "",
  observacoes: "",
};

const envolvidoInicial = {
  nome: "",
  papel: "",
  contato: "",
  observacoes: "",
};

const coresEnvolvidos = ["#7c3aed", "#2563eb", "#0f766e", "#db2777", "#b45309", "#15803d"];

function lerEventoDaUrl(search) {
  return new URLSearchParams(search).get("evento") || "";
}

function ordenarCustos(custos = []) {
  return [...custos].sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

function criarCustoEditavel(custo) {
  return {
    categoriaId: custo.categoriaId || "",
    descricao: custo.descricao || "",
    fornecedor: custo.fornecedor || "",
    valor: custo.valor || "",
    data: custo.data || "",
    formaPagamento: custo.formaPagamento || "Pix",
    comprovanteUrl: custo.comprovanteUrl || "",
    observacoes: custo.observacoes || "",
  };
}

function criarEnvolvidoEditavel(envolvido) {
  return {
    nome: envolvido.nome || "",
    papel: envolvido.papel || "",
    contato: envolvido.contato || "",
    observacoes: envolvido.observacoes || "",
  };
}

export default function Custos() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    eventosAtivos,
    carregandoEventos,
    configuracoesEventos,
    eventoSelecionadoId,
    selecionarEvento,
    salvarEvento,
    adicionarCusto,
    atualizarCusto,
    deletarCusto,
    adicionarEnvolvido,
    atualizarEnvolvido,
    removerEnvolvido,
  } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const eventoUrl = lerEventoDaUrl(location.search);
  const [seletorEventosAberto, setSeletorEventosAberto] = useState(false);
  const [detalhes, setDetalhes] = useState({
    local: "",
    responsavel: "",
    data: "",
    descricao: "",
    observacoes: "",
    orcamentoAtivo: false,
    orcamento: "",
    status: "planejamento",
  });
  const [custo, setCusto] = useState(custoInicial);
  const [custoAbertoId, setCustoAbertoId] = useState("");
  const [custoEditando, setCustoEditando] = useState(null);
  const [envolvido, setEnvolvido] = useState(envolvidoInicial);
  const [envolvidoAbertoId, setEnvolvidoAbertoId] = useState("");
  const [envolvidoEditando, setEnvolvidoEditando] = useState(null);
  const [comprovanteNovoArquivo, setComprovanteNovoArquivo] = useState(null);
  const [comprovanteEdicaoArquivo, setComprovanteEdicaoArquivo] = useState(null);
  const [salvandoDetalhes, setSalvandoDetalhes] = useState(false);
  const [salvandoCusto, setSalvandoCusto] = useState(false);
  const [salvandoEdicaoCusto, setSalvandoEdicaoCusto] = useState(false);
  const [salvandoEnvolvido, setSalvandoEnvolvido] = useState(false);
  const [salvandoEdicaoEnvolvido, setSalvandoEdicaoEnvolvido] = useState(false);

  useEffect(() => {
    if (!eventoUrl) return;
    const eventoExiste = eventosAtivos.some((evento) => String(evento.id) === String(eventoUrl));
    if (eventoExiste) selecionarEvento(eventoUrl);
  }, [eventoUrl, eventosAtivos, selecionarEvento]);

  const eventoSelecionado = useMemo(
    () => eventosAtivos.find((evento) => String(evento.id) === String(eventoSelecionadoId)) || null,
    [eventoSelecionadoId, eventosAtivos],
  );

  useEffect(() => {
    if (!eventoSelecionado) return;

    setDetalhes({
      local: eventoSelecionado.local || "",
      responsavel: eventoSelecionado.responsavel || "",
      data: eventoSelecionado.data || "",
      descricao: eventoSelecionado.descricao || "",
      observacoes: eventoSelecionado.observacoes || "",
      orcamentoAtivo: Boolean(eventoSelecionado.orcamentoAtivo),
      orcamento: eventoSelecionado.orcamento || "",
      status: eventoSelecionado.status || "planejamento",
    });

    setCusto({
      ...custoInicial,
      categoriaId: configuracoesEventos.categorias[0]?.id || "",
    });
    fecharEdicaoCusto();
    fecharEdicaoEnvolvido();
    setSeletorEventosAberto(false);
  }, [eventoSelecionado?.id, configuracoesEventos.categorias]);

  const resumo = eventoSelecionado ? calcularResumoEvento(eventoSelecionado) : null;
  const tema = obterTemaEvento(eventoSelecionado?.temaId);
  const custosOrdenados = ordenarCustos(eventoSelecionado?.custos);
  const envolvidos = eventoSelecionado?.envolvidos || [];
  const categoriasComTotal = eventoSelecionado
    ? despesasPorCategoria([eventoSelecionado], configuracoesEventos.categorias).filter((categoria) => categoria.total > 0)
    : [];
  const maiorTotalCategoria = Math.max(1, ...categoriasComTotal.map((categoria) => categoria.total));

  function escolherEvento(eventoId) {
    selecionarEvento(eventoId);
    setSeletorEventosAberto(false);
    const params = new URLSearchParams(location.search);
    params.set("evento", eventoId);
    navigate({ pathname: "/custos", search: params.toString() }, { replace: true });
  }

  function alternarSeletorPorTeclado(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setSeletorEventosAberto((aberto) => !aberto);
  }

  function limparFormularioCusto() {
    setCusto({
      ...custoInicial,
      categoriaId: configuracoesEventos.categorias[0]?.id || "",
    });
    setComprovanteNovoArquivo(null);

    const inputArquivo = document.querySelector("[data-new-receipt-file='true']");
    if (inputArquivo) inputArquivo.value = "";
  }

  function fecharEdicaoCusto() {
    setCustoAbertoId("");
    setCustoEditando(null);
    setComprovanteEdicaoArquivo(null);
  }

  function fecharEdicaoEnvolvido() {
    setEnvolvidoAbertoId("");
    setEnvolvidoEditando(null);
  }

  async function salvarDetalhes() {
    if (!eventoSelecionado) return;

    try {
      setSalvandoDetalhes(true);
      await salvarEvento(eventoSelecionado.id, {
        local: detalhes.local,
        responsavel: detalhes.responsavel,
        data: detalhes.data,
        descricao: detalhes.descricao,
        observacoes: detalhes.observacoes,
        orcamentoAtivo: detalhes.orcamentoAtivo,
        orcamento: detalhes.orcamentoAtivo ? Number(detalhes.orcamento) || 0 : 0,
        status: detalhes.status,
      });
      mostrarFeedback("Detalhes do evento salvos.");
    } catch (error) {
      mostrarFeedback("Não foi possível salvar os detalhes.", "erro");
    } finally {
      setSalvandoDetalhes(false);
    }
  }

  function lerComprovante(event, atualizarArquivo) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) {
      atualizarArquivo(null);
      return;
    }

    if (arquivo.size > 350000) {
      mostrarFeedback("O arquivo é grande para esta versão. Use um link de comprovante ou compacte a imagem.", "erro");
      event.target.value = "";
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      atualizarArquivo({
        nome: arquivo.name,
        tipo: arquivo.type,
        tamanho: arquivo.size,
        dados: leitor.result,
      });
    };
    leitor.readAsDataURL(arquivo);
  }

  function abrirCusto(custoItem) {
    const jaAberto = custoAbertoId === custoItem.id;

    if (jaAberto) {
      fecharEdicaoCusto();
      return;
    }

    setCustoAbertoId(custoItem.id);
    setCustoEditando(criarCustoEditavel(custoItem));
    setComprovanteEdicaoArquivo(custoItem.comprovanteArquivo || null);
  }

  async function salvarNovoCusto(event) {
    event.preventDefault();

    if (!eventoSelecionado) return;

    if (!custo.categoriaId) {
      mostrarFeedback("Selecione a área do custo.", "erro");
      return;
    }

    if (!custo.descricao.trim()) {
      mostrarFeedback("Descreva no que foi gasto.", "erro");
      return;
    }

    if (Number(custo.valor) <= 0) {
      mostrarFeedback("Informe um valor maior que zero.", "erro");
      return;
    }

    try {
      setSalvandoCusto(true);
      await adicionarCusto(eventoSelecionado.id, {
        ...custo,
        data: custo.data || new Date().toISOString().slice(0, 10),
        comprovanteArquivo: comprovanteNovoArquivo,
      });
      limparFormularioCusto();
      mostrarFeedback("Custo registrado no evento.");
    } catch (error) {
      mostrarFeedback("Não foi possível salvar o custo.", "erro");
    } finally {
      setSalvandoCusto(false);
    }
  }

  async function salvarEdicaoCusto(event, custoId) {
    event.preventDefault();

    if (!eventoSelecionado || !custoEditando) return;

    if (!custoEditando.categoriaId) {
      mostrarFeedback("Selecione a área do custo.", "erro");
      return;
    }

    if (!custoEditando.descricao.trim()) {
      mostrarFeedback("Descreva no que foi gasto.", "erro");
      return;
    }

    if (Number(custoEditando.valor) <= 0) {
      mostrarFeedback("Informe um valor maior que zero.", "erro");
      return;
    }

    try {
      setSalvandoEdicaoCusto(true);
      await atualizarCusto(eventoSelecionado.id, custoId, {
        ...custoEditando,
        data: custoEditando.data || new Date().toISOString().slice(0, 10),
        comprovanteArquivo: comprovanteEdicaoArquivo,
      });
      mostrarFeedback("Custo atualizado.");
    } catch (error) {
      mostrarFeedback("Não foi possível atualizar o custo.", "erro");
    } finally {
      setSalvandoEdicaoCusto(false);
    }
  }

  async function excluirCusto(custoItem) {
    if (!eventoSelecionado) return;

    const confirmado = await pedirConfirmacao({
      titulo: "Deletar custo",
      mensagem: "Deseja deletar o custo " + custoItem.descricao + "?",
      textoConfirmar: "Deletar",
      perigo: true,
    });

    if (!confirmado) return;

    try {
      await deletarCusto(eventoSelecionado.id, custoItem.id);
      fecharEdicaoCusto();
      mostrarFeedback("Custo removido.");
    } catch (error) {
      mostrarFeedback("Não foi possível remover o custo.", "erro");
    }
  }

  async function cadastrarEnvolvido(event) {
    event.preventDefault();

    if (!eventoSelecionado) return;

    if (!envolvido.nome.trim()) {
      mostrarFeedback("Informe o nome do envolvido.", "erro");
      return;
    }

    try {
      setSalvandoEnvolvido(true);
      await adicionarEnvolvido(eventoSelecionado.id, envolvido);
      setEnvolvido(envolvidoInicial);
      mostrarFeedback("Envolvido adicionado ao evento.");
    } catch (error) {
      mostrarFeedback("Não foi possível adicionar o envolvido.", "erro");
    } finally {
      setSalvandoEnvolvido(false);
    }
  }

  function abrirEnvolvido(envolvidoItem) {
    const jaAberto = envolvidoAbertoId === envolvidoItem.id;

    if (jaAberto) {
      fecharEdicaoEnvolvido();
      return;
    }

    setEnvolvidoAbertoId(envolvidoItem.id);
    setEnvolvidoEditando(criarEnvolvidoEditavel(envolvidoItem));
  }

  async function salvarEdicaoEnvolvido(event, envolvidoId) {
    event.preventDefault();

    if (!eventoSelecionado || !envolvidoEditando) return;

    if (!envolvidoEditando.nome.trim()) {
      mostrarFeedback("Informe o nome do envolvido.", "erro");
      return;
    }

    try {
      setSalvandoEdicaoEnvolvido(true);
      await atualizarEnvolvido(eventoSelecionado.id, envolvidoId, envolvidoEditando);
      mostrarFeedback("Envolvido atualizado.");
    } catch (error) {
      mostrarFeedback("Não foi possível atualizar o envolvido.", "erro");
    } finally {
      setSalvandoEdicaoEnvolvido(false);
    }
  }

  async function excluirEnvolvido(envolvidoItem) {
    if (!eventoSelecionado) return;

    try {
      await removerEnvolvido(eventoSelecionado.id, envolvidoItem.id);
      fecharEdicaoEnvolvido();
      mostrarFeedback("Envolvido removido.");
    } catch (error) {
      mostrarFeedback("Não foi possível remover o envolvido.", "erro");
    }
  }

  if (carregandoEventos) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Custos</span>
            <h1>Custos</h1>
            <p>Carregando eventos salvos para escolher qual será gerenciado.</p>
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
            <span className="eyebrow">Custos</span>
            <h1>Custos</h1>
            <p>Crie um evento antes de lançar gastos, comprovantes e envolvidos.</p>
          </div>
        </header>

        <section className="empty-state">
          Nenhum evento ativo encontrado. Vá para Eventos e crie o primeiro registro vazio.
        </section>
      </div>
    );
  }

  if (!eventoSelecionado) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <span className="eyebrow">Escolha necessária</span>
            <h1>Custos</h1>
            <p>Selecione o evento que você quer gerenciar. As opções de custos aparecem depois disso.</p>
          </div>
        </header>

        <section className="event-picker-panel" data-tour="custos-evento">
          <div>
            <span className="pill">Primeiro passo</span>
            <h2>Qual evento vai receber custos?</h2>
            <p>Essa escolha fica salva para Custos, Cronograma e outras páginas.</p>
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
                  onClick={() => escolherEvento(evento.id)}
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
          <span className="eyebrow">Organização financeira</span>
          <h1>Custos</h1>
          <p>O foco aqui é lançar, revisar e editar os gastos do evento selecionado.</p>
        </div>
      </header>

      <section
        className={seletorEventosAberto ? "selected-event-hero selector-hero open" : "selected-event-hero selector-hero"}
        data-tour="custos-evento"
        role="button"
        tabIndex="0"
        onClick={() => setSeletorEventosAberto((aberto) => !aberto)}
        onKeyDown={alternarSeletorPorTeclado}
        aria-expanded={seletorEventosAberto}
      >
        <div className="selected-event-cover" style={{ backgroundImage: eventoSelecionado.capaArquivo?.dados ? `url(${eventoSelecionado.capaArquivo.dados})` : undefined }}>
          {!eventoSelecionado.capaArquivo?.dados && <span>{eventoSelecionado.nome.slice(0, 2).toUpperCase()}</span>}
        </div>

        <div>
          <span className="pill light">{eventoSelecionado.tipo}</span>
          <h2>{eventoSelecionado.nome}</h2>
          <p>{formatarData(eventoSelecionado.data)} · {eventoSelecionado.local || "Local ainda não definido"}</p>
          <span className="hero-click-hint">Clique neste card para trocar o evento</span>
        </div>

        <div className="selected-event-total">
          <span>Gasto total</span>
          <strong>{formatarMoeda(resumo.total)}</strong>
          <small>{resumo.orcamentoAtivo ? resumo.percentual + "% do orçamento" : "Sem orçamento definido"}</small>
        </div>
      </section>

      {seletorEventosAberto && (
        <section className="event-switcher-panel" data-tour="custos-seletor">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Trocar evento</span>
              <h2>Escolha outro evento ativo</h2>
              <p>A seleção fica salva para as demais páginas do gerenciador.</p>
            </div>
          </div>

          <div className="event-switcher-grid">
            {eventosAtivos.map((evento) => {
              const temaEvento = obterTemaEvento(evento.temaId);
              const resumoEvento = calcularResumoEvento(evento);
              const selecionado = String(evento.id) === String(eventoSelecionado.id);

              return (
                <button
                  key={evento.id}
                  type="button"
                  className={selecionado ? "event-switcher-card selected" : "event-switcher-card"}
                  style={{ "--event-color": temaEvento.cor, "--event-soft": temaEvento.corSuave }}
                  onClick={() => escolherEvento(evento.id)}
                >
                  <div className="event-switcher-thumb" style={{ backgroundImage: evento.capaArquivo?.dados ? `url(${evento.capaArquivo.dados})` : undefined }}>
                    {!evento.capaArquivo?.dados && evento.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{evento.nome}</strong>
                    <span>{evento.tipo} · {formatarMoeda(resumoEvento.total)}</span>
                  </div>
                  {selecionado && <em>Atual</em>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="metrics-grid">
        <article className="metric-card">
          <span>Custos registrados</span>
          <strong>{resumo.totalCustos}</strong>
          <p>Itens lançados</p>
        </article>

        <article className="metric-card success">
          <span>Comprovantes</span>
          <strong>{resumo.comprovantes}</strong>
          <p>Anexados ou vinculados</p>
        </article>

        <article className="metric-card warning">
          <span>Sem comprovante</span>
          <strong>{resumo.pendentesComprovante}</strong>
          <p>Itens para revisar</p>
        </article>

        <article className={resumo.percentual > 100 ? "metric-card danger" : "metric-card"}>
          <span>Uso do orçamento</span>
          <strong>{resumo.orcamentoAtivo ? resumo.percentual + "%" : "-"}</strong>
          <p>{resumo.orcamentoAtivo ? formatarMoeda(resumo.orcamento) : "Sem orçamento"}</p>
        </article>
      </section>

      <section className="cost-focus-layout">
        <form className="panel cost-entry-panel cost-priority-panel form-stack" onSubmit={salvarNovoCusto} data-tour="custos-lancar">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Prioridade</span>
              <h2>Lançar gasto</h2>
              <p>Registre o gasto assim que ele acontecer, com área, data e comprovante.</p>
            </div>
          </div>

          <label className="field-group">
            <span>Área do custo</span>
            <select
              value={custo.categoriaId}
              onChange={(event) => setCusto({ ...custo, categoriaId: event.target.value })}
            >
              <option value="">Selecione</option>
              {configuracoesEventos.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>No que foi gasto?</span>
            <input
              type="text"
              value={custo.descricao}
              onChange={(event) => setCusto({ ...custo, descricao: event.target.value })}
              placeholder="Ex.: Entrada do buffet"
              disabled={salvandoCusto}
            />
          </label>

          <div className="form-grid">
            <label className="field-group">
              <span>Valor</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={custo.valor}
                onChange={(event) => setCusto({ ...custo, valor: event.target.value })}
                placeholder="0,00"
                disabled={salvandoCusto}
              />
            </label>

            <label className="field-group">
              <span>Quando</span>
              <input
                type="date"
                value={custo.data}
                onChange={(event) => setCusto({ ...custo, data: event.target.value })}
                disabled={salvandoCusto}
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field-group">
              <span>Fornecedor ou pessoa</span>
              <input
                type="text"
                value={custo.fornecedor}
                onChange={(event) => setCusto({ ...custo, fornecedor: event.target.value })}
                placeholder="Nome do fornecedor"
                disabled={salvandoCusto}
              />
            </label>

            <label className="field-group">
              <span>Forma de pagamento</span>
              <select
                value={custo.formaPagamento}
                onChange={(event) => setCusto({ ...custo, formaPagamento: event.target.value })}
                disabled={salvandoCusto}
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma}>{forma}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-group">
            <span>Link do comprovante</span>
            <input
              type="url"
              value={custo.comprovanteUrl}
              onChange={(event) => setCusto({ ...custo, comprovanteUrl: event.target.value })}
              placeholder="https://..."
              disabled={salvandoCusto}
            />
          </label>

          <label className="field-group">
            <span>Arquivo do comprovante pequeno</span>
            <input
              type="file"
              accept="image/*,.pdf"
              data-new-receipt-file="true"
              onChange={(event) => lerComprovante(event, setComprovanteNovoArquivo)}
              disabled={salvandoCusto}
            />
          </label>

          {comprovanteNovoArquivo && (
            <div className="notice-inline">Arquivo pronto: {comprovanteNovoArquivo.nome}</div>
          )}

          <label className="field-group">
            <span>Observações</span>
            <textarea
              value={custo.observacoes}
              onChange={(event) => setCusto({ ...custo, observacoes: event.target.value })}
              rows="3"
              placeholder="Parcelas, vencimento, negociação..."
              disabled={salvandoCusto}
            />
          </label>

          <button type="submit" className="button primary large" disabled={salvandoCusto}>
            {salvandoCusto ? "Salvando..." : "Adicionar custo"}
          </button>
        </form>

        <div className="panel cost-chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Distribuição</span>
              <h2>Custos por área</h2>
              <p>Somatória geral: {formatarMoeda(resumo.total)}</p>
            </div>
          </div>

          <div className="chart-total-card">
            <span>Total registrado</span>
            <strong>{formatarMoeda(resumo.total)}</strong>
            <small>{categoriasComTotal.length} áreas com gasto</small>
          </div>

          <div className="category-chart">
            {categoriasComTotal.length === 0 && (
              <div className="empty-state compact">Lance custos para ver o gráfico.</div>
            )}

            {categoriasComTotal.map((categoria) => (
              <div className="category-chart-row" key={categoria.id}>
                <div>
                  <span style={{ background: obterCorCategoria(categoria.id) }} />
                  <strong>{categoria.nome}</strong>
                  <em>{formatarMoeda(categoria.total)}</em>
                </div>
                <div className="category-chart-bar">
                  <span
                    style={{
                      width: Math.max(8, (categoria.total / maiorTotalCategoria) * 100) + "%",
                      background: obterCorCategoria(categoria.id),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel cost-section-panel" data-tour="custos-lista">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Extrato do evento</span>
            <h2>Custos registrados</h2>
            <p>Clique em um custo para abrir detalhes, editar dados e ver comprovantes.</p>
          </div>

          <div className="section-total-pill">
            <span>Total em custos</span>
            <strong>{formatarMoeda(resumo.total)}</strong>
          </div>
        </div>

        <div className="cost-card-list">
          {custosOrdenados.length === 0 && (
            <div className="empty-state compact">Nenhum custo registrado ainda.</div>
          )}

          {custosOrdenados.map((item) => {
            const categoria = obterCategoria(item.categoriaId, configuracoesEventos.categorias);
            const corCategoria = obterCorCategoria(item.categoriaId);
            const aberto = custoAbertoId === item.id;
            const comprovanteHref = aberto
              ? custoEditando?.comprovanteUrl || comprovanteEdicaoArquivo?.dados || item.comprovanteUrl || item.comprovanteArquivo?.dados || ""
              : "";

            return (
              <div className={aberto ? "cost-record-block active" : "cost-record-block"} key={item.id}>
                <article
                  className={aberto ? "cost-card active" : "cost-card"}
                  style={{ "--category-color": corCategoria }}
                  onClick={() => abrirCusto(item)}
                >
                  <div>
                    <span>{categoria?.nome || "Categoria"}</span>
                    <strong>{item.descricao}</strong>
                    <small>{item.fornecedor || "Sem fornecedor"} · {formatarData(item.data)} · {item.formaPagamento}</small>
                  </div>

                  <div>
                    <strong>{formatarMoeda(item.valor)}</strong>
                    <small>{item.comprovanteUrl || item.comprovanteArquivo?.dados ? "Com comprovante" : "Sem comprovante"}</small>
                  </div>
                </article>

                {aberto && custoEditando && (
                  <form
                    className="cost-inline-details form-stack"
                    onSubmit={(event) => salvarEdicaoCusto(event, item.id)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="inline-detail-header">
                      <div>
                        <span className="eyebrow">Detalhes do custo</span>
                        <h3>{item.descricao}</h3>
                      </div>
                      <strong>{formatarMoeda(item.valor)}</strong>
                    </div>

                    <div className="form-grid">
                      <label className="field-group">
                        <span>Área</span>
                        <select
                          value={custoEditando.categoriaId}
                          onChange={(event) => setCustoEditando({ ...custoEditando, categoriaId: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        >
                          <option value="">Selecione</option>
                          {configuracoesEventos.categorias.map((categoriaItem) => (
                            <option key={categoriaItem.id} value={categoriaItem.id}>
                              {categoriaItem.nome}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field-group">
                        <span>Descrição</span>
                        <input
                          type="text"
                          value={custoEditando.descricao}
                          onChange={(event) => setCustoEditando({ ...custoEditando, descricao: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>
                    </div>

                    <div className="form-grid">
                      <label className="field-group">
                        <span>Valor</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={custoEditando.valor}
                          onChange={(event) => setCustoEditando({ ...custoEditando, valor: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>

                      <label className="field-group">
                        <span>Data</span>
                        <input
                          type="date"
                          value={custoEditando.data}
                          onChange={(event) => setCustoEditando({ ...custoEditando, data: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>
                    </div>

                    <div className="form-grid">
                      <label className="field-group">
                        <span>Fornecedor ou pessoa</span>
                        <input
                          type="text"
                          value={custoEditando.fornecedor}
                          onChange={(event) => setCustoEditando({ ...custoEditando, fornecedor: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>

                      <label className="field-group">
                        <span>Forma de pagamento</span>
                        <select
                          value={custoEditando.formaPagamento}
                          onChange={(event) => setCustoEditando({ ...custoEditando, formaPagamento: event.target.value })}
                          disabled={salvandoEdicaoCusto}
                        >
                          {FORMAS_PAGAMENTO.map((forma) => (
                            <option key={forma}>{forma}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="form-grid">
                      <label className="field-group">
                        <span>Link do comprovante</span>
                        <input
                          type="url"
                          value={custoEditando.comprovanteUrl}
                          onChange={(event) => setCustoEditando({ ...custoEditando, comprovanteUrl: event.target.value })}
                          placeholder="https://..."
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>

                      <label className="field-group">
                        <span>Trocar arquivo</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(event) => lerComprovante(event, setComprovanteEdicaoArquivo)}
                          disabled={salvandoEdicaoCusto}
                        />
                      </label>
                    </div>

                    <label className="field-group">
                      <span>Observações</span>
                      <textarea
                        value={custoEditando.observacoes}
                        onChange={(event) => setCustoEditando({ ...custoEditando, observacoes: event.target.value })}
                        rows="3"
                        disabled={salvandoEdicaoCusto}
                      />
                    </label>

                    <div className="receipt-preview-inline">
                      <span>Comprovante</span>
                      {comprovanteHref ? (
                        <>
                          {String(comprovanteHref).startsWith("data:image") ? (
                            <img src={comprovanteHref} alt="Comprovante do custo" />
                          ) : (
                            <a className="button secondary small" href={comprovanteHref} target="_blank" rel="noreferrer">
                              Abrir comprovante
                            </a>
                          )}
                        </>
                      ) : (
                        <small>Nenhum comprovante anexado ou vinculado.</small>
                      )}
                    </div>

                    <div className="button-row inline-actions">
                      <button type="submit" className="button primary" disabled={salvandoEdicaoCusto}>
                        {salvandoEdicaoCusto ? "Salvando..." : "Salvar alterações"}
                      </button>
                      <button type="button" className="button secondary" onClick={fecharEdicaoCusto}>
                        Fechar
                      </button>
                      <button type="button" className="button danger" onClick={() => excluirCusto(item)}>
                        Deletar custo
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel involved-section-panel" data-tour="custos-envolvidos">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Pessoas e fornecedores</span>
            <h2>Envolvidos</h2>
            <p>Cadastre quem participa do evento e clique no card para editar os detalhes.</p>
          </div>

          <div className="section-total-pill">
            <span>Total envolvido</span>
            <strong>{envolvidos.length}</strong>
          </div>
        </div>

        <form className="new-involved-panel form-stack" onSubmit={cadastrarEnvolvido}>
          <div className="form-grid">
            <label className="field-group">
              <span>Nome</span>
              <input
                type="text"
                value={envolvido.nome}
                onChange={(event) => setEnvolvido({ ...envolvido, nome: event.target.value })}
                placeholder="Nome completo ou empresa"
                disabled={salvandoEnvolvido}
              />
            </label>

            <label className="field-group">
              <span>Papel</span>
              <input
                type="text"
                value={envolvido.papel}
                onChange={(event) => setEnvolvido({ ...envolvido, papel: event.target.value })}
                placeholder="Ex.: Buffet, cerimonial, apoio"
                disabled={salvandoEnvolvido}
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field-group">
              <span>Contato</span>
              <input
                type="text"
                value={envolvido.contato}
                onChange={(event) => setEnvolvido({ ...envolvido, contato: event.target.value })}
                placeholder="Telefone, e-mail ou observação de contato"
                disabled={salvandoEnvolvido}
              />
            </label>

            <label className="field-group">
              <span>Observações</span>
              <input
                type="text"
                value={envolvido.observacoes}
                onChange={(event) => setEnvolvido({ ...envolvido, observacoes: event.target.value })}
                placeholder="Responsabilidades ou combinações"
                disabled={salvandoEnvolvido}
              />
            </label>
          </div>

          <button type="submit" className="button primary" disabled={salvandoEnvolvido}>
            {salvandoEnvolvido ? "Salvando..." : "Adicionar envolvido"}
          </button>
        </form>

        <div className="involved-card-list">
          {envolvidos.length === 0 && (
            <div className="empty-state compact">Nenhuma pessoa ou fornecedor adicionado.</div>
          )}

          {envolvidos.map((item, indice) => {
            const aberto = envolvidoAbertoId === item.id;
            const corEnvolvido = coresEnvolvidos[indice % coresEnvolvidos.length];

            return (
              <div className={aberto ? "involved-record-block active" : "involved-record-block"} key={item.id}>
                <article
                  className={aberto ? "involved-card active" : "involved-card"}
                  style={{ "--person-color": corEnvolvido }}
                  onClick={() => abrirEnvolvido(item)}
                >
                  <div>
                    <span>{item.papel || "Participante"}</span>
                    <strong>{item.nome}</strong>
                    <small>{item.contato || "Sem contato"} · {item.observacoes || "Sem observações"}</small>
                  </div>
                  <em>Editar</em>
                </article>

                {aberto && envolvidoEditando && (
                  <form
                    className="involved-inline-details form-stack"
                    onSubmit={(event) => salvarEdicaoEnvolvido(event, item.id)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="form-grid">
                      <label className="field-group">
                        <span>Nome</span>
                        <input
                          type="text"
                          value={envolvidoEditando.nome}
                          onChange={(event) => setEnvolvidoEditando({ ...envolvidoEditando, nome: event.target.value })}
                          disabled={salvandoEdicaoEnvolvido}
                        />
                      </label>

                      <label className="field-group">
                        <span>Papel</span>
                        <input
                          type="text"
                          value={envolvidoEditando.papel}
                          onChange={(event) => setEnvolvidoEditando({ ...envolvidoEditando, papel: event.target.value })}
                          disabled={salvandoEdicaoEnvolvido}
                        />
                      </label>
                    </div>

                    <label className="field-group">
                      <span>Contato</span>
                      <input
                        type="text"
                        value={envolvidoEditando.contato}
                        onChange={(event) => setEnvolvidoEditando({ ...envolvidoEditando, contato: event.target.value })}
                        disabled={salvandoEdicaoEnvolvido}
                      />
                    </label>

                    <label className="field-group">
                      <span>Observações</span>
                      <textarea
                        value={envolvidoEditando.observacoes}
                        onChange={(event) => setEnvolvidoEditando({ ...envolvidoEditando, observacoes: event.target.value })}
                        rows="3"
                        disabled={salvandoEdicaoEnvolvido}
                      />
                    </label>

                    <div className="button-row inline-actions">
                      <button type="submit" className="button primary" disabled={salvandoEdicaoEnvolvido}>
                        {salvandoEdicaoEnvolvido ? "Salvando..." : "Salvar alterações"}
                      </button>
                      <button type="button" className="button secondary" onClick={fecharEdicaoEnvolvido}>
                        Fechar
                      </button>
                      <button type="button" className="button danger" onClick={() => excluirEnvolvido(item)}>
                        Remover
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <details className="panel event-details-collapse" data-tour="custos-detalhes">
        <summary>
          <span>
            <strong>Editar detalhes do evento</strong>
            <small>Local, responsável, data, orçamento e observações</small>
          </span>
        </summary>

        <div className="form-stack">
          <div className="form-grid">
            <label className="field-group">
              <span>Data</span>
              <input
                type="date"
                value={detalhes.data}
                onChange={(event) => setDetalhes({ ...detalhes, data: event.target.value })}
              />
            </label>

            <label className="field-group">
              <span>Status</span>
              <select
                value={detalhes.status}
                onChange={(event) => setDetalhes({ ...detalhes, status: event.target.value })}
              >
                <option value="planejamento">Planejamento</option>
                <option value="em-andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label className="field-group">
              <span>Local do evento</span>
              <input
                type="text"
                value={detalhes.local}
                onChange={(event) => setDetalhes({ ...detalhes, local: event.target.value })}
                placeholder="Endereço, sala, espaço alugado..."
              />
            </label>

            <label className="field-group">
              <span>Responsável</span>
              <input
                type="text"
                value={detalhes.responsavel}
                onChange={(event) => setDetalhes({ ...detalhes, responsavel: event.target.value })}
                placeholder="Pessoa ou equipe responsável"
              />
            </label>
          </div>

          <label className="toggle-card">
            <input
              type="checkbox"
              checked={detalhes.orcamentoAtivo}
              onChange={(event) => setDetalhes({ ...detalhes, orcamentoAtivo: event.target.checked })}
            />
            <span>Comparar custos com orçamento</span>
          </label>

          {detalhes.orcamentoAtivo && (
            <label className="field-group">
              <span>Orçamento total</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={detalhes.orcamento}
                onChange={(event) => setDetalhes({ ...detalhes, orcamento: event.target.value })}
                placeholder="0,00"
              />
            </label>
          )}

          <label className="field-group">
            <span>Descrição</span>
            <textarea
              value={detalhes.descricao}
              onChange={(event) => setDetalhes({ ...detalhes, descricao: event.target.value })}
              rows="3"
              placeholder="Resumo do evento"
            />
          </label>

          <label className="field-group">
            <span>Observações internas</span>
            <textarea
              value={detalhes.observacoes}
              onChange={(event) => setDetalhes({ ...detalhes, observacoes: event.target.value })}
              rows="3"
              placeholder="Pendências, decisões, restrições..."
            />
          </label>

          <button type="button" className="button primary" onClick={salvarDetalhes} disabled={salvandoDetalhes}>
            {salvandoDetalhes ? "Salvando..." : "Salvar detalhes"}
          </button>
        </div>
      </details>
    </div>
  );
}
