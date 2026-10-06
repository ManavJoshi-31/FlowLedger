import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};

export const getDepartmentManagers = async () => {
  const response = await api.get("/users/department-managers");

  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);

  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.patch(`/users/${userId}`, userData);

  return response.data;
};
