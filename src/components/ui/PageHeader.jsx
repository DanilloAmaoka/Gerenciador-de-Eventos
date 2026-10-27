export const PageHeader = ({ title, description, actions, eyebrow }) => (
  <header className="page-header">
    <div className="page-header__content">
      {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className="page-header__actions">{actions}</div> : null}
  </header>
);
