import type { Plugin } from "unified";
import type { Node, Program, VariableDeclaration } from "estree";
import { CONTINUE, visit } from "estree-util-visit";

export type ChangeImportsOptions = {
  pathname?: string;
};

const DEFAULT_SETTINGS: ChangeImportsOptions = {
  pathname: "",
};

/**
 * It is a recma plugin which transforms the esAST / esTree.
 *
 * This recma plugin changes imports in the MDX compiled source.
 *
 * The "recma-mdx-change-imports" basically converts:
 * from `import image from "./image.png";`
 *
 * (If the option "pathname" is default value or is not defined)
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

      // Ensure the import statement is for a relative
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

      // remove "./" and "../"
      const path = value.replace(/^\.\.\//, "").replace(/^\.\//, "");
      const url = settings.pathname ? `/${settings.pathname}/${path}` : `/${path}`;

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

    // visit import declaratrions
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

      // Ensure the import statement is for a relative
      if (
        !value.startsWith("./") &&
        !value.startsWith("../") &&
        !value.startsWith("file:///")
      ) {
        return CONTINUE;
      }

      // ensure the path refers to a media file
      if (!isMediaFile(value)) {
        /* istanbul ignore next */
        return CONTINUE;
      }

      // TODO-1: consider import.meta.url to resolve the relative path
      // console.log(import.meta.url);

      const path = value.startsWith("file:")
        ? // get last file name with extension // TODO-1
          value.replace(/^.*\//, "")
        : // remove "./" and "../"
          value.replace(/^(?:\.+\/)+/, "");

      const url = `/${settings.pathname ? settings.pathname + "/" : ""}${path}`;

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

/**
 * Checks if a file is a media asset (e.g., image, video, or audio file)
 *
 * @param {string} filename - The filename to check.
 * @returns {boolean} - True if the file is a media asset.
 */
function isMediaFile(filename: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|mp4|webm|mp3|wav|ogg)$/i.test(filename);
}

export default plugin;
