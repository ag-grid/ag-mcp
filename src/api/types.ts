import { z } from "zod";
import { 
    LinkSchema, 
    IndexSchema, 
    VersionSchema, 
    VersionListSchema, 
    FrameworkSchema, 
    FrameworkListSchema, 
    DocSchema, 
    DocListSchema, 
    MigrationSchema, 
    MigrationListSchema, 
    ExampleSchema, 
    ExampleListSchema, 
    ModuleSchema, 
    ModuleListSchema, 
    ChangeSchema, 
    ChangeLogSchema 
} from "./schema";
import { FRAMEWORK_TYPES, FRAMEWORKS } from "./constants";

export type Link = z.infer<typeof LinkSchema>;
export type Index = z.infer<typeof IndexSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type VersionList = z.infer<typeof VersionListSchema>;
export type Framework = z.infer<typeof FrameworkSchema>;
export type FrameworkList = z.infer<typeof FrameworkListSchema>;
export type Doc = z.infer<typeof DocSchema>;
export type DocList = z.infer<typeof DocListSchema>;
export type Migration = z.infer<typeof MigrationSchema>;
export type MigrationList = z.infer<typeof MigrationListSchema>;
export type Example = z.infer<typeof ExampleSchema>;
export type ExampleList = z.infer<typeof ExampleListSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type ModuleList = z.infer<typeof ModuleListSchema>;
export type Change = z.infer<typeof ChangeSchema>;
export type ChangeLog = z.infer<typeof ChangeLogSchema>;

export type FrameworkType = typeof FRAMEWORK_TYPES[number];
export type FrameworkName = typeof FRAMEWORKS[number];

export interface ApiCache {
    [url: string]: unknown;
}