import { CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { AgContentApi } from "../api";


export const completeVersion = async (api: AgContentApi, value: string): Promise<CompleteResult["completion"]> => {
    const versions = await api.versions();
    const values = versions.map(v => v.id).filter(v => v.startsWith(value));

    return {
        values,
        total: values.length,
        hasMore: false
    }
}