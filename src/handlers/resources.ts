import {
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
  getCurrentProject,
  getProjectVersion,
  getProjectFramework,
} from "../state/project.js";
import {
  fetchArticles,
  fetchArticle,
  fetchDefinitions,
  fetchDefinition,
  fetchExamples,
  fetchExample,
} from "../api/fetch.js";

export const listResources = async (): Promise<ListResourcesResult> => {
  const version = await getProjectVersion();
  const framework = getProjectFramework();
  const project = getCurrentProject();

  const versionInfo = project
    ? `(detected: v${project.version}, ${project.framework})`
    : `(default: v${version}, ${framework})`;

  const resources = [
    // Articles
    {
      uri: `ag-mcp://articles`,
      name: `AG Grid ${framework} Articles ${versionInfo}`,
      description: `Browse all AG Grid articles for ${framework} framework version ${version}`,
      mimeType: "application/json",
    },
    // Definitions
    {
      uri: `ag-mcp://definitions`,
      name: `AG Grid API Definitions v${version}`,
      description: `Browse AG Grid API definitions and interfaces for version ${version}`,
      mimeType: "application/json",
    },
    {
      uri: `ag-mcp://examples`,
      name: `AG Grid ${framework} Examples ${versionInfo}`,
      description: `Browse code examples for AG Grid ${framework} version ${version}`,
      mimeType: "application/json",
    },
  ];

  return { resources };
};

export const handleResource = async (
  request: ReadResourceRequest
): Promise<ReadResourceResult> => {
  const { uri } = request.params;

  if (!uri.startsWith("ag-mcp://")) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  const parts = uri.replace("ag-mcp://", "").split("/");

  const version = await getProjectVersion();
  const framework = getProjectFramework();

  try {
    if (parts.length === 1 && parts[0] === "articles") {
      const result = await fetchArticles(version, framework, { links: "mcp" });

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                type: "articles_list",
                version,
                framework,
                articles: result.data.map((article) => ({
                  title: article.title,
                  uri: `ag-mcp://article/${encodeURIComponent(
                    article.uri.split("/").pop() || ""
                  )}`,
                })),
                total: result.data.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (parts.length === 2 && parts[0] === "article") {
      const [, slug] = parts;
      const decodedSlug = decodeURIComponent(slug);
      const result = await fetchArticle(version, framework, decodedSlug, {
        links: "mcp",
      });

      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: `# ${result.data.title}\n\n${result.data.content}`,
          },
        ],
      };
    }

    if (parts.length === 1 && parts[0] === "definitions") {
      const result = await fetchDefinitions(version);

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                type: "definitions_list",
                version,
                definitions: result.data.map((def) => ({
                  title: def.title,
                  uri: `ag-mcp://definition/${encodeURIComponent(
                    def.uri.split("/").pop() || ""
                  )}`,
                })),
                total: result.data.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (parts.length === 2 && parts[0] === "definition") {
      const [, name] = parts;
      const decodedName = decodeURIComponent(name);
      const result = await fetchDefinition(version, decodedName);

      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: `# ${result.data.name}\n\n${result.data.content}`,
          },
        ],
      };
    }

    if (parts.length === 1 && parts[0] === "examples") {
      const result = await fetchExamples(version, framework, "typescript", {
        links: "mcp",
      });

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                type: "examples_list",
                version,
                framework,
                language: "typescript",
                examples: result.data.map((example) => ({
                  title: example.title,
                  uri: `ag-mcp://example/${encodeURIComponent(
                    example.uri.split("/").slice(-2).join("/")
                  )}`,
                })),
                total: result.data.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (parts.length === 2 && parts[0] === "example") {
      const [, encodedPath] = parts;
      const pathParts = decodeURIComponent(encodedPath).split("/");
      if (pathParts.length !== 2) {
        throw new Error(`Invalid example path format: ${encodedPath}`);
      }

      const [articleSlug, exampleSlug] = pathParts;
      const result = await fetchExample(
        version,
        framework,
        "typescript",
        articleSlug,
        exampleSlug,
        { links: "mcp" }
      );

      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `# Example: ${result.data.example}\n\nFrom article: ${result.data.article}\n\n\`\`\`typescript\n${result.data.content}\n\`\`\``,
          },
        ],
      };
    }

    throw new Error(`Unsupported resource URI format: ${uri}`);
  } catch (error) {
    throw new Error(`Failed to fetch resource ${uri}: ${error}`);
  }
};
