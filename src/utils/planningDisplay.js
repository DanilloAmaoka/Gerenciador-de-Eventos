import { FOOD_STATUS, ITEM_STATUS, PRIORITY_OPTIONS, TASK_STATUS } from "../constants/eventOptions";
import { PLANNING_SECTION_MAP } from "../constants/planningSections";
import { formatCurrency, formatDate, formatStatus } from "./formatters";
import { getExpenseAmount, getRecordPlannedCost, toNumber } from "./eventFinancials";

const STATUS_OPTIONS_BY_FIELD = {
  status: [...FOOD_STATUS, ...ITEM_STATUS, ...TASK_STATUS],
  priority: PRIORITY_OPTIONS
};

export const getVisibleFields = (section, values) =>
  section.fields.filter((field) => !field.visibleWhen || field.visibleWhen(values));

export const buildInitialPlanningValues = (section, record = null) => {
  const values = { ...(section.defaults || {}), ...(record || {}) };

  section.fields.forEach((field) => {
    if (values[field.name] !== undefined && values[field.name] !== null) {
      return;
    }

    if (field.type === "toggle") {
      values[field.name] = false;
      return;
    }

    if (field.type === "number" || field.type === "money") {
      values[field.name] = "";
      return;
    }

    values[field.name] = "";
  });

  return values;
};

export const getPlanningRecordTitle = (sectionId, record) => {
  if (sectionId === "expenses") {
    return record.description || "Despesa";
  }

  if (sectionId === "schedule") {
    return record.title || "Etapa";
  }

  return record.name || record.title || record.description || "Registro";
};

export const getParticipationLabel = (record) => {
  if (record.participationType === "fixed") {
    return "Valor fixo";
  }

  if (record.participationType === "hourly") {
    return "Por hora";
  }

  if (record.trackHours || record.hoursOnly) {
    return `${toNumber(record.hoursOnly)}h sem remuneração`;
  }

  return "Sem custo";
};

export const getQuantityLabel = (record) => {
  const quantity = record.quantity ? String(record.quantity) : "";
  const unit = record.unit ? String(record.unit) : "";
  return [quantity, unit].filter(Boolean).join(" ") || "Quantidade livre";
};

export const getPlanningValue = (sectionId, record, key) => {
  if (key === "plannedCost") {
    return formatCurrency(getRecordPlannedCost(sectionId, record));
  }

  if (key === "amount") {
    return formatCurrency(getExpenseAmount(record));
  }

  if (key === "quantityLabel") {
    return getQuantityLabel(record);
  }

  if (key === "participationLabel") {
    return getParticipationLabel(record);
  }

  if (key.toLowerCase().includes("date") && record[key]) {
    return formatDate(record[key]);
  }

  if (key === "status" || key === "priority") {
    return formatStatus(record[key], STATUS_OPTIONS_BY_FIELD[key]);
  }

  return record[key] || "Não informado";
};

const SPECIAL_FIELD_LABELS = {
  plannedCost: "Custo planejado",
  amount: "Valor",
  quantityLabel: "Quantidade",
  participationLabel: "Participação"
};

export const getPlanningFieldLabel = (section, key) => {
  if (SPECIAL_FIELD_LABELS[key]) {
    return SPECIAL_FIELD_LABELS[key];
  }

  return section.fields.find((field) => field.name === key)?.label || key;
};

export const getSectionPlannedCost = (sectionId, records) =>
  records.reduce((sum, record) => sum + getRecordPlannedCost(sectionId, record), 0);

export const getSectionActualCost = (sectionId, records) => {
  if (sectionId !== "expenses") {
    return 0;
  }

  return records.reduce((sum, record) => sum + getExpenseAmount(record), 0);
};

export const getSectionByCollection = (collectionName) =>
  Object.values(PLANNING_SECTION_MAP).find((section) => section.collection === collectionName);
