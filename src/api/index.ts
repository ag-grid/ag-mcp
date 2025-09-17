// Fetch functions - direct API calls
export {
  fetchVersions,
  fetchFrameworks,
  fetchDefinitions,
  fetchDefinition,
  fetchSearch,
  fetchArticles,
  fetchArticle,
  fetchExamples,
  fetchExample
} from "./fetch.js";

// Cached API functions with validation
export {
  getVersions,
  getLatestVersion,
  isValidVersion,
  getAvailableVersions,
  getFrameworks,
  isValidFramework
} from "./version.js";

// Types
export type {
  GridVersion,
  RequestOptions,
  LinkFormat,
  ExampleFormat,
  CollectionResponse,
  ItemResponse,
  ResponseMeta,
  PaginationInfo,
  CollectionItem,
  ArticleData,
  SectionData,
  DefinitionData,
  ExampleData,
  SearchResult,
  SearchResponse,
  VersionItem,
  ErrorResponse
} from "./types.js";