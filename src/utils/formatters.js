const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "short"
});

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export const toDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "Sem data";
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : "Sem horário";
};

export const formatWeekday = (value) => {
  const date = toDate(value);
  return date ? weekdayFormatter.format(date) : "Sem data";
};

export const formatTime = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length <= 5) {
    return value;
  }

  const date = toDate(value);
  return date
    ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";
};

export const formatCurrency = (value) => {
  const numberValue = Number(value || 0);
  return currencyFormatter.format(Number.isFinite(numberValue) ? numberValue : 0);
};

export const formatStatus = (value, options = []) => {
  const match = options.find((option) => option.value === value);
  return match?.label || value || "Sem status";
};

export const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const getDateInputValue = (value) => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
};

export const getDateTimeInputValue = (value) => {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const sortByDate = (items, key = "startDateTime") =>
  [...items].sort((first, second) => {
    const firstDate = toDate(first[key])?.getTime() || 0;
    const secondDate = toDate(second[key])?.getTime() || 0;
    return firstDate - secondDate;
  });
