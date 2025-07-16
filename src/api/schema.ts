import z from "zod";
import { FRAMEWORKS } from "./constants";

const extractVersion = (v: string) => {
  const parts = v.split(".");
  return {
    major: Number(parts[0]),
    minor: Number(parts[1]),
    patch: Number(parts[2]),
  };
};

export const LinkSchema = z.object({
  id: z.string(),
  url: z.url(),
});

export const IndexSchema = z.array(LinkSchema);

export const VersionSchema = z
  .object({
    version: z.string(),
    releaseDate: z.iso.date().transform((d) => new Date(d)),
    url: z.url(),
    isLatest: z.boolean().default(false),
  })
  .transform(({ version, ...rest }) => ({
    id: version,
    semver: extractVersion(version),
    ...rest,
  }));

export const VersionListSchema = z.array(VersionSchema);

export const FrameworkSchema = z.object({
  framework: z.enum(FRAMEWORKS),
  slug: z.string(),
  examples: z.object({
    javascript: z.url().optional(),
    typescript: z.url(),
  }),
  docs: z.url(),
  migrations: z.url(),
  api: z.url(),
});

export const FrameworkListSchema = z.array(FrameworkSchema);

export const DocSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.url(),
  isEnterprise: z.boolean().default(false),
  mimeType: z.enum(["text/html", "text/plain"]),
});

export const DocListSchema = z.array(DocSchema);

export const MigrationSchema = z
  .object({
    migrationVersion: z.string(),
    url: z.url(),
    mimeType: z.enum(["text/html", "text/plain"]),
  })
  .transform(({ migrationVersion, ...rest }) => ({
    migrationVersion,
    semver: extractVersion(migrationVersion),
    ...rest,
  }));

export const MigrationListSchema = z.array(MigrationSchema);

export const ExampleSchema = z.object({
  exampleName: z.string(),
  pageName: z.string(),
  url: z.url(),
  preview: z.url(),
});

export const ExampleListSchema = z.array(ExampleSchema);

export const ModuleSchema: z.ZodType<{
  moduleName?: string;
  name: string;
  path?: string;
  isEnterprise: boolean;
  ssrmBundled: boolean;
  children?: Array<{
    moduleName?: string;
    name: string;
    path?: string;
    isEnterprise: boolean;
    ssrmBundled: boolean;
    children?: any[];
  }>;
}> = z.object({
  moduleName: z.string().optional(),
  name: z.string(),
  path: z.string().optional(),
  isEnterprise: z.boolean().default(false),
  ssrmBundled: z.boolean().default(false),
  children: z.array(z.lazy(() => ModuleSchema)).optional(),
});

export const ModuleGroup = z.object({
  name: z.string(),
  children: z.array(ModuleSchema).optional(),
  isEnterprise: z.boolean().default(false),
  hideFromSelection: z.boolean().default(false),
});

export const ModuleListSchema = z.object({
  groups: z.array(ModuleGroup),
});

export const ChangeSchema = z.object({
  key: z.string(),
  issueType: z.string(),
  componentsByName: z.array(z.string()),
  summary: z.string(),
  versions: z.array(z.string()),
  status: z.string(),
  resolution: z.string(),
  features: z.array(z.string()).nullable(),
  moreInformation: z.string().nullable(),
  deprecationNotes: z.string().nullable(),
  breakingChangesNotes: z.string().nullable(),
  documentationUrl: z.string().nullable(),
});

export const ChangeLogSchema = z.array(ChangeSchema);
