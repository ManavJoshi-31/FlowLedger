import api from "./api";

export const getDepartmentManagers = async () => {
  const response = await api.get("/users/department-managers");

  return response.data;
};
