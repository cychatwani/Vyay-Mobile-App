// src/lib/logService.ts
export const shouldLog = () => __DEV__; // Only log in Expo dev builds

export const logApi = (tag: string, payload: any) => {

  if (!shouldLog()) return;

  const safe = { ...payload };

  // Truncate request/response body previews
  if (safe.requestBody) {
    safe.requestBody =
      typeof safe.requestBody === "string"
        ? truncate(safe.requestBody)
        : truncate(JSON.stringify(safe.requestBody));
  }
  if (safe.responseBody) {
    safe.responseBody =
      typeof safe.responseBody === "string"
        ? truncate(safe.responseBody)
        : truncate(JSON.stringify(safe.responseBody));
  }

  console.log(`[API-${tag}]`, safe);
};

const truncate = (str: string, max = 1000) =>
  str.length > max ? str.slice(0, max) + "...[truncated]" : str;
