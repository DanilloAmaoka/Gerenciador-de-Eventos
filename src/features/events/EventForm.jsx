import { useEffect, useMemo, useState } from "react";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { FormField } from "../../components/forms/FormField";
import { validateEvent } from "../../utils/validators";
import { getDateTimeInputValue } from "../../utils/formatters";

const EMPTY_EVENT = {
  name: "",
  description: "",
  startDateTime: "",
  endDateTime: "",
  locationName: "",
  primaryResponsible: "",
  estimatedAudience: "",
  budgetLimit: "",
  status: "planejado",
  notes: ""
};

const buildInitialValues = (event) => ({
  ...EMPTY_EVENT,
  ...(event || {}),
  startDateTime: getDateTimeInputValue(event?.startDateTime),
  endDateTime: getDateTimeInputValue(event?.endDateTime)
});

export const EventForm = ({ event, formId = "event-form", onSubmit, onDirtyChange }) => {
  const isEditing = Boolean(event);
  const initialValues = useMemo(() => buildInitialValues(event), [event]);
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

  const submitForm = (submitEvent) => {
    submitEvent.preventDefault();

    const validationErrors = validateEvent(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    onSubmit({
      ...values,
      estimatedAudience: Number(values.estimatedAudience || 0),
      budgetLimit: Number(values.budgetLimit || 0)
    });
  };

  return (
    <form id={formId} className="form-grid" onSubmit={submitForm}>
      <FormField
        label="Nome do evento"
        name="name"
        value={values.name}
        onChange={updateField}
        error={errors.name}
        required
      />
      <FormField
        label="Data e horário"
        name="startDateTime"
        type="datetime-local"
        value={values.startDateTime}
        onChange={updateField}
        error={errors.startDateTime}
      />
      <FormField
        label="Término, se houver"
        name="endDateTime"
        type="datetime-local"
        value={values.endDateTime}
        onChange={updateField}
        error={errors.endDateTime}
      />
      <FormField
        label="Local, se já conhecido"
        name="locationName"
        value={values.locationName}
        onChange={updateField}
        error={errors.locationName}
      />
      <FormField
        label="Responsável principal, se aplicável"
        name="primaryResponsible"
        value={values.primaryResponsible}
        onChange={updateField}
        error={errors.primaryResponsible}
      />
      <FormField
        label="Orçamento geral opcional"
        name="budgetLimit"
        type="money"
        min={0}
        value={values.budgetLimit}
        onChange={updateField}
        error={errors.budgetLimit}
        helper="Deixe em branco quando o evento ainda não tiver orçamento definido."
      />
      {isEditing ? (
        <>
          <FormField
            label="Público estimado, se houver"
            name="estimatedAudience"
            type="number"
            min={0}
            value={values.estimatedAudience}
            onChange={updateField}
            error={errors.estimatedAudience}
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={values.status}
            onChange={updateField}
            error={errors.status}
            options={EVENT_STATUS}
            required
          />
        </>
      ) : null}
      <div className="form-grid__full">
        <FormField
          label="Descrição curta ou objetivo"
          name="description"
          type="textarea"
          value={values.description}
          onChange={updateField}
          error={errors.description}
        />
      </div>
      {isEditing ? (
        <div className="form-grid__full">
          <FormField
            label="Observações"
            name="notes"
            type="textarea"
            value={values.notes}
            onChange={updateField}
            error={errors.notes}
          />
        </div>
      ) : null}
    </form>
  );
};
