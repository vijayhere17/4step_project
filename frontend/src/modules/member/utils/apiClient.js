const ENV_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();

const getFallbackBaseUrls = () => {
  const browserHost = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";

  const candidates = [
    ENV_BASE,
    `http://${browserHost}:8000/api`,
    "http://127.0.0.1:8000/api",
    "http://localhost:8000/api",
    "/api",
  ].filter(Boolean);

  return [...new Set(candidates)];
};

let activeApiBase = null;

export async function requestMemberApi(pathWithQuery, options = {}) {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  const fallbackBaseUrls = getFallbackBaseUrls();

  const orderedBaseUrls = activeApiBase
    ? [activeApiBase, ...fallbackBaseUrls.filter((base) => base !== activeApiBase)]
    : fallbackBaseUrls;

  let networkError = null;
  let lastApiErrorResponse = null;

  for (const baseUrl of orderedBaseUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      const bodyText = await response.text();
      const contentType = (response.headers.get("content-type") || "").toLowerCase();

      let data = {};
      if (bodyText) {
        try {
          data = JSON.parse(bodyText);
        } catch {
          data = { raw: bodyText };
        }
      }

      const isLikelyJsonApi =
        contentType.includes("application/json") ||
        (data && typeof data === "object" && ("message" in data || "data" in data || "errors" in data));

      if (response.ok) {
        activeApiBase = baseUrl;

        return {
          ok: true,
          status: response.status,
          data,
        };
      }

      if (isLikelyJsonApi && response.status !== 404) {
        activeApiBase = baseUrl;

        return {
          ok: false,
          status: response.status,
          data,
        };
      }

      lastApiErrorResponse = {
        ok: false,
        status: response.status,
        data,
      };
    } catch (error) {
      networkError = error;
    }
  }

  if (lastApiErrorResponse) {
    return lastApiErrorResponse;
  }

  throw networkError || new Error("Unable to connect to backend.");
}
