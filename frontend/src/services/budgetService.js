import api from "./api";

const normalizeBudget = (budget) => {
  if (!budget) return budget;
  return {
    ...budget,
    totalAmount:
      budget.totalAmount?.$numberDecimal !== undefined
        ? budget.totalAmount.$numberDecimal
        : String(budget.totalAmount ?? 0),
    usedAmount:
      budget.usedAmount?.$numberDecimal !== undefined
        ? budget.usedAmount.$numberDecimal
        : String(budget.usedAmount ?? 0),
  };
};

export const getBudgets = async () => {
  const response = await api.get("/budgets");

  const budgets = (response.data.budgets || []).map(normalizeBudget);

  return {
    ...response.data,
    budgets,
  };
};

export const createBudget = async (budgetData) => {
  const response = await api.post("/budgets", budgetData);

  return {
    ...response.data,
    budget: normalizeBudget(response.data.budget),
  };
};

export const updateBudget = async (budgetId, budgetData) => {
  const response = await api.patch(`/budgets/${budgetId}`, budgetData);

  return {
    ...response.data,
    budget: normalizeBudget(response.data.budget),
  };
};

export const closeBudget = async (budgetId) => {
  const response = await api.patch(`/budgets/${budgetId}/close`);

  return {
    ...response.data,
    budget: normalizeBudget(response.data.budget),
  };
};

export const getBudgetById = async (budgetId) => {
  const response = await api.get(`/budgets/${budgetId}`);

  return {
    ...response.data,
    budget: normalizeBudget(response.data.budget),
  };
};
