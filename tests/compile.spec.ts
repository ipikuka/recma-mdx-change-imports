import { compile } from "@mdx-js/mdx";
import { recmaImportImages } from "recma-import-images";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import dedent from "dedent";

import recmaMdxChangeImports, { type ChangeImportsOptions } from "../src";

const source = dedent`
  # Title

  import imgUrl from "./image.png";

  <img alt="alt" src={imgUrl} />

  ![alt](./image.png)
`;

describe("recmaMdxChangeImports, with support of recmaImportImages", () => {
  // ******************************************
  it("when outputFormat is program, without baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaImportImages, recmaMdxChangeImports],
    });

    expect(String(compiledSource)).toContain(dedent`
      const image_png$recmaImportImages = "/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is program, with baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      baseUrl: import.meta.url,
      recmaPlugins: [
        recmaImportImages,
        [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
      ],
    });

    expect(String(compiledSource)).toContain(dedent`
      const image_png$recmaImportImages = "/blog-images/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/blog-images/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is function-body, without baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      recmaPlugins: [recmaImportImages, recmaMdxChangeImports],
    });

    expect(String(compiledSource)).toContain(dedent`
      const image_png$recmaImportImages = "/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is function-body, with baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      baseUrl: import.meta.url,
      recmaPlugins: [
        recmaImportImages,
        [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
      ],
    });

    expect(String(compiledSource)).toContain(dedent`
      const image_png$recmaImportImages = "/blog-images/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/blog-images/image.png";
    `);
  });
});

describe("recmaMdxChangeImports, with support of rehypeMdxImportMedia", () => {
  // ******************************************
  it("when outputFormat is program, without baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      rehypePlugins: [rehypeMdxImportMedia],
      recmaPlugins: [recmaMdxChangeImports],
    });

    expect(String(compiledSource)).toContain(dedent`
      const _rehypeMdxImportMedia0 = "/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is program, with baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      baseUrl: import.meta.url,
      rehypePlugins: [rehypeMdxImportMedia],
      recmaPlugins: [
        [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
      ],
    });

    expect(String(compiledSource)).toContain(dedent`
      const _rehypeMdxImportMedia0 = "/blog-images/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/blog-images/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is function-body, without baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      rehypePlugins: [rehypeMdxImportMedia],
      recmaPlugins: [recmaMdxChangeImports],
    });

    expect(String(compiledSource)).toContain(dedent`
      const _rehypeMdxImportMedia0 = "/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/image.png";
    `);
  });

  // ******************************************
  it("when outputFormat is function-body, with baseUrl", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      baseUrl: import.meta.url,
      rehypePlugins: [rehypeMdxImportMedia],
      recmaPlugins: [
        [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
      ],
    });

    expect(String(compiledSource)).toContain(dedent`
      const _rehypeMdxImportMedia0 = "/blog-images/image.png";
    `);

    expect(String(compiledSource)).toContain(dedent`
      const imgUrl = "/blog-images/image.png";
    `);
  });
});
