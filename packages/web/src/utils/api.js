import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.scuttle.gg"
    : "http://localhost:4000";

const API_KEY = process.env.REACT_APP_SCUTTLE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY, // Attach API key to every request
  },
});

// Global error handling (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `API Request Failed: ${error.config?.url} - ${error.message}`
    );
    return Promise.reject(error);
  }
);

export default api;
