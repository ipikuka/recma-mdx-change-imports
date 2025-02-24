import type { Plugin } from "unified";
import type { Program } from "estree";

declare module "recma-import-images" {
  const recmaImportImages: Plugin<void[], Program>;
  export { recmaImportImages };
}
