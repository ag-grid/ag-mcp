import { API_URL } from "../constants.js";
import {
  GridVersion,
  SearchResponse,
  CollectionResponse,
  ItemResponse,
  ArticleData,
  DefinitionData,
  ExampleData,
  RequestOptions,
} from "./types.js";
import { GridFramework, GridLanguage } from "../constants.js";

// Browser-like headers to bypass WAF
const getBrowserHeaders = (): Record<string, string> => ({
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  DNT: "1",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
});

// Common API fetch wrapper - handles URL construction and headers
const apiFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getBrowserHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response;
};

export const fetchVersions = async (): Promise<GridVersion[]> => {
  const response = await apiFetch("/versions");
  const data = await response.json();
  return data.data as GridVersion[];
};

export const fetchFrameworks = async (): Promise<GridFramework[]> => {
  const response = await apiFetch("/frameworks");
  const data = await response.json();
  return data as GridFramework[];
};

export const fetchDefinitions = async (
  version: string
): Promise<CollectionResponse> => {
  const response = await apiFetch(`/${version}/definitions`);
  const data = await response.json();
  return data as CollectionResponse;
};

export const fetchDefinition = async (
  version: string,
  definitionName: string
): Promise<ItemResponse<DefinitionData>> => {
  const response = await apiFetch(
    `/${version}/definition/${encodeURIComponent(definitionName)}`
  );
  const data = await response.json();
  return data as ItemResponse<DefinitionData>;
};

export const fetchSearch = async (
  version: string,
  framework: GridFramework,
  query: string,
  options?: Partial<RequestOptions>
): Promise<SearchResponse> => {
  const params = new URLSearchParams({ q: query });

  if (options?.language) params.append("language", options.language);
  if (options?.examples) params.append("examples", options.examples);
  if (options?.links) params.append("links", options.links);

  const response = await apiFetch(
    `/${version}/${framework}/search?${params.toString()}`
  );
  const data = await response.json();
  return data as SearchResponse;
};

export const fetchArticles = async (
  version: string,
  framework: GridFramework,
  options?: Partial<RequestOptions>
): Promise<CollectionResponse> => {
  const params = new URLSearchParams();

  if (options?.language) params.append("language", options.language);
  if (options?.examples) params.append("examples", options.examples);
  if (options?.links) params.append("links", options.links);

  const queryString = params.toString();
  const path = `/${version}/${framework}/articles${
    queryString ? "?" + queryString : ""
  }`;

  const response = await apiFetch(path);
  const data = await response.json();
  return data as CollectionResponse;
};

export const fetchArticle = async (
  version: string,
  framework: GridFramework,
  slug: string,
  options?: Partial<RequestOptions>
): Promise<ItemResponse<ArticleData>> => {
  const params = new URLSearchParams();

  if (options?.language) params.append("language", options.language);
  if (options?.examples) params.append("examples", options.examples);
  if (options?.links) params.append("links", options.links);

  const queryString = params.toString();
  const path = `/${version}/${framework}/article/${encodeURIComponent(slug)}${
    queryString ? "?" + queryString : ""
  }`;

  const response = await apiFetch(path);
  const data = await response.json();
  return data as ItemResponse<ArticleData>;
};

export const fetchExamples = async (
  version: string,
  framework: GridFramework,
  language: GridLanguage,
  options?: Partial<RequestOptions>
): Promise<CollectionResponse> => {
  const params = new URLSearchParams();

  if (options?.examples) params.append("examples", options.examples);
  if (options?.links) params.append("links", options.links);

  const queryString = params.toString();
  const path = `/${version}/${framework}/${language}/examples${
    queryString ? "?" + queryString : ""
  }`;

  const response = await apiFetch(path);
  const data = await response.json();
  return data as CollectionResponse;
};

export const fetchExample = async (
  version: string,
  framework: GridFramework,
  language: GridLanguage,
  articleSlug: string,
  exampleSlug: string,
  options?: Partial<RequestOptions>
): Promise<ItemResponse<ExampleData>> => {
  const params = new URLSearchParams();

  if (options?.examples) params.append("examples", options.examples);
  if (options?.links) params.append("links", options.links);

  const queryString = params.toString();
  const path = `/${version}/${framework}/${language}/example/${encodeURIComponent(
    articleSlug
  )}/${encodeURIComponent(exampleSlug)}${queryString ? "?" + queryString : ""}`;

  const response = await apiFetch(path);
  const data = await response.json();
  return data as ItemResponse<ExampleData>;
};
