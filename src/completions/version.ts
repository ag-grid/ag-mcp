import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";


export const completeVersion = async (value: string): Promise<CompleteResult["completion"]> => {
    const versions = ["34.0.0"];
    const values = versions.filter(v => v.startsWith(value));

    return {
        values,
        total: values.length,
        hasMore: false
    }
}