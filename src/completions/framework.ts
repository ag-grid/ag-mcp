import { CompleteResult } from "@modelcontextprotocol/sdk/types";
import { VersionEndpoint } from "../api/models";


export const completeFramework = async (version: VersionEndpoint, value: string,): Promise<CompleteResult["completion"]> => {
    const frameworks = await version.frameworks();

    const values = frameworks.map(x => x.framework).filter(x => x.startsWith(value.toLowerCase()))

    return {
        values,
        total: values.length,
        hasMore: false
    }
}