export const isBlank = (value) => String(value || "").trim().length === 0;

export const isValidUrl = (value) => {
  if (isBlank(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const validateRequiredFields = (values, fields) => {
  const errors = {};

  fields.forEach((field) => {
    if (field.required && isBlank(values[field.name])) {
      errors[field.name] = "Preencha este campo para continuar.";
    }

    if (field.type === "url" && !isValidUrl(values[field.name])) {
      errors[field.name] = "Informe um link válido começando com http:// ou https://.";
    }

    if (
      ["number", "money"].includes(field.type) &&
      values[field.name] !== "" &&
      values[field.name] !== undefined
    ) {
      const numberValue = Number(values[field.name]);

      if (!Number.isFinite(numberValue)) {
        errors[field.name] = "Informe um número válido.";
      }

      if (field.min !== undefined && numberValue < field.min) {
        errors[field.name] = `O valor mínimo é ${field.min}.`;
      }
    }
  });

  return errors;
};

export const validateEvent = (values) => {
  const errors = validateRequiredFields(values, [
    { name: "name", required: true },
    { name: "status", required: true }
  ]);

  if (values.startDateTime && values.endDateTime) {
    const start = new Date(values.startDateTime);
    const end = new Date(values.endDateTime);

    if (start > end) {
      errors.endDateTime = "O término deve acontecer depois do início.";
    }
  }

  if (values.estimatedAudience && Number(values.estimatedAudience) < 0) {
    errors.estimatedAudience = "Informe um público estimado válido.";
  }

  if (values.budgetLimit && Number(values.budgetLimit) < 0) {
    errors.budgetLimit = "Informe um orçamento válido ou deixe em branco.";
  }

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors || {}).length > 0;
