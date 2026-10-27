export const EVENT_STATUS = [
  { value: "planejado", label: "Planejado", tone: "info" },
  { value: "em_andamento", label: "Em andamento", tone: "warning" },
  { value: "aprovado", label: "Aprovado", tone: "success" },
  { value: "concluido", label: "Concluído", tone: "neutral" },
  { value: "arquivado", label: "Arquivado", tone: "muted" },
  { value: "cancelado", label: "Cancelado", tone: "danger" }
];

export const EVENT_TYPES = [
  "Cívico-militar",
  "Pedagógico",
  "Cultural",
  "Esportivo",
  "Reunião",
  "Formatura",
  "Comemoração",
  "Outro"
];

export const FOOD_STATUS = [
  { value: "planejado", label: "Planejado", tone: "info" },
  { value: "cotado", label: "Cotado", tone: "warning" },
  { value: "comprado", label: "Comprado", tone: "success" },
  { value: "preparado", label: "Preparado", tone: "success" },
  { value: "cancelado", label: "Cancelado", tone: "danger" }
];

export const COST_MODE_OPTIONS = [
  { value: "unit", label: "Quantidade + custo unitário" },
  { value: "total", label: "Custo total" }
];

export const PARTICIPATION_TYPES = [
  { value: "none", label: "Sem custo" },
  { value: "fixed", label: "Valor fixo" },
  { value: "hourly", label: "Por hora" }
];

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Pessoas",
  "Material",
  "Serviço",
  "Transporte",
  "Decoração",
  "Infraestrutura",
  "Outro"
];

export const PAYMENT_METHODS = [
  "Dinheiro",
  "Pix",
  "Cartão",
  "Transferência",
  "Boleto",
  "Outro"
];

export const TASK_STATUS = [
  { value: "pendente", label: "Pendente", tone: "warning" },
  { value: "em_andamento", label: "Em andamento", tone: "info" },
  { value: "concluida", label: "Concluída", tone: "success" },
  { value: "cancelada", label: "Cancelada", tone: "danger" }
];

export const ITEM_STATUS = [
  { value: "necessario", label: "Necessário", tone: "warning" },
  { value: "reservado", label: "Reservado", tone: "info" },
  { value: "comprado", label: "Comprado", tone: "success" },
  { value: "disponivel", label: "Disponível", tone: "success" },
  { value: "entregue", label: "Entregue", tone: "success" },
  { value: "devolvido", label: "Devolvido", tone: "neutral" },
  { value: "indisponivel", label: "Indisponível", tone: "danger" }
];

export const PRIORITY_OPTIONS = [
  { value: "baixa", label: "Baixa", tone: "muted" },
  { value: "media", label: "Média", tone: "info" },
  { value: "alta", label: "Alta", tone: "warning" },
  { value: "urgente", label: "Urgente", tone: "danger" }
];

export const ROLE_OPTIONS = [
  { value: "administrador", label: "Administrador" },
  { value: "organizador", label: "Organizador" },
  { value: "colaborador", label: "Colaborador" },
  { value: "consulta", label: "Consulta" }
];

export const ORIGIN_OPTIONS = [
  "Escola",
  "Empréstimo",
  "Compra",
  "Doação",
  "Fornecedor",
  "Outra"
];
