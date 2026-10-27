export const ROUTES = {
  login: "/login",
  home: "/inicio",
  events: "/eventos",
  calendar: "/calendario",
  templates: "/modelos",
  reports: "/relatorios",
  settings: "/configuracoes"
};

export const NAVIGATION_ITEMS = [
  {
    label: "Início",
    path: ROUTES.home,
    shortLabel: "In",
    description: "Próximos eventos e pendências"
  },
  {
    label: "Eventos",
    path: ROUTES.events,
    shortLabel: "Ev",
    description: "Listagem e gestão dos eventos"
  },
  {
    label: "Calendário",
    path: ROUTES.calendar,
    shortLabel: "Ca",
    description: "Eventos por período"
  },
  {
    label: "Modelos",
    path: ROUTES.templates,
    shortLabel: "Mo",
    description: "Estruturas reutilizáveis"
  },
  {
    label: "Relatórios",
    path: ROUTES.reports,
    shortLabel: "Re",
    description: "Consultas úteis"
  },
  {
    label: "Configurações",
    path: ROUTES.settings,
    shortLabel: "Co",
    description: "Cadastros auxiliares e permissões"
  }
];

export const getEventPath = (eventId, suffix = "") => {
  const basePath = `${ROUTES.events}/${eventId}`;
  return suffix ? `${basePath}/${suffix}` : basePath;
};
