import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  // Retrieve token from session storage (cleared upon browser close)
  const token = sessionStorage.getItem("flowledger_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("flowledger_token");
      sessionStorage.removeItem("flowledger_user");

      try {
        localStorage.removeItem("flowledger_token");
        localStorage.removeItem("flowledger_user");
      } catch {
        // Ignore storage access errors
      }

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
