export const API_URL =
  "https://4cyqc8wqj1.execute-api.us-west-1.amazonaws.com/prod";

export const GRID_FRAMEWORKS = ["vanilla", "react", "angular", "vue"] as const;

export type GridFramework = (typeof GRID_FRAMEWORKS)[number];

export const GRID_LANGUAGE = ["typescript", "javascript"] as const;

export type GridLanguage = (typeof GRID_LANGUAGE)[number];
