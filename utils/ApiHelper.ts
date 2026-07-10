// src/api/apiClient.ts

import { URL_CONFIGS } from "@/config/urls";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { logApi } from "./logger";

/**
 * Shared Axios instance for API calls.
 * Automatically uses the CORE_API_BASE_URL.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: URL_CONFIGS.CORE_API_BASE_URL,
  timeout: 5000, // 5 seconds
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use((config) => {
  logApi("REQUEST", {
    method: config.method?.toUpperCase(),
    url: (config.baseURL ?? "") + (config.url ?? ""),
    requestBody: config.data,
    params: config.params,
  });
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logApi("RESPONSE", {
      method: response.config.method?.toUpperCase(),
      url: (response.config.baseURL ?? "") + (response.config.url ?? ""),
      status: response.status,
      responseBody: response.data,
    });
    return response;
  },
  (error) => {
    logApi("ERROR", {
      method: error.config?.method?.toUpperCase(),
      url: (error.config?.baseURL ?? "") + (error.config?.url ?? ""),
      status: error.response?.status,
      responseBody: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 * @template T Expected response type
 * @param path Relative API path (e.g., "/api/hello")
 * @returns Promise resolving with the typed response data
 */
export async function apiGet<T = unknown>(path: string): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.get<T>(path);
  return response.data;
}

/**
 * Generic POST request
 * @template T Expected response type
 * @template B Request body type
 * @param path Relative API path (e.g., "/api/items")
 * @param body Request payload object
 * @returns Promise resolving with the typed response data
 */
export async function apiPost<T = unknown, B = unknown>(
  path: string,
  body: B
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.post<T>(path, body);
  return response.data;
}

/**
 * Generic DELETE request
 * @template T Expected response type
 * @param path Relative API path (e.g., "/api/items/1")
 * @returns Promise resolving with the typed response data
 */
export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.delete<T>(path);
  return response.data;
}

export { apiClient };

