import api from "./api";

export const getDashboardNotifications = async () => {
  const response = await api.get("/notifications");

  return response.data;
};
