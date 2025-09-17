import {
  CompleteRequest,
  CompleteResult,
} from "@modelcontextprotocol/sdk/types.js";
import { handleComplete } from "../completions/index.js";

export const handleCompletion = async (request: CompleteRequest): Promise<CompleteResult["completion"]> => {
  return handleComplete(request.params);
};