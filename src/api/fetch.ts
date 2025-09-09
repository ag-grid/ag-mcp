import { API_URL } from "../constants.js";
import { GridVersion, SearchResponse } from "./types.js";
import { GridFramework } from "../constants.js";

export const fetchVersions = async (): Promise<GridVersion[]> => {
    const url = `${API_URL}versions`;

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as GridVersion[];
}

export const fetchSearch = async (
    version: string,
    framework: GridFramework,
    query: string
): Promise<SearchResponse> => {
    const url = `${API_URL}${version}/${framework}/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to search documentation: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as SearchResponse;
}