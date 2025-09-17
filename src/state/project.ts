import { GridFramework } from "../constants.js";
import { readProject, saveProject } from "../config/index.js";
import { getLatestVersion } from "../api/version.js";

export interface ProjectState {
  path: string;
  version: string;
  framework: GridFramework;
  enterprise?: boolean;
}

let currentProject: ProjectState | undefined = undefined;

export const getCurrentProject = (): ProjectState | undefined => {
  return currentProject;
};

export const setCurrentProject = (project: ProjectState | undefined): void => {
  currentProject = project;
};

export const updateCurrentProject = (updates: Partial<ProjectState>): void => {
  if (currentProject) {
    currentProject = { ...currentProject, ...updates };
  }
};

export const detectAndSetProject = async (projectPath: string): Promise<ProjectState | null> => {
  try {
    const project = await readProject(projectPath);
    
    if (!project) {
      return null;
    }

    const projectState: ProjectState = {
      path: project.path,
      version: project.version,
      framework: project.framework,
      enterprise: project.enterprise
    };

    setCurrentProject(projectState);
    await saveProject(project);
    
    return projectState;
  } catch (error) {
    console.error('Failed to detect AG Grid project:', error);
    return null;
  }
};

export const getProjectVersion = async (): Promise<string> => {
  if (currentProject?.version) {
    return currentProject.version;
  }
  
  return await getLatestVersion() || "34.1.0";
};

export const getProjectFramework = (): GridFramework => {
  return currentProject?.framework || "react";
};

export const getProjectPath = (): string | undefined => {
  return currentProject?.path;
};

export const hasCurrentProject = (): boolean => {
  return currentProject !== undefined;
};

export const clearCurrentProject = (): void => {
  setCurrentProject(undefined);
};

export const getProjectInfo = (): string => {
  if (!currentProject) {
    return "No AG Grid project detected";
  }

  return `**AG Grid Project:**\n- Path: ${currentProject.path}\n- Version: ${currentProject.version}\n- Framework: ${currentProject.framework}\n- Enterprise: ${currentProject.enterprise ? 'Yes' : 'No'}`;
};