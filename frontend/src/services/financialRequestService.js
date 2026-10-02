import api from "./api";

export const getFinancialRequests = async () => {
  const response = await api.get("/financial-requests");

  const requests = response.data.requests.map((request) => ({
    ...request,
    amount: request.amount.$numberDecimal,
  }));

  return {
    ...response.data,
    requests,
  };
};
