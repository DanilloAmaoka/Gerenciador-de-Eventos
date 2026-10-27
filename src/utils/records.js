import { formatCurrency, formatDate, formatStatus } from "./formatters";

export const getRecordLabel = (record, fallback = "registro") =>
  record.name || record.title || record.description || record.label || fallback;

export const buildRecordInitialValues = (fields, defaults = {}, record = null) => {
  const values = { ...defaults, ...(record || {}) };

  fields.forEach((field) => {
    if (values[field.name] === undefined || values[field.name] === null) {
      values[field.name] = field.type === "number" || field.type === "money" ? 0 : "";
    }
  });

  return values;
};

export const getDisplayValue = (record, column) => {
  const value = record[column.key];

  if (column.key === "totalValue") {
    const total = Number(record.quantity || 0) * Number(record.unitValue || 0);
    return formatCurrency(total);
  }

  if (column.type === "money") {
    return formatCurrency(value);
  }

  if (column.type === "status") {
    return formatStatus(value, column.options);
  }

  if (column.key.toLowerCase().includes("date") && value) {
    return formatDate(value);
  }

  return value || "Não informado";
};

export const getStatusTone = (value, options = []) => {
  const match = options.find((option) => option.value === value);
  return match?.tone || "neutral";
};

export const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    const groupKey = item[key] || "Não informado";
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {});
