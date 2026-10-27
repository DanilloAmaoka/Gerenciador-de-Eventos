import { COLLECTIONS } from "./collections";
import {
  COST_MODE_OPTIONS,
  EXPENSE_CATEGORIES,
  FOOD_STATUS,
  ITEM_STATUS,
  ORIGIN_OPTIONS,
  PARTICIPATION_TYPES,
  PAYMENT_METHODS,
  PRIORITY_OPTIONS,
  TASK_STATUS
} from "./eventOptions";

const showAdvanced = (values) => values.showAdvanced === true;
const costByUnit = (values) => values.costMode === "unit";
const costByTotal = (values) => values.costMode === "total";
const fixedPayment = (values) => values.participationType === "fixed";
const hourlyPayment = (values) => values.participationType === "hourly";
const noPaymentWithHours = (values) =>
  values.participationType === "none" && values.trackHours === true;

export const PLANNING_SECTIONS = [
  {
    id: "food",
    title: "Alimentação",
    singular: "alimento",
    collection: COLLECTIONS.eventFood,
    icon: "AL",
    tone: "purple",
    description: "Alimentos, bebidas, preparações e ingredientes planejados.",
    addLabel: "Adicionar alimento",
    emptyTitle: "Nenhum alimento planejado",
    emptyMessage: "Adicione o que será servido ou preparado para este evento.",
    plannedCostSource: true,
    primaryFields: ["name", "quantityLabel", "plannedCost", "status"],
    defaults: {
      costMode: "total",
      status: "planejado",
      showAdvanced: false
    },
    fields: [
      { name: "name", label: "Nome do alimento ou preparação", type: "text", required: true },
      { name: "category", label: "Categoria", type: "text", placeholder: "Bebida, doce, salgado..." },
      { name: "quantity", label: "Quantidade", type: "number", min: 0 },
      { name: "unit", label: "Unidade", type: "text", placeholder: "unid., kg, litros..." },
      {
        name: "costMode",
        label: "Modo de custo",
        type: "segmented",
        options: COST_MODE_OPTIONS,
        required: true
      },
      {
        name: "unitCost",
        label: "Custo unitário",
        type: "money",
        min: 0,
        visibleWhen: costByUnit
      },
      {
        name: "totalCost",
        label: "Custo total planejado",
        type: "money",
        min: 0,
        visibleWhen: costByTotal
      },
      { name: "showAdvanced", label: "Adicionar fornecedor, responsável e observações", type: "toggle" },
      { name: "supplier", label: "Fornecedor ou origem", type: "text", visibleWhen: showAdvanced },
      { name: "responsible", label: "Responsável", type: "text", visibleWhen: showAdvanced },
      { name: "status", label: "Status", type: "select", options: FOOD_STATUS, visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "people",
    title: "Pessoas",
    singular: "pessoa",
    collection: COLLECTIONS.eventPeople,
    icon: "PE",
    tone: "indigo",
    description: "Participantes, funções, horas e remuneração quando houver.",
    addLabel: "Adicionar pessoa",
    emptyTitle: "Nenhuma pessoa cadastrada",
    emptyMessage: "Inclua professores, colaboradores, responsáveis e prestadores.",
    plannedCostSource: true,
    primaryFields: ["name", "role", "plannedCost", "participationLabel"],
    defaults: {
      participationType: "none",
      showAdvanced: false,
      trackHours: false
    },
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "role", label: "Função ou atividade", type: "text" },
      {
        name: "participationType",
        label: "Tipo de participação",
        type: "segmented",
        options: PARTICIPATION_TYPES,
        required: true
      },
      { name: "fixedAmount", label: "Valor fixo", type: "money", min: 0, visibleWhen: fixedPayment },
      { name: "hours", label: "Quantidade de horas", type: "number", min: 0, visibleWhen: hourlyPayment },
      { name: "hourlyRate", label: "Valor por hora", type: "money", min: 0, visibleWhen: hourlyPayment },
      {
        name: "trackHours",
        label: "Registrar horas mesmo sem pagamento",
        type: "toggle",
        visibleWhen: (values) => values.participationType === "none"
      },
      {
        name: "hoursOnly",
        label: "Horas previstas/registradas",
        type: "number",
        min: 0,
        visibleWhen: noPaymentWithHours
      },
      { name: "showAdvanced", label: "Adicionar contato e observações", type: "toggle" },
      { name: "contact", label: "Contato", type: "text", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "expenses",
    title: "Despesas",
    singular: "despesa",
    collection: COLLECTIONS.eventExpenses,
    icon: "R$",
    tone: "green",
    description: "Gastos efetivamente realizados, simples ou detalhados.",
    addLabel: "Registrar despesa",
    emptyTitle: "Nenhuma despesa realizada",
    emptyMessage: "Registre gastos reais quando compras ou pagamentos acontecerem.",
    actualCostSource: true,
    primaryFields: ["description", "amount", "category", "date"],
    defaults: {
      showAdvanced: false
    },
    fields: [
      { name: "description", label: "Descrição", type: "text", required: true },
      { name: "amount", label: "Valor gasto", type: "money", min: 0, required: true },
      { name: "showAdvanced", label: "Adicionar detalhes da despesa", type: "toggle" },
      { name: "category", label: "Categoria", type: "select", options: EXPENSE_CATEGORIES, visibleWhen: showAdvanced },
      { name: "date", label: "Data", type: "date", visibleWhen: showAdvanced },
      { name: "supplier", label: "Fornecedor ou pessoa relacionada", type: "text", visibleWhen: showAdvanced },
      { name: "paymentMethod", label: "Forma de pagamento", type: "select", options: PAYMENT_METHODS, visibleWhen: showAdvanced },
      { name: "documentUrl", label: "Link de comprovante/anexo", type: "url", visibleWhen: showAdvanced },
      { name: "linkedRecord", label: "Vínculo com item planejado", type: "text", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "items",
    title: "Itens e materiais",
    singular: "item",
    collection: COLLECTIONS.eventItems,
    icon: "IT",
    tone: "amber",
    description: "Materiais, equipamentos e objetos necessários.",
    addLabel: "Adicionar item",
    emptyTitle: "Nenhum item planejado",
    emptyMessage: "Controle o que é necessário, de onde virá e sua situação.",
    plannedCostSource: true,
    primaryFields: ["name", "quantity", "origin", "status", "plannedCost"],
    defaults: {
      origin: "Escola",
      status: "necessario",
      showAdvanced: false
    },
    fields: [
      { name: "name", label: "Item/material", type: "text", required: true },
      { name: "quantity", label: "Quantidade", type: "text" },
      { name: "origin", label: "Origem", type: "select", options: ORIGIN_OPTIONS },
      { name: "status", label: "Status", type: "select", options: ITEM_STATUS },
      { name: "plannedCost", label: "Custo planejado, se houver", type: "money", min: 0 },
      { name: "showAdvanced", label: "Adicionar categoria, data e observações", type: "toggle" },
      { name: "category", label: "Categoria", type: "text", visibleWhen: showAdvanced },
      { name: "responsible", label: "Responsável", type: "text", visibleWhen: showAdvanced },
      { name: "neededDate", label: "Data necessária", type: "date", visibleWhen: showAdvanced },
      { name: "attachmentUrl", label: "Link de anexo externo", type: "url", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "tasks",
    title: "Tarefas",
    singular: "tarefa",
    collection: COLLECTIONS.eventTasks,
    icon: "TA",
    tone: "blue",
    description: "Atividades necessárias, responsáveis, prioridade e status.",
    addLabel: "Adicionar tarefa",
    emptyTitle: "Nenhuma tarefa criada",
    emptyMessage: "Adicione atividades simples para acompanhar o planejamento.",
    primaryFields: ["title", "responsible", "dueDate", "priority", "status"],
    defaults: {
      priority: "media",
      status: "pendente",
      showAdvanced: false
    },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "dueDate", label: "Prazo", type: "date" },
      { name: "priority", label: "Prioridade", type: "select", options: PRIORITY_OPTIONS },
      { name: "status", label: "Status", type: "select", options: TASK_STATUS },
      { name: "showAdvanced", label: "Adicionar descrição, checklist e dependências", type: "toggle" },
      { name: "description", label: "Descrição", type: "textarea", visibleWhen: showAdvanced },
      { name: "checklist", label: "Checklist opcional", type: "textarea", helper: "Uma linha por item.", visibleWhen: showAdvanced },
      { name: "notes", label: "Dependência ou observação", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "location",
    title: "Local",
    singular: "detalhe de local",
    collection: COLLECTIONS.eventLocations,
    icon: "LO",
    tone: "teal",
    description: "Ambiente, infraestrutura, montagem, limpeza e recursos.",
    addLabel: "Adicionar detalhe",
    emptyTitle: "Nenhum detalhe de local",
    emptyMessage: "Registre somente as informações de infraestrutura necessárias.",
    primaryFields: ["name", "capacity", "resources", "responsible"],
    defaults: {
      showAdvanced: false
    },
    fields: [
      { name: "name", label: "Local ou ambiente", type: "text", required: true },
      { name: "capacity", label: "Capacidade estimada", type: "number", min: 0 },
      { name: "resources", label: "Recursos principais", type: "textarea" },
      { name: "showAdvanced", label: "Adicionar detalhes de montagem e acesso", type: "toggle" },
      { name: "address", label: "Endereço ou referência", type: "text", visibleWhen: showAdvanced },
      { name: "rooms", label: "Ambientes utilizados", type: "textarea", visibleWhen: showAdvanced },
      { name: "layout", label: "Mesas, cadeiras e disposição", type: "textarea", visibleWhen: showAdvanced },
      { name: "cleaning", label: "Limpeza, montagem e desmontagem", type: "textarea", visibleWhen: showAdvanced },
      { name: "accessibility", label: "Acessibilidade", type: "textarea", visibleWhen: showAdvanced },
      { name: "responsible", label: "Responsável", type: "text", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "schedule",
    title: "Cronograma",
    singular: "etapa",
    collection: COLLECTIONS.eventSchedule,
    icon: "CR",
    tone: "rose",
    description: "Sequência de horários, montagem, atividades e encerramento.",
    addLabel: "Adicionar etapa",
    emptyTitle: "Nenhuma etapa no cronograma",
    emptyMessage: "Organize a ordem do evento por horário.",
    primaryFields: ["startTime", "endTime", "title", "responsible", "location"],
    defaults: {
      showAdvanced: false
    },
    fields: [
      { name: "startTime", label: "Horário de início", type: "time", required: true },
      { name: "endTime", label: "Horário de fim", type: "time" },
      { name: "title", label: "Atividade", type: "text", required: true },
      { name: "showAdvanced", label: "Adicionar local, responsável e observações", type: "toggle" },
      { name: "responsible", label: "Responsável", type: "text", visibleWhen: showAdvanced },
      { name: "location", label: "Local", type: "text", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "documents",
    title: "Documentos",
    singular: "documento",
    collection: COLLECTIONS.eventDocuments,
    icon: "DO",
    tone: "slate",
    description: "Links externos de notas, autorizações, listas e anexos.",
    addLabel: "Adicionar documento",
    emptyTitle: "Nenhum documento vinculado",
    emptyMessage: "No plano gratuito, registre links externos em vez de arquivos pesados.",
    primaryFields: ["title", "type", "url", "notes"],
    defaults: {
      showAdvanced: false
    },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "url", label: "Link externo", type: "url", required: true },
      { name: "showAdvanced", label: "Adicionar tipo e observações", type: "toggle" },
      { name: "type", label: "Tipo", type: "text", placeholder: "Nota, autorização, lista...", visibleWhen: showAdvanced },
      { name: "notes", label: "Observações", type: "textarea", visibleWhen: showAdvanced }
    ]
  },
  {
    id: "notes",
    title: "Observações",
    singular: "observação",
    collection: COLLECTIONS.eventHistory,
    icon: "OB",
    tone: "violet",
    description: "Decisões, alterações importantes e acontecimentos do evento.",
    addLabel: "Adicionar observação",
    emptyTitle: "Nenhuma observação registrada",
    emptyMessage: "Registre decisões ou acontecimentos importantes do planejamento.",
    primaryFields: ["title", "date", "author", "description"],
    defaults: {
      date: new Date().toISOString().slice(0, 10),
      showAdvanced: false
    },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "showAdvanced", label: "Adicionar data e autor", type: "toggle" },
      { name: "date", label: "Data", type: "date", visibleWhen: showAdvanced },
      { name: "author", label: "Autor", type: "text", visibleWhen: showAdvanced }
    ]
  }
];

export const PLANNING_SECTION_MAP = PLANNING_SECTIONS.reduce((map, section) => {
  map[section.id] = section;
  return map;
}, {});
