export const API_URL =
  "https://ltlw22r2xdam36j7u6dlqx7hta0cziwn.lambda-url.eu-north-1.on.aws/";

export const GRID_FRAMEWORKS = ["vanilla", "react", "angular", "vue"] as const;

export type GridFramework = (typeof GRID_FRAMEWORKS)[number];

export const GRID_LANGUAGE = ["typescript", "javascript"] as const;

export type GridLanguage = (typeof GRID_LANGUAGE)[number];
