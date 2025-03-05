import path from "path";
import url from "url";

import type { Plugin } from "unified";
import type { Node, Program, VariableDeclaration } from "estree";
import { CONTINUE, visit } from "estree-util-visit";

export type ChangeImportsOptions = {
  pathname?: string;
  baseUrl?: string;
};

const DEFAULT_SETTINGS: ChangeImportsOptions = {
  pathname: undefined,
  baseUrl: undefined,
};

/**
 * Checks if a file is a media asset (e.g., image, video, or audio file)
 *
 * @param {string} filename - The filename to check.
 * @returns {boolean} - True if the file is a media asset.
 */
export function isMediaFile(filename: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|mp4|webm|mp3|wav|ogg)$/i.test(filename);
}

/**
 * it is reverse of function _resolveDynamicMdxSpecifier(d) in compiled source
 */
export function getRelativePath(absoluteUrl: string, baseUrl?: string): string {
  if (!baseUrl) {
    console.warn("Provide the baseUrl option for the plugin recma-mdx-change-imports");
    return absoluteUrl;
  }

  const absolutePath = url.fileURLToPath(absoluteUrl);
  let basePath = url.fileURLToPath(baseUrl);

  // If baseUrl includes a file, get its directory
  if (path.extname(basePath)) {
    basePath = path.dirname(basePath);
  }

  let relativePath = path.relative(basePath, absolutePath);

  // Ensure relative paths start with './' when needed
  if (!relativePath.startsWith("..")) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
}

/**
 * Resolves a relative path based on an optional base pathname.
 * @param relativePath - The relative or absolute path to resolve.
 * @param pathname - The base pathname for resolution.
 * @param baseUrl - The baseUrl which should be the same with baseUrl in the mdxOptions
 * @returns The resolved path, always starting with "/".
 */
export function resolvePath(relativePath: string, pathname?: string, baseUrl?: string): string {
  // remove leading/trailing slashes
  const basePath = pathname ? pathname.replace(/^\/+|\/+$/g, "") : "";

  // Normalize the relativePath ensuring the string is in a valid Unicode form
  // for example e\u0301 to é franch letter
  relativePath = relativePath.normalize("NFC");

  if (relativePath.startsWith("file:///")) {
    relativePath = getRelativePath(relativePath, baseUrl);
  }

  // If no pathname is provided, remove "./" and "../", and return
  if (!basePath) {
    return `/${relativePath.replace(/^(\.\/|(\.\.\/)+)/, "")}`;
  }

  // Normalize path to handle system-specific slashes and relative syntax (./ ../)
  const normalizedPath = path.normalize(`${basePath}/${relativePath}`);

  // If still exceeds root after path.normalize(), remove "./" and "../", and return
  if (normalizedPath.startsWith("..")) {
    return `/${normalizedPath.replace(/^(\.\/|(\.\.\/)+)/, "")}`;
  }

  return `/${normalizedPath}`;
}

/**
 * It is a recma plugin which transforms the esAST / esTree.
 *
 * This recma plugin changes imports in the MDX compiled source.
 *
 * The "recma-mdx-change-imports" basically converts:
 * from `import image from "./image.png";`
 *
 * into `const image = "/image.png";`
 *
 * (If the option "pathname" is "blog-images")
 * into `const image = "/blog-images/image.png";`
 *
 */
const plugin: Plugin<[ChangeImportsOptions?], Program> = (options = {}) => {
  const settings = Object.assign(
    {},
    DEFAULT_SETTINGS,
    options,
  ) as Required<ChangeImportsOptions>;

  return (tree: Node) => {
    // visit variable declarations
    visit(tree, (node, _, index, ancestors) => {
      if (node.type !== "VariableDeclaration") return CONTINUE;

      let name: string | undefined;
      let value: string | number | bigint | boolean | RegExp | null | undefined;

      if (node.declarations[0].id.type === "ObjectPattern") {
        const property = node.declarations[0].id.properties[0];
        if (property.type === "Property" && property.value.type === "Identifier") {
          name = property.value.name;
        }
      }

      if (node.declarations[0].init?.type === "AwaitExpression") {
        if (node.declarations[0].init.argument.type === "ImportExpression") {
          if (node.declarations[0].init.argument.source.type === "CallExpression") {
            const argument = node.declarations[0].init.argument.source.arguments[0];
            if (argument.type === "Literal") {
              value = argument.value;
            }
          }
        }
      }

      /* istanbul ignore if */
      if (!name) {
        return CONTINUE;
      }

      /* istanbul ignore if */
      if (typeof value !== "string") {
        return CONTINUE;
      }

      // if a string starts with a protocol-like pattern (excluded file:///)
      if (/^[a-z]+:\/\/(?!\/)/i.test(value)) {
        return CONTINUE;
      }

      // Ensure the import statement is for a relative path or absolute path
      if (
        !value.startsWith("./") &&
        !value.startsWith("../") &&
        !value.startsWith("file:///")
      ) {
        return CONTINUE;
      }

      // ensure the path refers to a media file
      if (!isMediaFile(value)) {
        return CONTINUE;
      }

      const url = resolvePath(value, settings.pathname, settings.baseUrl);

      // Replace the variable declaration with a new one
      const newDeclaration: VariableDeclaration = {
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: { type: "Identifier", name },
            init: { type: "Literal", value: url },
          },
        ],
      };

      const parent = ancestors[0] as Program;

      if ("body" in parent) {
        parent.body[index!] = newDeclaration;
      }

      return CONTINUE;
    });

    // visit import declarations
    visit(tree, (node, _, index, ancestors) => {
      if (node.type !== "ImportDeclaration") return CONTINUE;

      const name = node.specifiers[0].local.name;
      const value = node.source.value;

      /* istanbul ignore if  */
      if (!name) {
        return CONTINUE;
      }

      /* istanbul ignore if  */
      if (typeof value !== "string") {
        return CONTINUE;
      }

      /* istanbul ignore if  */
      if (/^[a-z]+:\/\/(?!\/)/i.test(value)) {
        // if a string starts with a protocol-like pattern (excluded file:///)
        return CONTINUE;
      }

      // Ensure the import statement is for a relative or absolute path
      if (
        !value.startsWith("./") &&
        !value.startsWith("../") &&
        !value.startsWith("file:///")
      ) {
        return CONTINUE;
      }

      // ensure the path refers to a media file
      if (!isMediaFile(value)) {
        return CONTINUE;
      }

      const url = resolvePath(value, settings.pathname, settings.baseUrl);

      // Replace the import statement with a variable declaration
      const newDeclaration: VariableDeclaration = {
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: { type: "Identifier", name },
            init: { type: "Literal", value: url },
          },
        ],
      };

      const parent = ancestors[0] as Program;

      if ("body" in parent) {
        parent.body[index!] = newDeclaration;
      }

      return CONTINUE;
    });
  };
};

export default plugin;
