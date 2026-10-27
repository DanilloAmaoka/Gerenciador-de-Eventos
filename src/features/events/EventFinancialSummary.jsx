import { formatCurrency } from "../../utils/formatters";

export const EventFinancialSummary = ({ financials }) => {
  const items = [
    {
      label: "Custo planejado",
      value: formatCurrency(financials.plannedCost),
      helper: "Alimentação, pessoas e itens planejados"
    },
    {
      label: "Gasto realizado",
      value: formatCurrency(financials.actualCost),
      helper: "Soma das despesas registradas"
    }
  ];

  if (financials.hasBudget) {
    items.push(
      {
        label: "Orçamento",
        value: formatCurrency(financials.budget),
        helper: "Valor limite informado no evento"
      },
      {
        label: "Saldo previsto",
        value: formatCurrency(financials.forecastBalance),
        helper: "Orçamento menos custo planejado"
      },
      {
        label: "Saldo real",
        value: formatCurrency(financials.realBalance),
        helper: "Orçamento menos gasto realizado"
      }
    );
  }

  return (
    <section className="event-financials" aria-label="Resumo financeiro do evento">
      <div className="event-financials__cards">
        {items.map((item) => (
          <div className="financial-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
          </div>
        ))}
      </div>
      {financials.hasBudget ? (
        <div className="budget-progress">
          <div className="budget-progress__label">
            <span>Percentual consumido do orçamento</span>
            <strong>{Math.round(financials.consumedPercentage)}%</strong>
          </div>
          <div className="budget-progress__track" aria-hidden="true">
            <span style={{ width: `${Math.min(100, financials.consumedPercentage)}%` }} />
          </div>
        </div>
      ) : null}
    </section>
  );
};
