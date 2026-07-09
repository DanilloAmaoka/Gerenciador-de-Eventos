import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import {
  calcularResumoEvento,
  despesasPorCategoria,
  formatarData,
  formatarDataHora,
  formatarMoeda,
  normalizarTexto,
  obterCategoria,
} from "../data/eventosData";
import { useFeedback } from "../context/FeedbackContext";
import { useSchoolData } from "../context/SchoolDataContext";

const tiposRelatorio = [
  "Resumo financeiro",
  "Custos por categoria",
  "Comprovantes pendentes",
  "Orçamento x realizado",
  "Eventos arquivados",
];

function criarSlug(texto) {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "todos";
}

function criarIdRelatorio({ tipo, eventoId, periodo }) {
  return [criarSlug(tipo), eventoId || "todos", criarSlug(periodo)].join("_");
}

function filtrarEventos(eventos, filtroEvento, periodo) {
  return eventos.filter((evento) => {
    const eventoValido = filtroEvento === "Todos" || evento.id === filtroEvento;
    const periodoValido = !periodo || String(evento.data || "").startsWith(periodo);

    return eventoValido && periodoValido;
  });
}

export default function Relatorios() {
  const { eventos, configuracoesEventos } = useSchoolData();
  const { mostrarFeedback, pedirConfirmacao } = useFeedback();
  const [abaAtiva, setAbaAtiva] = useState("novo");
  const [tipo, setTipo] = useState("Resumo financeiro");
  const [eventoId, setEventoId] = useState("Todos");
  const [periodo, setPeriodo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoSalvos, setCarregandoSalvos] = useState(false);
  const [relatoriosSalvos, setRelatoriosSalvos] = useState([]);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);

  const relatorioAtual = useMemo(() => {
    const eventosFiltrados = filtrarEventos(eventos, eventoId, periodo);
    const dataLocal = new Date().toLocaleString("pt-BR");
    const relatorioId = criarIdRelatorio({ tipo, eventoId, periodo: periodo || "todos" });
    const custos = eventosFiltrados.flatMap((evento) =>
      (evento.custos || []).map((custo) => ({
        ...custo,
        eventoId: evento.id,
        eventoNome: evento.nome,
        eventoData: evento.data,
        categoriaNome: obterCategoria(custo.categoriaId, configuracoesEventos.categorias)?.nome || "Categoria",
      })),
    );
    const totalGasto = custos.reduce((total, custo) => total + Number(custo.valor || 0), 0);
    const totalOrcado = eventosFiltrados.reduce((total, evento) => {
      const resumo = calcularResumoEvento(evento);
      return total + (resumo.orcamentoAtivo ? resumo.orcamento : 0);
    }, 0);
    const comprovantesPendentes = custos.filter((custo) => !custo.comprovanteUrl && !custo.comprovanteArquivo?.dados);

    let registros = custos.map((custo) => ({
      id: custo.eventoId + "-" + custo.id,
      evento: custo.eventoNome,
      descricao: custo.descricao,
      categoria: custo.categoriaNome,
      data: formatarData(custo.data),
      valor: Number(custo.valor || 0),
      valorTexto: formatarMoeda(custo.valor),
      situacao: custo.comprovanteUrl || custo.comprovanteArquivo?.dados ? "Com comprovante" : "Sem comprovante",
    }));

    if (tipo === "Custos por categoria") {
      registros = despesasPorCategoria(eventosFiltrados, configuracoesEventos.categorias)
        .filter((categoria) => categoria.total > 0 || categoria.itens > 0)
        .map((categoria) => ({
          id: categoria.id,
          evento: "Todos",
          descricao: categoria.nome,
          categoria: categoria.descricao,
          data: "-",
          valor: categoria.total,
          valorTexto: formatarMoeda(categoria.total),
          situacao: categoria.itens + " itens",
        }));
    }

    if (tipo === "Comprovantes pendentes") {
      registros = comprovantesPendentes.map((custo) => ({
        id: custo.eventoId + "-" + custo.id,
        evento: custo.eventoNome,
        descricao: custo.descricao,
        categoria: custo.categoriaNome,
        data: formatarData(custo.data),
        valor: Number(custo.valor || 0),
        valorTexto: formatarMoeda(custo.valor),
        situacao: "Sem comprovante",
      }));
    }

    if (tipo === "Orçamento x realizado") {
      registros = eventosFiltrados.map((evento) => {
        const resumo = calcularResumoEvento(evento);

        return {
          id: evento.id,
          evento: evento.nome,
          descricao: resumo.orcamentoAtivo ? "Orçamento informado" : "Sem orçamento",
          categoria: evento.tipo,
          data: formatarData(evento.data),
          valor: resumo.total,
          valorTexto: formatarMoeda(resumo.total),
          situacao: resumo.orcamentoAtivo
            ? resumo.percentual + "% de " + formatarMoeda(resumo.orcamento)
            : "Acompanhamento sem comparação",
        };
      });
    }

    if (tipo === "Eventos arquivados") {
      registros = eventosFiltrados
        .filter((evento) => evento.arquivado)
        .map((evento) => {
          const resumo = calcularResumoEvento(evento);

          return {
            id: evento.id,
            evento: evento.nome,
            descricao: evento.local || "Sem local",
            categoria: evento.tipo,
            data: formatarData(evento.data),
            valor: resumo.total,
            valorTexto: formatarMoeda(resumo.total),
            situacao: (evento.custos || []).length + " custos arquivados",
          };
        });
    }

    return {
      id: relatorioId,
      tipo,
      eventoId,
      eventoNome: eventoId === "Todos" ? "Todos os eventos" : eventos.find((evento) => evento.id === eventoId)?.nome || "Evento",
      periodo: periodo || "Todos",
      dataLocal,
      resumo: {
        eventos: eventosFiltrados.length,
        custos: custos.length,
        totalGasto,
        totalOrcado,
        comprovantesPendentes: comprovantesPendentes.length,
      },
      registros,
    };
  }, [configuracoesEventos.categorias, eventoId, eventos, periodo, tipo]);

  const relatorioEmTela = relatorioSelecionado || relatorioAtual;

  useEffect(() => {
    carregarRelatoriosSalvos();
  }, []);

  async function carregarRelatoriosSalvos() {
    setCarregandoSalvos(true);

    try {
      const consulta = query(collection(db, "relatoriosEventos"), orderBy("atualizadoEm", "desc"), limit(60));
      const resultado = await getDocs(consulta);

      setRelatoriosSalvos(
        resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        })),
      );
    } catch (error) {
      mostrarFeedback("Não foi possível consultar os relatórios salvos.", "erro");
    } finally {
      setCarregandoSalvos(false);
    }
  }

  async function salvarRelatorio() {
    setSalvando(true);

    try {
      const referencia = doc(db, "relatoriosEventos", relatorioAtual.id);
      const existente = await getDoc(referencia);

      await setDoc(
        referencia,
        {
          ...relatorioAtual,
          criadoEm: existente.exists() ? existente.data().criadoEm : serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        },
        { merge: true },
      );

      await carregarRelatoriosSalvos();
      setRelatorioSelecionado({ ...relatorioAtual, atualizadoEm: "Agora" });
      setAbaAtiva("salvos");
      mostrarFeedback(existente.exists() ? "Relatório atualizado." : "Relatório salvo no banco.");
    } catch (error) {
      mostrarFeedback("Não foi possível salvar o relatório.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  function consultarRelatorio(relatorio) {
    setRelatorioSelecionado(relatorio);
    setAbaAtiva("novo");
    mostrarFeedback("Relatório salvo aberto para consulta.");
  }

  async function excluirRelatorio(relatorio) {
    const confirmado = await pedirConfirmacao({
      titulo: "Deletar relatório",
      mensagem: "Deseja deletar o relatório " + relatorio.tipo + "? Esta ação não apaga eventos nem custos.",
      textoConfirmar: "Deletar",
      perigo: true,
    });

    if (!confirmado) return;

    try {
      await deleteDoc(doc(db, "relatoriosEventos", relatorio.id));
      setRelatoriosSalvos((lista) => lista.filter((item) => item.id !== relatorio.id));
      if (relatorioSelecionado?.id === relatorio.id) setRelatorioSelecionado(null);
      mostrarFeedback("Relatório deletado.");
    } catch (error) {
      mostrarFeedback("Não foi possível deletar o relatório.", "erro");
    }
  }

  function gerarPdf(relatorio = relatorioEmTela) {
    setRelatorioSelecionado(relatorio);
    setAbaAtiva("novo");
    window.setTimeout(() => window.print(), 160);
  }

  return (
    <div className="page reports-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">Documentos</span>
          <h1>Relatórios</h1>
          <p>Gere, salve, consulte e imprima relatórios financeiros dos eventos.</p>
        </div>
      </header>

      <div className="tab-bar no-print" data-tour="relatorio-abas">
        <button type="button" className={abaAtiva === "novo" ? "active" : ""} onClick={() => setAbaAtiva("novo")}>
          Novo relatório
        </button>
        <button type="button" className={abaAtiva === "salvos" ? "active" : ""} onClick={() => setAbaAtiva("salvos")}>
          Relatórios salvos ({relatoriosSalvos.length})
        </button>
      </div>

      {abaAtiva === "salvos" ? (
        <section className="panel no-print saved-reports-panel" data-tour="relatorios-salvos">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Banco de dados</span>
              <h2>Relatórios salvos</h2>
            </div>

            <button type="button" className="button secondary" onClick={carregarRelatoriosSalvos}>
              {carregandoSalvos ? "Consultando..." : "Atualizar lista"}
            </button>
          </div>

          <div className="saved-report-list">
            {relatoriosSalvos.length === 0 && (
              <p className="muted-text">Nenhum relatório salvo encontrado ainda.</p>
            )}

            {relatoriosSalvos.map((relatorio) => (
              <article className="saved-report-card" key={relatorio.id}>
                <div>
                  <strong>{relatorio.tipo}</strong>
                  <span>{relatorio.eventoNome} · Período {relatorio.periodo}</span>
                </div>

                <div>
                  <span>{formatarDataHora(relatorio.atualizadoEm || relatorio.criadoEm)}</span>
                  <strong>{formatarMoeda(relatorio.resumo?.totalGasto || 0)}</strong>
                </div>

                <div className="saved-report-actions">
                  <button type="button" className="button secondary small" onClick={() => consultarRelatorio(relatorio)}>
                    Consultar
                  </button>
                  <button type="button" className="button primary small" onClick={() => gerarPdf(relatorio)}>
                    PDF
                  </button>
                  <button type="button" className="button danger small" onClick={() => excluirRelatorio(relatorio)}>
                    Deletar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="content-grid two-columns narrow-left report-workspace">
          <div className="panel report-config no-print">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Novo relatório</span>
                <h2>Configuração</h2>
              </div>
            </div>

            <div className="report-options" data-tour="relatorio-tipo">
              {tiposRelatorio.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={tipo === item ? "active" : ""}
                  onClick={() => {
                    setTipo(item);
                    setRelatorioSelecionado(null);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="form-stack" data-tour="relatorio-filtros">
              <label className="field-group">
                <span>Evento</span>
                <select value={eventoId} onChange={(event) => setEventoId(event.target.value)}>
                  <option>Todos</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group">
                <span>Período por mês</span>
                <input
                  type="month"
                  value={periodo}
                  onChange={(event) => setPeriodo(event.target.value)}
                />
              </label>
            </div>

            <div className="button-row">
              <button type="button" className="button primary" data-tour="relatorio-salvar" onClick={salvarRelatorio} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar relatório"}
              </button>

              <button type="button" className="button secondary" onClick={() => gerarPdf(relatorioAtual)}>
                Gerar PDF
              </button>
            </div>
          </div>

          <div className="panel report-preview print-area">
            {relatorioSelecionado && (
              <div className="selected-report-banner no-print">
                <span>Visualizando relatório salvo</span>
                <button type="button" className="button secondary small" onClick={() => setRelatorioSelecionado(null)}>
                  Voltar ao relatório atual
                </button>
              </div>
            )}

            <div className="print-header">
              <span className="eyebrow">Prévia do relatório</span>
              <h2>{relatorioEmTela.tipo}</h2>

              <div className="print-meta-grid">
                <span>Evento: {relatorioEmTela.eventoNome}</span>
                <span>Período: {relatorioEmTela.periodo}</span>
                <span>Gerado em: {relatorioEmTela.dataLocal || formatarDataHora(relatorioEmTela.criadoEm)}</span>
              </div>
            </div>

            <section className="report-summary">
              <div>
                <span>Eventos</span>
                <strong>{relatorioEmTela.resumo?.eventos || 0}</strong>
              </div>
              <div>
                <span>Custos</span>
                <strong>{relatorioEmTela.resumo?.custos || 0}</strong>
              </div>
              <div>
                <span>Total gasto</span>
                <strong>{formatarMoeda(relatorioEmTela.resumo?.totalGasto || 0)}</strong>
              </div>
              <div>
                <span>Sem comprovante</span>
                <strong>{relatorioEmTela.resumo?.comprovantesPendentes || 0}</strong>
              </div>
            </section>

            <div className="table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  {relatorioEmTela.registros.map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.evento}</td>
                      <td>{registro.descricao}</td>
                      <td>{registro.categoria}</td>
                      <td>{registro.data}</td>
                      <td>{registro.valorTexto || formatarMoeda(registro.valor)}</td>
                      <td>{registro.situacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
