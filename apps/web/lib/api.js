import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      // Keep request logging lightweight and easy to scan in local dev.
      console.log("[MotoForge API]", config.method?.toUpperCase(), config.baseURL ? `${config.baseURL}${config.url}` : config.url);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = {
      status: error?.response?.status || 500,
      message:
        error?.response?.data?.detail ||
        error?.message ||
        "Something went wrong while contacting the MotoForge API.",
    };

    return Promise.reject(normalizedError);
  },
);

export function fetchMotorcycle(id) {
  return api.get(`/api/motorcycles/${id}`);
}

export function fetchParts(bikeId) {
  return api.get(`/api/motorcycles/${bikeId}/parts`);
}

export function postQuote(motorcycleId, selectedPartIds) {
  return api.post("/api/quote", {
    motorcycle_id: motorcycleId,
    selected_part_ids: selectedPartIds,
  });
}

export default api;
