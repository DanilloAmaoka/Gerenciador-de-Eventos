import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FORMAS_PAGAMENTO,
  calcularResumoEvento,
  formatarData,
  formatarMoeda,
  obterCategoria,
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

function lerEventoDaUrl(search) {
  return new URLSearchParams(search).get("evento") || "";
}

function ordenarCustos(custos = []) {
  return [...custos].sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

export default function Custos() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    eventosAtivos,
    configuracoesEventos,
    salvarEvento,
    alternarCategoriaEvento,
    adicionarCusto,
    deletarCusto,
    adicionarEnvolvido,
    removerEnvolvido,
  } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const eventoUrl = lerEventoDaUrl(location.search);
  const [eventoId, setEventoId] = useState(eventoUrl);
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
  const [envolvido, setEnvolvido] = useState(envolvidoInicial);
  const [comprovanteArquivo, setComprovanteArquivo] = useState(null);
  const [salvandoDetalhes, setSalvandoDetalhes] = useState(false);
  const [salvandoCusto, setSalvandoCusto] = useState(false);
  const [salvandoEnvolvido, setSalvandoEnvolvido] = useState(false);

  const eventoSelecionado = useMemo(() => {
    if (!eventosAtivos.length) return null;
    return eventosAtivos.find((evento) => String(evento.id) === String(eventoId)) || eventosAtivos[0];
  }, [eventoId, eventosAtivos]);

  useEffect(() => {
    if (!eventoSelecionado) return;

    setEventoId(eventoSelecionado.id);
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
  }, [eventoSelecionado?.id]);

  useEffect(() => {
    if (!eventoSelecionado) return;
    const params = new URLSearchParams(location.search);
    if (params.get("evento") === eventoSelecionado.id) return;

    params.set("evento", eventoSelecionado.id);
    navigate({ pathname: "/custos", search: params.toString() }, { replace: true });
  }, [eventoSelecionado, location.search, navigate]);

  useEffect(() => {
    if (custo.categoriaId) return;
    const primeiraCategoria = eventoSelecionado?.categoriasAtivas?.[0];
    if (primeiraCategoria) {
      setCusto((valorAtual) => ({ ...valorAtual, categoriaId: primeiraCategoria }));
    }
  }, [custo.categoriaId, eventoSelecionado?.categoriasAtivas]);

  const resumo = eventoSelecionado ? calcularResumoEvento(eventoSelecionado) : null;
  const categoriasAtivas = configuracoesEventos.categorias.filter((categoria) =>
    eventoSelecionado?.categoriasAtivas?.includes(categoria.id),
  );
  const custosOrdenados = ordenarCustos(eventoSelecionado?.custos);

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

  function processarComprovante(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) {
      setComprovanteArquivo(null);
      return;
    }

    if (arquivo.size > 350000) {
      mostrarFeedback("O arquivo é grande para esta versão. Use um link de comprovante ou compacte a imagem.", "erro");
      event.target.value = "";
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      setComprovanteArquivo({
        nome: arquivo.name,
        tipo: arquivo.type,
        tamanho: arquivo.size,
        dados: leitor.result,
      });
    };
    leitor.readAsDataURL(arquivo);
  }

  async function cadastrarCusto(event) {
    event.preventDefault();

    if (!eventoSelecionado) return;

    if (!custo.categoriaId) {
      mostrarFeedback("Selecione uma área do evento antes de lançar o custo.", "erro");
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
        comprovanteArquivo,
      });
      setCusto({ ...custoInicial, categoriaId: custo.categoriaId });
      setComprovanteArquivo(null);
      const inputArquivo = document.querySelector("[data-receipt-file='true']");
      if (inputArquivo) inputArquivo.value = "";
      mostrarFeedback("Custo registrado no evento.");
    } catch (error) {
      mostrarFeedback("Não foi possível registrar o custo.", "erro");
    } finally {
      setSalvandoCusto(false);
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

  async function excluirEnvolvido(envolvidoItem) {
    if (!eventoSelecionado) return;

    try {
      await removerEnvolvido(eventoSelecionado.id, envolvidoItem.id);
      mostrarFeedback("Envolvido removido.");
    } catch (error) {
      mostrarFeedback("Não foi possível remover o envolvido.", "erro");
    }
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

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Organização financeira</span>
          <h1>Custos</h1>
          <p>Selecione as áreas usadas pelo evento, lance cada gasto e guarde o comprovante.</p>
        </div>

        <div className="filter-row compact">
          <label>
            <span>Evento</span>
            <select
              value={eventoSelecionado?.id || ""}
              onChange={(event) => setEventoId(event.target.value)}
              data-tour="custos-evento"
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

      <section className="overview-panel event-overview" data-tour="custos-resumo">
        <div>
          <span className="pill light">{eventoSelecionado.tipo}</span>
          <h2>{eventoSelecionado.nome}</h2>
          <p>
            {formatarData(eventoSelecionado.data)} · {eventoSelecionado.local || "Local ainda não definido"}
          </p>
        </div>

        <div className="score-ring">
          <strong>{formatarMoeda(resumo.total)}</strong>
          <span>gasto total</span>
        </div>
      </section>

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

      <section className="content-grid two-columns">
        <div className="panel" data-tour="custos-detalhes">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Evento</span>
              <h2>Detalhes opcionais</h2>
              <p>Preencha só o que fizer parte deste evento.</p>
            </div>
          </div>

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

            <button type="button" className="button primary full-width" onClick={salvarDetalhes} disabled={salvandoDetalhes}>
              {salvandoDetalhes ? "Salvando..." : "Salvar detalhes"}
            </button>
          </div>
        </div>

        <div className="panel" data-tour="custos-categorias">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Áreas opcionais</span>
              <h2>O que faz parte do evento?</h2>
              <p>Ative apenas as áreas que você precisa controlar.</p>
            </div>
          </div>

          <div className="category-grid">
            {configuracoesEventos.categorias.map((categoria) => {
              const ativa = eventoSelecionado.categoriasAtivas?.includes(categoria.id);

              return (
                <button
                  type="button"
                  className={ativa ? "category-toggle active" : "category-toggle"}
                  key={categoria.id}
                  onClick={() => alternarCategoriaEvento(eventoSelecionado.id, categoria.id)}
                >
                  <strong>{categoria.nome}</strong>
                  <span>{categoria.descricao}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-grid two-columns narrow-left">
        <form className="panel form-stack" onSubmit={cadastrarCusto} data-tour="custos-lancar">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Novo custo</span>
              <h2>Lançar gasto</h2>
            </div>
          </div>

          {categoriasAtivas.length === 0 && (
            <div className="notice-banner warning">
              <strong>Selecione uma área primeiro</strong>
              <p>Ative Local, Alimentação, Decoração ou outra área antes de lançar custos.</p>
            </div>
          )}

          <label className="field-group">
            <span>Área</span>
            <select
              value={custo.categoriaId}
              onChange={(event) => setCusto({ ...custo, categoriaId: event.target.value })}
              disabled={categoriasAtivas.length === 0}
            >
              <option value="">Selecione</option>
              {categoriasAtivas.map((categoria) => (
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
              data-receipt-file="true"
              onChange={processarComprovante}
              disabled={salvandoCusto}
            />
          </label>

          {comprovanteArquivo && (
            <div className="notice-inline">Arquivo pronto: {comprovanteArquivo.nome}</div>
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

          <button type="submit" className="button primary full-width" disabled={salvandoCusto || categoriasAtivas.length === 0}>
            {salvandoCusto ? "Salvando..." : "Adicionar custo"}
          </button>
        </form>

        <div className="panel" data-tour="custos-lista">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Extrato do evento</span>
              <h2>{custosOrdenados.length} custos registrados</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Gasto</th>
                  <th>Área</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Comprovante</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {custosOrdenados.map((item) => {
                  const categoria = obterCategoria(item.categoriaId, configuracoesEventos.categorias);
                  const comprovanteHref = item.comprovanteUrl || item.comprovanteArquivo?.dados || "";

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.descricao}</strong>
                        <small>{item.fornecedor || "Sem fornecedor"} · {item.formaPagamento}</small>
                      </td>
                      <td>{categoria?.nome || "Categoria"}</td>
                      <td>{formatarData(item.data)}</td>
                      <td>{formatarMoeda(item.valor)}</td>
                      <td>
                        {comprovanteHref ? (
                          <a className="receipt-link" href={comprovanteHref} target="_blank" rel="noreferrer">
                            Abrir
                          </a>
                        ) : (
                          <span className="status-badge status-reforco">Pendente</span>
                        )}
                      </td>
                      <td>
                        <button type="button" className="button danger small" onClick={() => excluirCusto(item)}>
                          Deletar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="content-grid two-columns">
        <form className="panel form-stack" onSubmit={cadastrarEnvolvido} data-tour="custos-envolvidos">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Pessoas e fornecedores</span>
              <h2>Adicionar envolvido</h2>
            </div>
          </div>

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
            <textarea
              value={envolvido.observacoes}
              onChange={(event) => setEnvolvido({ ...envolvido, observacoes: event.target.value })}
              rows="3"
              placeholder="Responsabilidades, combinações, restrições..."
              disabled={salvandoEnvolvido}
            />
          </label>

          <button type="submit" className="button primary full-width" disabled={salvandoEnvolvido}>
            {salvandoEnvolvido ? "Salvando..." : "Adicionar envolvido"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Lista de envolvidos</span>
              <h2>{eventoSelecionado.envolvidos?.length || 0} registros</h2>
            </div>
          </div>

          <div className="event-mini-list">
            {(eventoSelecionado.envolvidos || []).length === 0 && (
              <div className="empty-state compact">Nenhuma pessoa ou fornecedor adicionado.</div>
            )}

            {(eventoSelecionado.envolvidos || []).map((item) => (
              <article className="event-mini-card" key={item.id}>
                <div>
                  <strong>{item.nome}</strong>
                  <span>{item.papel || "Sem papel definido"} · {item.contato || "Sem contato"}</span>
                </div>
                <button type="button" className="button danger small" onClick={() => excluirEnvolvido(item)}>
                  Remover
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
