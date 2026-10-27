import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { NAVIGATION_ITEMS } from "../constants/routes";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, logout } = useAuth();

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div
      className={
        isCollapsed ? "app-shell app-shell--collapsed" : "app-shell"
      }
    >
      <aside
        className={
          isMobileOpen ? "sidebar sidebar--mobile-open" : "sidebar"
        }
        aria-label="Navegação principal"
      >
        <div className="sidebar__brand">
          <div className="brand-mark" aria-hidden="true">
            PI
          </div>
          <div className="brand-copy">
            <strong>Gerenciador de Eventos</strong>
            <span>Princesa Isabel</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
              }
              onClick={closeMobileMenu}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar__icon" aria-hidden="true">
                {item.shortLabel}
              </span>
              <span className="sidebar__text">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="profile-chip">
            <span>{profile?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <div>
              <strong>{profile?.name || "Usuário"}</strong>
              <small>{profile?.role || "consulta"}</small>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </aside>

      {isMobileOpen ? (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Fechar menu"
          onClick={closeMobileMenu}
        />
      ) : null}

      <div className="app-shell__main">
        <header className="topbar">
          <IconButton
            label="Abrir navegação"
            className="topbar__menu"
            onClick={() => setIsMobileOpen(true)}
          >
            ☰
          </IconButton>
          <IconButton
            label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="topbar__collapse"
            onClick={() => setIsCollapsed((current) => !current)}
          >
            {isCollapsed ? "›" : "‹"}
          </IconButton>
          <div className="topbar__title">
            <strong>Escola Municipal Cívico-Militar Princesa Isabel</strong>
            <span>Planejamento, execução e acompanhamento de eventos</span>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
