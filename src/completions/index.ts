import { CompleteRequest, CompleteResult, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types"
import { completeVersion } from "./version"
import { completeFramework } from "./framework";
import { AgContentApi } from "../api";

export const handleComplete = async (api: AgContentApi, {argument, context}: CompleteRequest["params"] ): Promise<CompleteResult["completion"]> => {
    switch (argument.name) {
        case "version":
            return completeVersion(api, argument.value);
        case "framework":
            if (!context?.arguments?.version) {
                throw new McpError(ErrorCode.InvalidParams, "Requires the version parameter to ensure framework availability.")
            }
            const version = api.version(context.arguments.version);
            
            return completeFramework(version, argument.value);
        case "language":
            const languages = ["javascript", "typescript"];
            const values = languages.filter(l => l.startsWith(argument.value))
            return {
                values,
                total: values.length,
                hasMore: false
            }
    }

    return Promise.reject("Invalid completion request")
}