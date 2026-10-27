import { useEffect, useMemo, useState } from "react";
import { FormField } from "../../components/forms/FormField";
import { buildInitialPlanningValues, getVisibleFields } from "../../utils/planningDisplay";
import { validateRequiredFields } from "../../utils/validators";

const normalizePlanningValues = (values, fields) =>
  fields.reduce((payload, field) => {
    const value = values[field.name];

    if (field.type === "toggle") {
      payload[field.name] = Boolean(value);
      return payload;
    }

    if (field.type === "number" || field.type === "money") {
      payload[field.name] = value === "" ? 0 : Number(value || 0);
      return payload;
    }

    payload[field.name] = value ?? "";
    return payload;
  }, {});

export const DynamicPlanningForm = ({
  section,
  record,
  formId = "planning-record-form",
  onSubmit,
  onDirtyChange
}) => {
  const initialValues = useMemo(
    () => buildInitialPlanningValues(section, record),
    [record, section]
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

  const visibleFields = useMemo(() => getVisibleFields(section, values), [section, values]);

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

    const validationErrors = validateRequiredFields(values, visibleFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    onSubmit(normalizePlanningValues(values, section.fields));
  };

  return (
    <form id={formId} className="form-grid" onSubmit={submitForm}>
      {visibleFields.map((field) => (
        <div
          key={field.name}
          className={
            field.type === "textarea" || field.type === "segmented" || field.type === "toggle"
              ? "form-grid__full"
              : undefined
          }
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
