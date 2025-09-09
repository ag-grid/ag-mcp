import envPaths from "env-paths";
import { readFile, writeFile, mkdir } from "fs/promises";
import { detect, resolveCommand } from "package-manager-detector";
import { join } from "path";
import { isPackageExists } from "local-pkg";
import z from "zod";

const ProjectSchema = z.object({
    path: z.string(),
    version: z.string(),
    framework: z.enum(["react", "angular", "vue", "vanilla"]),
    enterprise: z.boolean(),
});

type Project = z.infer<typeof ProjectSchema>

const ConfigSchema = z.object({
    projects: z.record(z.string(), ProjectSchema)
})

const paths = envPaths("ag-mcp");

const getConfig = async (): Promise<z.infer<typeof ConfigSchema> | undefined> => {
    try {
        const configPath = join(paths.config, "projects.json");
        const file = await readFile(configPath, 'utf-8');
        return ConfigSchema.parse(JSON.parse(file));
    } catch (error) {
        return undefined;
    }
}

const saveConfig = async (config: z.infer<typeof ConfigSchema>) => {
    try {
        await mkdir(paths.config, { recursive: true });
        const configPath = join(paths.config, "projects.json");
        await writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error("Failed to save config:", error);
    }
}

const detectFramework = async (projectPath: string): Promise<"react" | "angular" | "vue" | "vanilla"> => {
    try {
        const packageJsonPath = join(projectPath, "package.json");
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (dependencies['@angular/core']) return "angular";
        if (dependencies['react']) return "react";
        if (dependencies['vue']) return "vue";
        
        return "vanilla";
    } catch (error) {
        return "vanilla";
    }
}

const detectAgGridVersion = async (projectPath: string): Promise<string | undefined> => {
    try {
        const packageJsonPath = join(projectPath, "package.json");
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for AG Grid packages
        const agGridVersion = dependencies['ag-grid-community'] || 
                             dependencies['ag-grid-enterprise'] ||
                             dependencies['ag-grid-react'] ||
                             dependencies['ag-grid-angular'] ||
                             dependencies['ag-grid-vue3'] ||
                             dependencies['ag-grid-vue'];
        
        if (agGridVersion) {
            // Remove version prefixes like ^, ~, >=
            return agGridVersion.replace(/^[\^~>=<]+/, '');
        }
        
        return undefined;
    } catch (error) {
        return undefined;
    }
}

const detectEnterprise = async (projectPath: string): Promise<boolean> => {
    try {
        const packageJsonPath = join(projectPath, "package.json");
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        return !!(dependencies['ag-grid-enterprise']);
    } catch (error) {
        return false;
    }
}

export const readProject = async (path: string): Promise<Project | undefined> => {
    const pm = await detect({
        cwd: path
    });

    if (!pm || pm.name === "bun" || pm.name === "deno") {
        return undefined;
    }

    // Check if AG Grid is installed
    const hasAgGrid = await isPackageExists("ag-grid-community", { paths: [path] }) ||
                      await isPackageExists("ag-grid-enterprise", { paths: [path] }) ||
                      await isPackageExists("ag-grid-react", { paths: [path] }) ||
                      await isPackageExists("ag-grid-angular", { paths: [path] }) ||
                      await isPackageExists("ag-grid-vue3", { paths: [path] }) ||
                      await isPackageExists("ag-grid-vue", { paths: [path] });

    if (!hasAgGrid) {
        return undefined;
    }

    const version = await detectAgGridVersion(path);
    if (!version) {
        return undefined;
    }

    const framework = await detectFramework(path);
    const enterprise = await detectEnterprise(path);

    return {
        path,
        version,
        framework,
        enterprise
    };
}

export const saveProject = async (project: Project) => {
    const config = await getConfig() || { projects: {} };
    config.projects[project.path] = project;
    await saveConfig(config);
}

export const getProject = async (path: string): Promise<Project | undefined> => {
    const config = await getConfig();
    return config?.projects[path];
}

export const getAllProjects = async (): Promise<Project[]> => {
    const config = await getConfig();
    return config ? Object.values(config.projects) : [];
}

export const updateProjectConfig = async (
    path: string, 
    updates: Partial<Omit<Project, 'path'>>
): Promise<void> => {
    const existingProject = await getProject(path);
    if (!existingProject) {
        throw new Error(`No project found at path: ${path}`);
    }

    const updatedProject = { ...existingProject, ...updates };
    await saveProject(updatedProject);
}

export const createManualProject = async (
    path: string,
    version: string,
    framework: "react" | "angular" | "vue" | "vanilla",
    enterprise: boolean = false
): Promise<Project> => {
    const project: Project = {
        path,
        version,
        framework,
        enterprise
    };

    await saveProject(project);
    return project;
}
