import {
  BUDGET_CATEGORIES,
  BUDGET_STATUS,
  ITEM_STATUS,
  ORIGIN_OPTIONS,
  PRIORITY_OPTIONS,
  TASK_STATUS
} from "./eventOptions";
import { COLLECTIONS } from "./collections";

export const RECORD_CONFIGS = {
  budget: {
    collection: COLLECTIONS.eventBudgets,
    title: "Orçamento",
    singular: "despesa",
    emptyTitle: "Nenhuma despesa registrada",
    emptyMessage: "Inclua despesas, cotações e aprovações vinculadas a este evento.",
    addLabel: "Adicionar despesa",
    columns: [
      { key: "description", label: "Descrição" },
      { key: "category", label: "Categoria" },
      { key: "quantity", label: "Qtd." },
      { key: "unitValue", label: "Valor unit.", type: "money" },
      { key: "totalValue", label: "Total" },
      { key: "status", label: "Status", type: "status", options: BUDGET_STATUS }
    ],
    fields: [
      { name: "description", label: "Descrição da despesa", type: "text", required: true },
      { name: "category", label: "Categoria", type: "select", options: BUDGET_CATEGORIES, required: true },
      { name: "quantity", label: "Quantidade", type: "number", min: 0, required: true },
      { name: "unitValue", label: "Valor unitário", type: "money", min: 0, required: true },
      { name: "supplier", label: "Fornecedor ou origem", type: "text" },
      { name: "status", label: "Status", type: "select", options: BUDGET_STATUS, required: true },
      { name: "documentUrl", label: "Link do comprovante/orçamento", type: "url" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {
      category: "Alimentação",
      quantity: 1,
      unitValue: 0,
      status: "estimado"
    }
  },
  food: {
    collection: COLLECTIONS.eventFood,
    title: "Alimentação",
    singular: "item de alimentação",
    emptyTitle: "Nenhum alimento planejado",
    emptyMessage: "Organize cardápios, bebidas, restrições e responsáveis por item.",
    addLabel: "Adicionar alimento",
    columns: [
      { key: "name", label: "Alimento/preparação" },
      { key: "group", label: "Grupo" },
      { key: "plannedQuantity", label: "Quantidade" },
      { key: "responsible", label: "Responsável" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "name", label: "Nome do alimento ou preparação", type: "text", required: true },
      { name: "group", label: "Grupo", type: "text", placeholder: "Café, almoço, lanche..." },
      { name: "plannedQuantity", label: "Quantidade planejada", type: "text", required: true },
      { name: "peopleCount", label: "Pessoas consideradas", type: "number", min: 0 },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "origin", label: "Origem/fornecedor", type: "text" },
      { name: "status", label: "Status de aquisição/preparo", type: "text" },
      { name: "restrictions", label: "Restrições e alergias", type: "textarea" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {}
  },
  location: {
    collection: COLLECTIONS.eventLocations,
    title: "Local e infraestrutura",
    singular: "informação de local",
    emptyTitle: "Nenhum detalhe de infraestrutura",
    emptyMessage: "Registre ambiente, capacidade, montagem, recursos e observações do local.",
    addLabel: "Adicionar detalhe",
    columns: [
      { key: "name", label: "Local/ambiente" },
      { key: "capacity", label: "Capacidade" },
      { key: "resources", label: "Recursos" },
      { key: "responsible", label: "Responsável" }
    ],
    fields: [
      { name: "name", label: "Nome do local ou ambiente", type: "text", required: true },
      { name: "address", label: "Endereço ou referência", type: "text" },
      { name: "capacity", label: "Capacidade estimada", type: "number", min: 0 },
      { name: "rooms", label: "Ambientes utilizados", type: "textarea" },
      { name: "layout", label: "Mesas, cadeiras e disposição", type: "textarea" },
      { name: "resources", label: "Energia, som, internet e audiovisual", type: "textarea" },
      { name: "cleaning", label: "Limpeza, montagem e desmontagem", type: "textarea" },
      { name: "accessibility", label: "Acessibilidade", type: "textarea" },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {}
  },
  items: {
    collection: COLLECTIONS.eventItems,
    title: "Itens e materiais",
    singular: "item",
    emptyTitle: "Nenhum material registrado",
    emptyMessage: "Controle o que é necessário, de onde virá e em que situação está.",
    addLabel: "Adicionar item",
    columns: [
      { key: "name", label: "Item/material" },
      { key: "category", label: "Categoria" },
      { key: "quantity", label: "Quantidade" },
      { key: "origin", label: "Origem" },
      { key: "status", label: "Status", type: "status", options: ITEM_STATUS }
    ],
    fields: [
      { name: "name", label: "Item/material", type: "text", required: true },
      { name: "category", label: "Categoria", type: "text" },
      { name: "quantity", label: "Quantidade", type: "text", required: true },
      { name: "origin", label: "Origem", type: "select", options: ORIGIN_OPTIONS },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "neededDate", label: "Data necessária", type: "date" },
      { name: "status", label: "Status", type: "select", options: ITEM_STATUS, required: true },
      { name: "relatedValue", label: "Valor relacionado", type: "money", min: 0 },
      { name: "attachmentUrl", label: "Link de anexo externo", type: "url" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {
      origin: "Escola",
      status: "necessario",
      relatedValue: 0
    }
  },
  tasks: {
    collection: COLLECTIONS.eventTasks,
    title: "Tarefas",
    singular: "tarefa",
    emptyTitle: "Nenhuma tarefa criada",
    emptyMessage: "Adicione atividades simples com responsável, prazo, prioridade e status.",
    addLabel: "Adicionar tarefa",
    columns: [
      { key: "title", label: "Tarefa" },
      { key: "responsible", label: "Responsável" },
      { key: "dueDate", label: "Prazo" },
      { key: "priority", label: "Prioridade", type: "status", options: PRIORITY_OPTIONS },
      { key: "status", label: "Status", type: "status", options: TASK_STATUS }
    ],
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "dueDate", label: "Prazo", type: "date" },
      { name: "priority", label: "Prioridade", type: "select", options: PRIORITY_OPTIONS, required: true },
      { name: "status", label: "Status", type: "select", options: TASK_STATUS, required: true },
      { name: "checklist", label: "Checklist opcional", type: "textarea", helper: "Uma linha por item." },
      { name: "notes", label: "Dependência ou observação", type: "textarea" }
    ],
    defaults: {
      priority: "media",
      status: "pendente"
    }
  },
  schedule: {
    collection: COLLECTIONS.eventSchedule,
    title: "Cronograma",
    singular: "etapa do cronograma",
    emptyTitle: "Nenhuma etapa no cronograma",
    emptyMessage: "Inclua montagem, atividades, intervalos, encerramento e desmontagem.",
    addLabel: "Adicionar etapa",
    columns: [
      { key: "startTime", label: "Início" },
      { key: "endTime", label: "Fim" },
      { key: "title", label: "Atividade" },
      { key: "responsible", label: "Responsável" },
      { key: "location", label: "Local" }
    ],
    fields: [
      { name: "startTime", label: "Horário de início", type: "time", required: true },
      { name: "endTime", label: "Horário de fim", type: "time" },
      { name: "title", label: "Atividade", type: "text", required: true },
      { name: "responsible", label: "Responsável", type: "text" },
      { name: "location", label: "Local", type: "text" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {}
  },
  people: {
    collection: COLLECTIONS.eventPeople,
    title: "Equipe e responsáveis",
    singular: "pessoa",
    emptyTitle: "Nenhuma pessoa vinculada",
    emptyMessage: "Registre equipe, funções e responsabilidades do evento.",
    addLabel: "Adicionar pessoa",
    columns: [
      { key: "name", label: "Pessoa" },
      { key: "role", label: "Função" },
      { key: "responsibility", label: "Responsabilidade" },
      { key: "contact", label: "Contato" }
    ],
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "role", label: "Função no evento", type: "text" },
      { name: "responsibility", label: "Responsabilidades", type: "textarea" },
      { name: "contact", label: "Contato", type: "text" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {}
  },
  documents: {
    collection: COLLECTIONS.eventDocuments,
    title: "Documentos e anexos",
    singular: "documento",
    emptyTitle: "Nenhum documento vinculado",
    emptyMessage: "No plano gratuito, registre links externos de documentos, notas, imagens e listas.",
    addLabel: "Adicionar link",
    columns: [
      { key: "title", label: "Documento" },
      { key: "type", label: "Tipo" },
      { key: "url", label: "Link", type: "link" },
      { key: "notes", label: "Observações" }
    ],
    fields: [
      { name: "title", label: "Título do documento", type: "text", required: true },
      { name: "type", label: "Tipo", type: "text", placeholder: "Orçamento, nota, autorização..." },
      { name: "url", label: "Link externo", type: "url", required: true },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    defaults: {}
  },
  history: {
    collection: COLLECTIONS.eventHistory,
    title: "Observações e histórico",
    singular: "registro",
    emptyTitle: "Nenhum registro no histórico",
    emptyMessage: "Registre decisões, alterações relevantes e acontecimentos do evento.",
    addLabel: "Adicionar registro",
    columns: [
      { key: "date", label: "Data" },
      { key: "title", label: "Registro" },
      { key: "author", label: "Autor" }
    ],
    fields: [
      { name: "date", label: "Data", type: "date", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "author", label: "Autor", type: "text" }
    ],
    defaults: {}
  }
};
