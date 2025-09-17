/**
 * /versions => Version[]
 * /frameworks => GridFramework[]
 * /{version}/definitions => list of definitions
 * /{version}/definition/{definitionName} => definitionData
 * /{version}/{framework}/search => The main search endpoint
 * /{version}/{framework}/articles => list of articles
 * /{version}/{framework}/article/{slug} => Article content
 * /{version}/{framework}/{language}/examples => A list of all examples
 * /{version}/{framework}/{language}/example/{articleSlug}/{exampleSlug} => Example content
 */

import z from "zod/v4";
import {
  GRID_LANGUAGES,
  GRID_FRAMEWORKS,
  GridFramework,
  GridLanguage,
} from "../constants";

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export interface GridVersion {
  id: string;
  version: string;
  isLatest: boolean;
  lastUpdated: string;
  lastChecked: string;
}

export const LanguageSchema = z.enum(GRID_LANGUAGES);

export const LanguageParamSchema = z.object({
  language: LanguageSchema,
});

export const VersionParamSchema = z.object({
  version: SemanticVersionSchema,
});

export const FrameworkParamSchema = z.object({
  framework: z.enum(GRID_FRAMEWORKS),
});

export const LinkFormatSchema = z.enum(["mcp", "default", "markdown"]);
export const ExampleFormatSchema = z.enum(["link", "embed"]);

export const RequestOptionsSchema = z.object({
  language: LanguageSchema.optional().default("typescript"),
  examples: ExampleFormatSchema.optional().default("embed"),
  links: LinkFormatSchema.optional().default("default"),
});

export const SearchRequestOptionsSchema = RequestOptionsSchema.extend({
  q: z.string(),
});

export type RequestOptions = z.infer<typeof RequestOptionsSchema>;
export type LinkFormat = z.infer<typeof LinkFormatSchema>;
export type ExampleFormat = z.infer<typeof ExampleFormatSchema>;

export type Version = z.infer<typeof SemanticVersionSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ResponseMeta {
  framework?: GridFramework;
  version?: string;
  language?: GridLanguage;
  timestamp: string;
  endpoint: string;
  options: RequestOptions;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CollectionItem {
  title: string;
  uri: string;
}

export interface CollectionResponse {
  data: CollectionItem[];
  meta: ResponseMeta;
  pagination?: PaginationInfo;
}

export interface ItemResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface ArticleData {
  title: string;
  uri: string;
  slug: string;
  content: string;
}

export interface SectionData {
  title: string;
  uri: string;
  slug: string;
  article: Omit<ArticleData, "content">;
  content: string;
}

export interface DefinitionData {
  name: string;
  uri: string;
  content: string;
}

export interface ExampleData {
  example: string;
  article: string;
  uri: string;
  content: string;
}

export interface SearchResult {
  score: number;
  data: SectionData | DefinitionData | ExampleData;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  meta: ResponseMeta;
}

export interface VersionItem {
  id: string;
  version: string;
  isLatest: boolean;
  lastUpdated: string;
  lastChecked: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  endpoint: string;
}
