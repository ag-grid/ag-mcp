import { ApiCacheManager } from "./cache";
import { VersionEndpoint } from "./models";
import { VersionListSchema } from "./schema";
import { VersionList, Version as VersionData, Version, FrameworkName } from "./types";

export { FRAMEWORKS, FRAMEWORK_TYPES } from "./constants";

export class AgContentApi {
  private cache: ApiCacheManager;
  private promise: Promise<VersionList>;
  private versionEndpoints: Map<string, VersionEndpoint> = new Map();

  constructor(private baseUrl: string) {
    this.cache = new ApiCacheManager();

    const url = `${this.baseUrl}/content/versions.json`;
    this.promise = this.cache.fetchAndCache(url, VersionListSchema);
    this.promise.then((versions) => {
      versions.forEach((version) => {
        let endpoint = this.versionEndpoints.get(version.id);

        if (!endpoint) {
          this.versionEndpoints.set(
            version.id,
            new VersionEndpoint(this.cache, Promise.resolve(version))
          );
        }

        if (version.isLatest && !this.versionEndpoints.has("latest")) {
          this.versionEndpoints.set(
            "latest",
            new VersionEndpoint(this.cache, Promise.resolve(version))
          );
        }
      });
    });
  }

  async versions(): Promise<VersionList> {
    return this.promise;
  }

  version(versionId: string): VersionEndpoint {
    if (!this.versionEndpoints.has(versionId)) {
      this.versionEndpoints.set(
        versionId,
        new VersionEndpoint(
          this.cache,
          this.promise.then((versions) => {
            const version = versions.find((v) => v.id === versionId);
            if (!version) {
              return Promise.reject("Invalid version");
            }
            return version;
          })
        )
      );
    }

    return this.versionEndpoints.get(versionId)!;
  }

  latest(): VersionEndpoint {
    return this.version("latest");
  }

  async parseVersion(versionId: string) {
    return this.version(versionId).getVersion();
  }

  async parseFramework(versionId: string, frameworkName: FrameworkName) {
    return this.version(versionId).framework(frameworkName).getFramework();
  }

  // Cache management
  clearCache(): void {
    this.cache.clearCache();
  }

  hasCached(url: string): boolean {
    return this.cache.hasCached(url);
  }
}
