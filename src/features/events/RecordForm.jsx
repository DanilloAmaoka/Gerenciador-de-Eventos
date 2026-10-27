import { useEffect, useMemo, useState } from "react";
import { FormField } from "../../components/forms/FormField";
import { buildRecordInitialValues } from "../../utils/records";
import { validateRequiredFields } from "../../utils/validators";

const normalizeValues = (values, fields) =>
  fields.reduce((result, field) => {
    const value = values[field.name];

    if (field.type === "number" || field.type === "money") {
      result[field.name] = value === "" ? 0 : Number(value || 0);
      return result;
    }

    result[field.name] = value ?? "";
    return result;
  }, {});

export const RecordForm = ({
  config,
  record,
  formId = "record-form",
  onSubmit,
  onDirtyChange
}) => {
  const initialValues = useMemo(
    () => buildRecordInitialValues(config.fields, config.defaults, record),
    [config, record]
  );
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(values) !== JSON.stringify(initialValues));
  }, [initialValues, onDirtyChange, values]);

  const updateField = (name, value) => {
    setValues((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined
    }));
  };

  const submitForm = (event) => {
    event.preventDefault();

    const validationErrors = validateRequiredFields(values, config.fields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    onSubmit(normalizeValues(values, config.fields));
  };

  return (
    <form id={formId} className="form-grid" onSubmit={submitForm}>
      {config.fields.map((field) => (
        <div
          key={field.name}
          className={field.type === "textarea" ? "form-grid__full" : undefined}
        >
          <FormField
            {...field}
            value={values[field.name]}
            onChange={updateField}
            error={errors[field.name]}
          />
        </div>
      ))}
    </form>
  );
};
