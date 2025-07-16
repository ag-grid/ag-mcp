import { z } from "zod";
import { ApiCache } from "./types";

export class ApiCacheManager {
    private cache: ApiCache = {};

    async fetchAndCache<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
        if (this.cache[url]) {
            return this.cache[url] as T;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const validated = schema.parse(data);
            this.cache[url] = validated;
            return validated;
        } catch (error) {
            throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    getCached<T>(url: string): T | undefined {
        return this.cache[url] as T | undefined;
    }

    clearCache(): void {
        this.cache = {};
    }

    hasCached(url: string): boolean {
        return url in this.cache;
    }
}