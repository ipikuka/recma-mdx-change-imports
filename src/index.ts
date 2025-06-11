import type { Plugin } from "unified";
import type { Node, Program, VariableDeclaration } from "estree";
import { CONTINUE, visit } from "estree-util-visit";

import { isMediaFile, resolvePath } from "./utils.js";

export type ChangeImportsOptions = {
  pathname?: string;
  baseUrl?: string;
};

const DEFAULT_SETTINGS: ChangeImportsOptions = {
  pathname: undefined,
  baseUrl: undefined,
};

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
        /* istanbul ignore next */
        if (property.type === "Property" && property.value.type === "Identifier") {
          name = property.value.name;
        }
      }

      if (node.declarations[0].init?.type === "AwaitExpression") {
        /* istanbul ignore if */
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

      /* istanbul ignore if */
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

      /* istanbul ignore if */
      if ("body" in parent) {
        parent.body[index!] = newDeclaration;
      }

      return CONTINUE;
    });
  };
};

export default plugin;
