import { resolvePath } from "../src/utils.js";

describe("resolve path", () => {
  it("should normalize pathname by removing leading and trailing slashes", () => {
    expect(resolvePath("./image.png", "/tests/")).toBe("/tests/image.png");
    expect(resolvePath("./image.png", "////tests////")).toBe("/tests/image.png");
  });

  it("should normalize Unicode input using NFC", () => {
    expect(resolvePath("./café.png", "assets")).toBe("/assets/café.png");
  });

  it("should remove './' and '../' when pathname is missing", () => {
    expect(resolvePath("./image.png")).toBe("/image.png");
    expect(resolvePath("../image.png")).toBe("/image.png");
    expect(resolvePath("../../image.png")).toBe("/image.png");
  });

  it("should handle navigation up levels ('..') correctly", () => {
    expect(resolvePath("../image.png", "tests/assets")).toBe("/tests/image.png");
    expect(resolvePath("../../image.png", "tests/assets/subfolder")).toBe("/tests/image.png");
  });

  it("should handle exceeding root gracefully", () => {
    expect(resolvePath("../../../image.png", "tests/assets/subfolder")).toBe("/image.png");
    expect(resolvePath("../../../../image.png", "tests/assets/subfolder/deepfolder")).toBe(
      "/image.png",
    );
  });

  it("should ignore '.' in paths", () => {
    expect(resolvePath("./image.png", "tests")).toBe("/tests/image.png");
    expect(resolvePath("./assets/./image.png", "tests")).toBe("/tests/assets/image.png");
  });

  it("should return absolute path when exceeding root without a sibling directory", () => {
    expect(resolvePath("../../../../image.png", "")).toBe("/image.png");
  });

  it("should correctly resolve deep relative paths", () => {
    expect(resolvePath("../../../docs/tutorials/../image.png", "tests/assets/subfolder")).toBe(
      "/docs/image.png",
    );
    expect(resolvePath("./subdir/../image.png", "tests")).toBe("/tests/image.png");
  });

  it("should increase upCount when navigating too far up beyond root", () => {
    expect(resolvePath("../../image.png", "")).toBe("/image.png");
    expect(resolvePath("../../../image.png", "")).toBe("/image.png");
  });

  it("should pop resolvedSegments when navigating up within valid depth", () => {
    expect(resolvePath("../image.png", "tests/assets")).toBe("/tests/image.png");
    expect(resolvePath("../../image.png", "tests/assets/subfolder")).toBe("/tests/image.png");
  });

  it("should both pop resolvedSegments and track exceeding root when mixed", () => {
    expect(resolvePath("../../../../image.png", "tests/assets")).toBe("/image.png");
    expect(resolvePath("../../../../image.png", "tests/assets/subfolder")).toBe("/image.png");
  });

  it("should navigate up one level when resolving a path with '..' and ensure resolvedSegments is not empty", () => {
    expect(resolvePath("../assets/massets/../image.png", "tests/subfolder/nested")).toBe(
      "/tests/subfolder/assets/image.png",
    );
  });
});
