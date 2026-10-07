import api from "./api";

const normalizeRequest = (request) => {
  if (!request) return request;
  return {
    ...request,
    amount:
      request.amount?.$numberDecimal !== undefined
        ? request.amount.$numberDecimal
        : String(request.amount ?? 0),
  };
};

export const getFinancialRequests = async () => {
  const response = await api.get("/financial-requests");

  const requests = (response.data.requests || []).map(normalizeRequest);

  return {
    ...response.data,
    requests,
  };
};

export const createFinancialRequest = async (requestData) => {
  const response = await api.post("/financial-requests", requestData);

  return {
    ...response.data,
    financialRequest: normalizeRequest(response.data.financialRequest),
  };
};
export const approveFinancialRequest = async (requestId, remarks = "") => {
  const response = await api.patch(`/financial-requests/${requestId}/approve`, {
    remarks,
  });

  return response.data;
};

export const rejectFinancialRequest = async (requestId, remarks = "") => {
  const response = await api.patch(`/financial-requests/${requestId}/reject`, {
    remarks,
  });

  return response.data;
};
