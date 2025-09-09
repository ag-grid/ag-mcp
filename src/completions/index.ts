import { CompleteRequest, CompleteResult, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { completeVersion } from "./version.js"
import { completeFramework } from "./framework.js";

export const handleComplete = async ({argument, context}: CompleteRequest["params"] ): Promise<CompleteResult["completion"]> => {
    switch (argument.name) {
        case "version":
            return completeVersion(argument.value);
        case "framework":
            return completeFramework(argument.value);
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