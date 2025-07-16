import { z } from "zod";
import { ApiCacheManager } from "./cache";
import {
  FrameworkListSchema,
  ChangeLogSchema,
  ModuleListSchema,
  DocListSchema,
  MigrationListSchema,
  ExampleListSchema,
  IndexSchema,
} from "./schema";
import {
  FrameworkList,
  Framework,
  FrameworkName,
  ChangeLog,
  ModuleList,
  DocList,
  Doc,
  MigrationList,
  Migration,
  ExampleList,
  Example,
  FrameworkType,
  Index,
  Version,
} from "./types";

export class VersionEndpoint {
  private frameworkEndpoints: Map<string, FrameworkEndpoint> = new Map();
  private indexData: Promise<Index> | null = null;

  constructor(
    private cache: ApiCacheManager,
    private promise: Promise<Version>
  ) {}

  async getVersion() {
    return this.promise;
  }

  framework(name: FrameworkName): FrameworkEndpoint {
    let endpoint = this.frameworkEndpoints.get(name);

    if (!endpoint) {
      endpoint = new FrameworkEndpoint(
        this.cache,
        this.frameworks().then((frameworks) => {
          const framework = frameworks.find((f) => f.framework === name);
          if (!framework) {
            return Promise.reject("Invalid framework for version");
          }
          return framework;
        })
      );
      this.frameworkEndpoints.set(name, endpoint);
    }

    return endpoint;
  }

  private async getIndexData(): Promise<Index> {
    if (!this.indexData) {
      this.indexData = this.promise.then((version) => {
        return this.cache.fetchAndCache(version.url, IndexSchema);
      });
    }
    return this.indexData;
  }

  private async getIndexLink(id: string) {
    return this.getIndexData().then((index) => {
      return index.find((l) => l.id === id);
    });
  }

  async frameworks(): Promise<FrameworkList> {
    const frameworksLink = await this.getIndexLink("frameworks");
    if (!frameworksLink) {
      throw new Error("Frameworks endpoint not found in index");
    }
    return this.cache.fetchAndCache(frameworksLink.url, FrameworkListSchema);
  }

  async changelog(): Promise<ChangeLog> {
    const changelogLink = await this.getIndexLink("changelog");
    if (!changelogLink) {
      throw new Error("Changelog endpoint not found in index");
    }
    return this.cache.fetchAndCache(changelogLink.url, ChangeLogSchema);
  }

  async modules(): Promise<ModuleList> {
    const modulesLink = await this.getIndexLink("modules");
    if (!modulesLink) {
      throw new Error("Modules endpoint not found in index");
    }
    return this.cache.fetchAndCache(modulesLink.url, ModuleListSchema);
  }

  async types(): Promise<unknown> {
    const typesLink = await this.getIndexLink("types");
    if (!typesLink) {
      throw new Error("Types endpoint not found in index");
    }
    return this.cache.fetchAndCache(typesLink.url, z.unknown());
  }
}

export class FrameworkEndpoint {
  constructor(
    private cache: ApiCacheManager,
    private promise: Promise<Framework>
  ) {}

  async getFramework() {
    return this.promise;
  }

  async docs(): Promise<DocList> {
    const framework = await this.promise;
    return this.cache.fetchAndCache(framework.docs, DocListSchema);
  }

  async doc(docId: string): Promise<Doc> {
    const docs = await this.docs();
    const doc = docs.find((d) => d.id === docId);
    if (!doc) {
      throw new Error(`Doc with id '${docId}' not found`);
    }
    return doc;
  }

  async api(): Promise<DocList> {
    const framework = await this.promise;
    return this.cache.fetchAndCache(framework.api, DocListSchema);
  }

  async migrations(): Promise<MigrationList> {
    const framework = await this.promise;
    return this.cache.fetchAndCache(framework.migrations, MigrationListSchema);
  }

  async migration(migrationId: string): Promise<Migration> {
    const migrations = await this.migrations();
    const migration = migrations.find(
      (m) => m.migrationVersion === migrationId
    );
    if (!migration) {
      throw new Error(`Migration with id '${migrationId}' not found`);
    }
    return migration;
  }

  async examples(type: FrameworkType): Promise<ExampleList> {
    const framework = await this.promise;
    const exampleUrl = framework.examples[type];
    if (!exampleUrl) {
      throw new Error(
        `No examples available for type '${type}' in framework '${framework.framework}'`
      );
    }
    return this.cache.fetchAndCache(exampleUrl, ExampleListSchema);
  }

  async example(type: FrameworkType, exampleId: string): Promise<Example> {
    const examples = await this.examples(type);
    const example = examples.find((e) => e.exampleName === exampleId);
    if (!example) {
      throw new Error(
        `Example with id '${exampleId}' not found for type '${type}'`
      );
    }
    return example;
  }
}
