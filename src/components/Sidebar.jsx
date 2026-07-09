import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase/config";
import { calcularResumoEvento } from "../data/eventosData";
import { useSchoolData } from "../context/SchoolDataContext";
import { useTutorial } from "../context/TutorialContext";

const menuItems = [
  { id: "inicio", to: "/inicio", label: "Início", icon: "🏠" },
  { id: "eventos", to: "/eventos", label: "Eventos", icon: "📅" },
  { id: "custos", to: "/custos", label: "Custos", icon: "💳" },
  { id: "orcamento", to: "/orcamento", label: "Orçamento", icon: "⚠️", showBudgetBadge: true },
  { id: "cronograma", to: "/cronograma", label: "Cronograma", icon: "📌" },
  { id: "arquivo", to: "/arquivo", label: "Arquivo", icon: "🗄️" },
  { id: "relatorios", to: "/relatorios", label: "Relatórios", icon: "📄" },
  { id: "configuracoes", to: "/configuracoes", label: "Configurações", icon: "⚙️" },
  { id: "ajuda", to: "/ajuda", label: "Ajuda", icon: "❔", featured: true },
];

const NOVIDADES_TUTORIAL_ID = "novidades-eventos";
const NOVIDADES_VISUALIZADAS_KEY = `eventos-${NOVIDADES_TUTORIAL_ID}-visualizadas`;

export default function Sidebar() {
  const navigate = useNavigate();
  const { eventosAtivos, configuracoesEventos } = useSchoolData();
  const { iniciarTutorial } = useTutorial();
  const [novidadesVisualizadas, setNovidadesVisualizadas] = useState(() => {
    try {
      return window.localStorage.getItem(NOVIDADES_VISUALIZADAS_KEY) === "true";
    } catch {
      return false;
    }
  });

  const eventosEmAtencao = eventosAtivos.filter((evento) => {
    const resumo = calcularResumoEvento(evento);
    return resumo.orcamentoAtivo && resumo.percentual >= configuracoesEventos.alertaOrcamento;
  });
  const totalEmAtencao = eventosEmAtencao.length;
  const totalEstourados = eventosEmAtencao.filter((evento) => calcularResumoEvento(evento).percentual > 100).length;
  const classeNovidades = "nav-link nav-link-button" + (novidadesVisualizadas ? "" : " updates-featured");

  const sair = async () => {
    await signOut(auth);
    navigate("/");
  };

  const abrirNovidades = () => {
    if (!novidadesVisualizadas) {
      setNovidadesVisualizadas(true);

      try {
        window.localStorage.setItem(NOVIDADES_VISUALIZADAS_KEY, "true");
      } catch {
        // Mantem o destaque visual da sessao mesmo se o navegador bloquear o armazenamento local.
      }
    }

    iniciarTutorial(NOVIDADES_TUTORIAL_ID);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">GE</div>

        <div>
          <span>Sistema de Gestão</span>
          <strong>Eventos</strong>
        </div>
      </div>

      {totalEmAtencao > 0 && (
        <NavLink className="sidebar-risk-alert" to="/orcamento">
          <span aria-hidden="true">⚠️</span>
          <div>
            <strong>{totalEmAtencao} em atenção</strong>
            <small>{totalEstourados} acima do orçamento</small>
          </div>
        </NavLink>
      )}

      <nav className="sidebar-nav" aria-label="Menu principal">
        <button
          type="button"
          className={classeNovidades}
          data-tour="nav-novidades"
          onClick={abrirNovidades}
        >
          <span className="nav-icon" aria-hidden="true">
            ✨
          </span>
          <span>Novidades</span>
        </button>

        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-tour={"nav-" + item.id}
            className={({ isActive }) => "nav-link " + (isActive ? "active " : "") + (item.featured ? "help-featured" : "")}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.showBudgetBadge && totalEmAtencao > 0 && (
              <span className="nav-badge">{totalEmAtencao}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>
          <span>Eventos ativos</span>
          <strong>{eventosAtivos.length} em aberto</strong>
        </div>

        <button type="button" className="button ghost full-width" onClick={sair}>
          Sair
        </button>
      </div>
    </aside>
  );
}
