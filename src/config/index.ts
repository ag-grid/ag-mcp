import envPaths from "env-paths";
import { readFile } from "fs/promises";
import { detect, resolveCommand } from "package-manager-detector";
import { join } from "path";
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

const getConfig = async () => {
    const path = join(paths.config, "projects.json");
    const file = await readFile(path);

    const config = ConfigSchema.parse(file);
}



export const readProject = async (path: string): Promise<Project | undefined> => {
    const pm = await detect({
        cwd: path
    });

    if (!pm || pm.name === "bun" || pm.name === "deno") {
        return undefined;
    }

    // const command = resolveCommand

    // const {command, args} = resolveCommand(pm.agent, "agent", ["list"]);


    return;
}

export const saveProject = async (project: Project) => {

}
