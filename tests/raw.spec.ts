import { compile, nodeTypes } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
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
  it("when jsx is true, recmaMdxChangeImports can't find the target", async () => {
    const compiledSource = await compile(source, {
      jsx: true,
      outputFormat: "program",
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
      recmaPlugins: [recmaImportImages, recmaMdxChangeImports],
    });

    // if jsx is true, recmaMdxChangeImports can not find the target
    expect(String(compiledSource)).not.toContain(dedent`
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], rehypeMdxImportMedia],
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
      jsx: true, // compiled source contains jsx syntax like <_components.h1></_components.h1>
      outputFormat: "program",
      baseUrl: import.meta.url,
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], rehypeMdxImportMedia],
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
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], rehypeMdxImportMedia],
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
      jsx: true, // compiled source contains jsx syntax like <_components.h1></_components.h1>
      outputFormat: "function-body",
      baseUrl: import.meta.url,
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], rehypeMdxImportMedia],
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
