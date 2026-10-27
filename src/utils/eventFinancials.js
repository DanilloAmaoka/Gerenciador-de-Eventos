export const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getFoodPlannedCost = (record) => {
  if (record.costMode === "unit") {
    return toNumber(record.quantity) * toNumber(record.unitCost);
  }

  return toNumber(record.totalCost);
};

export const getPeoplePlannedCost = (record) => {
  if (record.participationType === "fixed") {
    return toNumber(record.fixedAmount);
  }

  if (record.participationType === "hourly") {
    return toNumber(record.hours) * toNumber(record.hourlyRate);
  }

  return 0;
};

export const getItemPlannedCost = (record) => toNumber(record.plannedCost);

export const getRecordPlannedCost = (sectionId, record) => {
  if (sectionId === "food") {
    return getFoodPlannedCost(record);
  }

  if (sectionId === "people") {
    return getPeoplePlannedCost(record);
  }

  if (sectionId === "items") {
    return getItemPlannedCost(record);
  }

  return 0;
};

export const getExpenseAmount = (record) => toNumber(record.amount);

export const calculateEventFinancials = (recordsBySection, budgetLimit) => {
  const plannedCost = Object.entries(recordsBySection).reduce(
    (sum, [sectionId, records]) =>
      sum +
      records.reduce(
        (sectionSum, record) => sectionSum + getRecordPlannedCost(sectionId, record),
        0
      ),
    0
  );

  const actualCost = (recordsBySection.expenses || []).reduce(
    (sum, record) => sum + getExpenseAmount(record),
    0
  );

  const budget = toNumber(budgetLimit);
  const hasBudget = budget > 0;

  return {
    plannedCost,
    actualCost,
    budget,
    hasBudget,
    forecastBalance: hasBudget ? budget - plannedCost : null,
    realBalance: hasBudget ? budget - actualCost : null,
    consumedPercentage: hasBudget ? (actualCost / budget) * 100 : null
  };
};
