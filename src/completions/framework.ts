import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { GRID_FRAMEWORKS } from "../constants";



export const completeFramework = async (value: string): Promise<CompleteResult["completion"]> => {
    const values = GRID_FRAMEWORKS.filter(x => x.toLowerCase().startsWith(value.toLowerCase()))
    return {
        values,
        total: values.length,
        hasMore: false
    }
}