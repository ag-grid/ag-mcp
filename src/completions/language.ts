import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { GRID_LANGUAGES } from "../constants.js";

export const completeLanguage = async (
  value: string
): Promise<CompleteResult["completion"]> => {
  try {
    const values = GRID_LANGUAGES.filter((l) => 
      l.toLowerCase().startsWith(value.toLowerCase())
    );
    
    return {
      values,
      total: values.length,
      hasMore: false,
    };
  } catch (error) {
    // Fallback to basic languages if constants fail
    const fallbackLanguages = ["javascript", "typescript"];
    const values = fallbackLanguages.filter((l) => 
      l.toLowerCase().startsWith(value.toLowerCase())
    );
    
    return {
      values,
      total: values.length,
      hasMore: false,
    };
  }
};