import axios from "axios";

const DEFAULT_TIMEOUT_MS = 15000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    config.metadata = { startedAt: Date.now() };
    const requestId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    config.headers["X-Client-Request-ID"] = requestId;
    if (process.env.NODE_ENV === "development") {
      // Keep request logging lightweight and easy to scan in local dev.
      console.log(
        "[MotoForge API]",
        config.method?.toUpperCase(),
        config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      );
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const config = error?.config || {};
    const statusCode = error?.response?.status || 0;
    const retries = config.__retryCount || 0;
    const shouldRetry =
      retries < 2 &&
      (error.code === "ECONNABORTED" ||
        !statusCode ||
        RETRYABLE_STATUS_CODES.has(statusCode));

    if (shouldRetry) {
      config.__retryCount = retries + 1;
      return new Promise((resolve) => {
        const delayMs = 300 * config.__retryCount;
        setTimeout(() => resolve(api(config)), delayMs);
      });
    }

    const responsePayload = error?.response?.data || {};
    const normalizedError = {
      status: statusCode || 500,
      code: responsePayload?.code || "request_failed",
      requestId: responsePayload?.request_id || null,
      message:
        responsePayload?.message ||
        responsePayload?.detail ||
        error?.message ||
        "Something went wrong while contacting the MotoForge API.",
    };

    return Promise.reject(normalizedError);
  },
);

export function fetchMotorcycle(id) {
  return api.get(`/api/motorcycles/${id}`);
}

export function fetchCatalogBrands() {
  return api.get("/api/catalog/brands");
}

export function fetchCatalogModels(brandName, brandId) {
  return api.get("/api/catalog/models", {
    params: {
      brand_name: brandName,
      brand_id: brandId || undefined,
    },
  });
}

export function importCatalogMotorcycle(payload) {
  return api.post("/api/catalog/import", payload);
}

export function fetchParts(bikeId) {
  return api.get(`/api/motorcycles/${bikeId}/parts`);
}

export function postQuote(motorcycleId, selectedPartIds, ownsBike = false) {
  return api.post("/api/quote", {
    motorcycle_id: motorcycleId,
    selected_part_ids: selectedPartIds,
    owns_bike: ownsBike,
  });
}

export default api;
