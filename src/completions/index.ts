import {
  CompleteRequest,
  CompleteResult,
} from "@modelcontextprotocol/sdk/types.js";
import { completeVersion } from "./version.js";
import { completeFramework } from "./framework.js";
import { completeLanguage } from "./language.js";

export const handleComplete = async ({
  argument,
  context,
}: CompleteRequest["params"]): Promise<CompleteResult["completion"]> => {
  switch (argument.name) {
    case "version":
      return completeVersion(argument.value);
    case "framework":
      return completeFramework(argument.value);
    case "language":
      return completeLanguage(argument.value);
  }

  return Promise.reject("Invalid completion request");
};
