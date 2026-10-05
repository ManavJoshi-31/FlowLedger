import api from "./api";

export const getBudgets = async () => {
  const response = await api.get("/budgets");

  const budgets = response.data.budgets.map((budget) => ({
    ...budget,
    totalAmount: budget.totalAmount.$numberDecimal,
    usedAmount: budget.usedAmount.$numberDecimal,
  }));

  return {
    ...response.data,
    budgets,
  };
};
export const createBudget = async (budgetData) => {
  const response = await api.post("/budgets", budgetData);

  return response.data;
};
