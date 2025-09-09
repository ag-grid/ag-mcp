import { fetchVersions } from "./fetch.js";
import { GridVersion } from "./types.js";

let cachedVersions: GridVersion[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getVersions = async (): Promise<GridVersion[]> => {
    const now = Date.now();
    
    if (cachedVersions && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedVersions;
    }
    
    try {
        const versions = await fetchVersions();
        cachedVersions = versions;
        cacheTimestamp = now;
        return versions;
    } catch (error) {
        // If we have cached data, return it even if stale
        if (cachedVersions) {
            return cachedVersions;
        }
        throw error;
    }
}

export const getLatestVersion = async (): Promise<string | undefined> => {
    const versions = await getVersions();
    const latest = versions.find(v => v.isLatest);
    return latest?.version;
}

export const isValidVersion = async (version: string): Promise<boolean> => {
    const versions = await getVersions();
    return versions.some(v => v.version === version);
}

export const getAvailableVersions = async (): Promise<string[]> => {
    const versions = await getVersions();
    return versions.map(v => v.version).sort((a, b) => {
        // Sort versions in descending order (newest first)
        const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
        const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
        
        if (aMajor !== bMajor) return bMajor - aMajor;
        if (aMinor !== bMinor) return bMinor - aMinor;
        return bPatch - aPatch;
    });
}