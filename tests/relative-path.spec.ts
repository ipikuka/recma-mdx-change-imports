import { jest } from "@jest/globals";

import { getRelativePath } from "../src";

describe("getRelativePath", () => {
  it("should return the correct relative path for same directory", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/tests/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("./image.png");
  });

  it("should handle subdirectories", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/tests/assets/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("./assets/image.png");
  });

  it("should resolve a file in a sibling directory", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/blog-assets/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("../blog-assets/image.png");
  });

  it("should resolve a file in the parent directory", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("../image.png");
  });

  it("should resolve a file deep in another directory", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/docs/tutorials/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("../docs/tutorials/image.png");
  });

  it("should warn and return absolute URL if baseUrl is missing", () => {
    const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = getRelativePath("file:///Users/talatkuyuk/project/tests/image.png");
    expect(result).toBe("file:///Users/talatkuyuk/project/tests/image.png");
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "Provide the baseUrl option for the plugin recma-mdx-change-imports",
    );
    consoleWarnMock.mockRestore();
  });

  it("should handle a file in the root directory", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/image.png",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("../image.png");
  });

  it("should return ./ if absolute and base are the same", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/tests",
      "file:///Users/talatkuyuk/project/tests",
    );
    expect(result).toBe("./");
  });

  it("should track times exceeding root when navigating too far up", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/image.png",
      "file:///Users/talatkuyuk/project/tests/assets",
    );
    expect(result).toBe("../../image.png");
  });

  it("should track times exceeding root when base is deeper", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/image.png",
      "file:///Users/talatkuyuk/project/tests/assets/subfolder",
    );
    expect(result).toBe("../../../image.png");
  });

  it("should handle exceeding root gracefully", () => {
    const result = getRelativePath(
      "file:///Users/talatkuyuk/project/image.png",
      "file:///Users/talatkuyuk/project/tests/assets/subfolder/deepfolder",
    );
    expect(result).toBe("../../../../image.png");
  });
});
