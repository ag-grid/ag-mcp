export const API_URL = "https://search.ag-grid.com";

export const GRID_FRAMEWORKS = ["vanilla", "react", "angular", "vue"] as const;

export type GridFramework = (typeof GRID_FRAMEWORKS)[number];

export const GRID_LANGUAGES = ["typescript", "javascript"] as const;

export type GridLanguage = (typeof GRID_LANGUAGES)[number];
