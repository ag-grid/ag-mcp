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

export const fetchVersions = async (): Promise<GridVersion[]> => {
  const url = `${API_URL}/versions`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch versions: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as GridVersion[];
};

export const fetchFrameworks = async (): Promise<GridFramework[]> => {
  const url = `${API_URL}/frameworks`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch frameworks: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as GridFramework[];
};

export const fetchDefinitions = async (
  version: string
): Promise<CollectionResponse> => {
  const url = `${API_URL}/${version}/definitions`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch definitions: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as CollectionResponse;
};

export const fetchDefinition = async (
  version: string,
  definitionName: string
): Promise<ItemResponse<DefinitionData>> => {
  const url = `${API_URL}/${version}/definition/${encodeURIComponent(
    definitionName
  )}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch definition: ${response.status} ${response.statusText}`
    );
  }

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

  const url = `${API_URL}/${version}/${framework}/search?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to search documentation: ${response.status} ${response.statusText}`
    );
  }

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
  const url = `${API_URL}/${version}/${framework}/articles${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch articles: ${response.status} ${response.statusText}`
    );
  }

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
  const url = `${API_URL}/${version}/${framework}/article/${encodeURIComponent(
    slug
  )}${queryString ? "?" + queryString : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch article: ${response.status} ${response.statusText}`
    );
  }

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
  const url = `${API_URL}/${version}/${framework}/${language}/examples${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch examples: ${response.status} ${response.statusText}`
    );
  }

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
  const url = `${API_URL}/${version}/${framework}/${language}/example/${encodeURIComponent(
    articleSlug
  )}/${encodeURIComponent(exampleSlug)}${queryString ? "?" + queryString : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch example: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as ItemResponse<ExampleData>;
};
