import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { getAvailableVersions } from "../api/version.js";

export const completeVersion = async (
  value: string
): Promise<CompleteResult["completion"]> => {
  try {
    const allVersions = await getAvailableVersions();
    const values = allVersions.filter((v) => v.startsWith(value));

    return {
      values,
      total: values.length,
      hasMore: false,
    };
  } catch (error) {
    // Fallback to basic version if API fails
    const fallbackVersions = ["34.1.0", "34.0.0", "33.3.0"];
    const values = fallbackVersions.filter((v) => v.startsWith(value));

    return {
      values,
      total: values.length,
      hasMore: false,
    };
  }
};
