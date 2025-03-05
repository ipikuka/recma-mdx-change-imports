import path from "path";
import url from "url";

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
