import { getCurrentProject, detectAndSetProject } from "../state/project.js";
import { GridFramework } from "../constants.js";

export interface VersionConfig {
  version: string;
  framework: GridFramework;
  enterprise?: boolean;
}

export class VersionValidationError extends Error {
  constructor(message: string, public readonly suggestion: string) {
    super(message);
    this.name = "VersionValidationError";
  }
}

export async function validateVersionConfig(): Promise<VersionConfig> {
  const currentProject = getCurrentProject();
  if (currentProject) {
    return {
      version: currentProject.version,
      framework: currentProject.framework,
      enterprise: currentProject.enterprise,
    };
  }

  try {
    const projectPath = process.cwd();
    const detected = await detectAndSetProject(projectPath);

    if (detected) {
      return {
        version: detected.version,
        framework: detected.framework,
        enterprise: detected.enterprise,
      };
    }
  } catch (error) {}

  throw new VersionValidationError(
    "No AG Grid version/framework configuration found and auto-detection failed",
    "Use the set_versions tool to manually configure your AG Grid version and framework (e.g., set_versions with version='34.1.0' and framework='react')"
  );
}

export async function validateVersionConfigSafe(): Promise<VersionConfig | null> {
  try {
    return await validateVersionConfig();
  } catch (error) {
    return null;
  }
}
