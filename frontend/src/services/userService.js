import api from "./api";

const normalizeUser = (user) => {
  if (!user) return user;
  const id = user._id || user.id;

  return {
    ...user,
    _id: id,
    id,
  };
};

export const getUsers = async () => {
  const response = await api.get("/users");
  const users = (response.data.users || []).map(normalizeUser);

  return {
    ...response.data,
    users,
  };
};

export const getDepartmentManagers = async () => {
  const response = await api.get("/users/department-managers");
  const managers = (response.data.managers || []).map(normalizeUser);

  return {
    ...response.data,
    managers,
  };
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);

  return {
    ...response.data,
    user: normalizeUser(response.data.user),
  };
};

export const updateUser = async (userId, userData) => {
  const response = await api.patch(`/users/${userId}`, userData);

  return {
    ...response.data,
    user: normalizeUser(response.data.user),
  };
};
