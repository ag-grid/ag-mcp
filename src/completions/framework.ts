import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { GRID_FRAMEWORKS } from "../constants.js";
import { getFrameworks } from "../api/version.js";

export const completeFramework = async (
  value: string
): Promise<CompleteResult["completion"]> => {
  try {
    const allFrameworks = await getFrameworks();
    const values = allFrameworks.filter((x) =>
      x.toLowerCase().startsWith(value.toLowerCase())
    );

    return {
      values,
      total: values.length,
      hasMore: false,
    };
  } catch (error) {
    // Fallback to static frameworks if API fails
    const values = GRID_FRAMEWORKS.filter((x) =>
      x.toLowerCase().startsWith(value.toLowerCase())
    );
    return {
      values,
      total: values.length,
      hasMore: false,
    };
  }
};
