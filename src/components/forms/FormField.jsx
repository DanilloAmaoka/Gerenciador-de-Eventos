export const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  helper,
  options = [],
  required = false,
  placeholder,
  min,
  disabled
}) => {
  if (type === "toggle") {
    return (
      <label className="toggle-field" htmlFor={name}>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(name, event.target.checked)}
          disabled={disabled}
        />
        <span>
          {label}
          {helper ? <small>{helper}</small> : null}
        </span>
      </label>
    );
  }

  if (type === "segmented") {
    return (
      <fieldset className="segmented-field">
        <legend>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </legend>
        <div className="segmented-control">
          {options.map((option) => {
            const valueOption = typeof option === "string" ? option : option.value;
            const labelOption = typeof option === "string" ? option : option.label;

            return (
              <label
                key={valueOption}
                className={
                  value === valueOption
                    ? "segmented-control__item segmented-control__item--active"
                    : "segmented-control__item"
                }
              >
                <input
                  type="radio"
                  name={name}
                  value={valueOption}
                  checked={value === valueOption}
                  onChange={(event) => onChange(name, event.target.value)}
                  disabled={disabled}
                />
                <span>{labelOption}</span>
              </label>
            );
          })}
        </div>
        {helper ? (
          <small className="form-field__helper" id={`${name}-helper`}>
            {helper}
          </small>
        ) : null}
        {error ? (
          <small className="form-field__error" id={`${name}-error`}>
            {error}
          </small>
        ) : null}
      </fieldset>
    );
  }

  const commonProps = {
    id: name,
    name,
    value: value ?? "",
    onChange: (event) => onChange(name, event.target.value),
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${name}-error` : helper ? `${name}-helper` : undefined,
    required,
    placeholder,
    disabled
  };

  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-field__label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {type === "textarea" ? (
        <textarea {...commonProps} rows={4} />
      ) : type === "select" ? (
        <select {...commonProps}>
          <option value="">Selecione</option>
          {options.map((option) => {
            const valueOption = typeof option === "string" ? option : option.value;
            const labelOption = typeof option === "string" ? option : option.label;

            return (
              <option key={valueOption} value={valueOption}>
                {labelOption}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          {...commonProps}
          type={type === "money" ? "number" : type}
          min={min}
          step={type === "money" ? "0.01" : type === "number" ? "1" : undefined}
        />
      )}
      {helper ? (
        <small className="form-field__helper" id={`${name}-helper`}>
          {helper}
        </small>
      ) : null}
      {error ? (
        <small className="form-field__error" id={`${name}-error`}>
          {error}
        </small>
      ) : null}
    </label>
  );
};
