import { NavLink } from "react-router-dom";

import {
  calcularResumoEvento,
  calcularResumoGeral,
  formatarData,
  formatarMoeda,
  listarCustosRecentes,
  obterCategoria,
  ordenarEventosPorData,
} from "../data/eventosData";
import { useSchoolData } from "../context/SchoolDataContext";

export default function Inicio() {
  const { eventosAtivos, eventosArquivados, carregandoEventos, configuracoesEventos } = useSchoolData();
  const resumo = calcularResumoGeral([...eventosAtivos, ...eventosArquivados]);
  const resumoAtivos = calcularResumoGeral(eventosAtivos);
  const proximosEventos = ordenarEventosPorData(eventosAtivos).slice(0, 5);
  const custosRecentes = listarCustosRecentes(eventosAtivos).slice(0, 5);
  const eventosEmAtencao = eventosAtivos
    .map((evento) => ({ evento, resumo: calcularResumoEvento(evento) }))
    .filter((item) => item.resumo.orcamentoAtivo && item.resumo.percentual >= configuracoesEventos.alertaOrcamento)
    .sort((a, b) => b.resumo.percentual - a.resumo.percentual)
    .slice(0, 5);
  const percentualGeral = resumoAtivos.totalOrcado > 0
    ? Math.round((resumoAtivos.totalGasto / resumoAtivos.totalOrcado) * 100)
    : 0;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Painel geral</span>
          <h1>Início</h1>
          <p>
            Acompanhe os eventos em aberto, os custos registrados, o uso do orçamento e os
            próximos passos da organização.
          </p>
        </div>
      </header>

      {carregandoEventos && (
        <section className="notice-banner">
          <strong>Carregando eventos</strong>
          <p>Buscando no banco os eventos, custos, envolvidos e comprovantes salvos.</p>
        </section>
      )}

      <section className="overview-panel" data-tour="inicio-resumo">
        <div>
          <span className="pill light">Gestão financeira de eventos</span>
          <h2>{formatarMoeda(resumoAtivos.totalGasto)}</h2>
          <p>
            Total gasto nos eventos ativos
            {resumoAtivos.totalOrcado > 0 ? " de " + formatarMoeda(resumoAtivos.totalOrcado) + " orçados." : "."}
          </p>
        </div>

        <div className="score-ring">
          <strong>{percentualGeral}%</strong>
          <span>do orçamento</span>
        </div>
      </section>

      <section className="metrics-grid" data-tour="inicio-metricas">
        <article className="metric-card">
          <span>Eventos ativos</span>
          <strong>{resumoAtivos.ativos}</strong>
          <p>Planejamento e execução</p>
        </article>

        <article className="metric-card success">
          <span>Arquivados</span>
          <strong>{resumo.arquivados}</strong>
          <p>Guardados para consulta</p>
        </article>

        <article className="metric-card warning">
          <span>Próximos 30 dias</span>
          <strong>{resumoAtivos.proximos}</strong>
          <p>Eventos com data próxima</p>
        </article>

        <article className="metric-card danger">
          <span>Orçamento em atenção</span>
          <strong>{resumoAtivos.acimaDoOrcamento}</strong>
          <p>Eventos acima do previsto</p>
        </article>
      </section>

      <section className="content-grid two-columns" data-tour="inicio-alertas">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Orçamento</span>
              <h2>Eventos em atenção</h2>
            </div>
            <NavLink className="text-link" to="/orcamento">Ver orçamento</NavLink>
          </div>

          <div className="list-stack">
            {eventosEmAtencao.length === 0 && (
              <div className="empty-state compact">Nenhum evento ultrapassou o limite de atenção.</div>
            )}

            {eventosEmAtencao.map(({ evento, resumo: resumoEvento }) => (
              <div className="alert-row" key={evento.id}>
                <div>
                  <strong>{evento.nome}</strong>
                  <span>
                    {formatarMoeda(resumoEvento.total)} de {formatarMoeda(resumoEvento.orcamento)} ·{" "}
                    {resumoEvento.pendentesComprovante} comprovantes pendentes
                  </span>
                </div>
                <span className={resumoEvento.percentual > 100 ? "status-badge status-critico" : "status-badge status-reforco"}>
                  {resumoEvento.percentual}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Agenda</span>
              <h2>Próximos eventos</h2>
            </div>
            <NavLink className="text-link" to="/eventos">Ver eventos</NavLink>
          </div>

          <div className="ranking-list">
            {proximosEventos.length === 0 && (
              <div className="empty-state compact">Crie o primeiro evento para iniciar o controle.</div>
            )}

            {proximosEventos.map((evento, index) => {
              const resumoEvento = calcularResumoEvento(evento);

              return (
                <div className="ranking-row" key={evento.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{evento.nome}</strong>
                    <small>{formatarData(evento.data)} · {evento.tipo}</small>
                  </div>
                  <strong>{formatarMoeda(resumoEvento.total)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Movimentações</span>
            <h2>Últimos custos lançados</h2>
          </div>
          <NavLink className="text-link" to="/custos">Lançar custos</NavLink>
        </div>

        <div className="event-mini-list">
          {custosRecentes.length === 0 && (
            <div className="empty-state compact">Nenhum custo registrado ainda.</div>
          )}

          {custosRecentes.map((custo) => {
            const categoria = obterCategoria(custo.categoriaId, configuracoesEventos.categorias);

            return (
              <article className="event-mini-card" key={custo.eventoId + "-" + custo.id}>
                <div>
                  <strong>{custo.descricao}</strong>
                  <span>{custo.eventoNome} · {categoria?.nome || "Categoria"}</span>
                </div>
                <div>
                  <strong>{formatarMoeda(custo.valor)}</strong>
                  <span>{formatarData(custo.data)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shortcut-grid" data-tour="inicio-atalhos">
        <NavLink to="/eventos">Criar evento</NavLink>
        <NavLink to="/custos">Adicionar custos</NavLink>
        <NavLink to="/orcamento">Ver orçamento</NavLink>
        <NavLink to="/relatorios">Abrir relatórios</NavLink>
        <NavLink to="/ajuda" className="help-shortcut" data-tour="inicio-ajuda">Abrir ajuda</NavLink>
      </section>
    </div>
  );
}
