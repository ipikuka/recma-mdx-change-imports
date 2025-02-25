import dedent from "dedent";
import { serialize } from "next-mdx-remote-client/serialize";
import recmaMdxImportMedia from "recma-mdx-import-media";

import recmaMdxChangeImports, { type ChangeImportsOptions } from "../src";

describe("serialize", () => {
  // ******************************************
  test("single import statement in MDX", async () => {
    const source = dedent`
      import imgUrl from "./image.png";
    `;

    const result1 = await serialize({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result1) {
      throw "Shouldn't be any syntax error !";
    }

    // without any plugin
    expect(String(result1.compiledSource)).toContain(dedent`
      const {default: imgUrl} = await import(_resolveDynamicMdxSpecifier("./image.png"));
    `);

    const result2 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result2) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugin, no option
    expect(String(result2.compiledSource)).toContain(dedent`
      const imgUrl = "/image.png";
    `);

    const result3 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [
            [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
          ],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result3) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugin and option
    expect(String(result3.compiledSource)).toContain(dedent`
      const imgUrl = "/blog-images/image.png";
    `);
  });

  // ******************************************
  test("single markdown image syntax in MDX", async () => {
    const source = dedent`
      ![alt](./image.png)
    `;

    const result1 = await serialize({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result1) {
      throw "Shouldn't be any syntax error !";
    }

    // without any plugin
    expect(String(result1.compiledSource)).not.toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
    `);

    const result2 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result2) {
      throw "Shouldn't be any syntax error !";
    }

    // with only recmaMdxImportMedia
    expect(String(result2.compiledSource)).toContain(dedent`
      import imagepng$recmamdximport from "./image.png";
    `);

    const result3 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia, recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result3) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugin, no option
    expect(String(result3.compiledSource)).toContain(dedent`
      const imagepng$recmamdximport = "/image.png";
    `);

    const result4 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [
            recmaMdxImportMedia,
            [recmaMdxChangeImports, { pathname: "blog-images" } as ChangeImportsOptions],
          ],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result4) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugin and option
    expect(String(result4.compiledSource)).toContain(dedent`
      const imagepng$recmamdximport = "/blog-images/image.png";
    `);
  });

  // ******************************************
  test("single markdown image syntax NOT with relative link in MDX", async () => {
    const source = dedent`
      ![alt](/image.png)
    `;

    const result1 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result1) {
      throw "Shouldn't be any syntax error !";
    }

    // with only recmaMdxImportMedia
    expect(String(result1.compiledSource)).not.toContain(dedent`
      import imagepng$recmamdximport from "/image.png";
    `);

    const result2 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia, recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result2) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugins, recmaMdxChangeImports doesn't catch expectedly
    expect(String(result2.compiledSource)).not.toContain(dedent`
      const imagepng$recmamdximport = "/image.png";
    `);

    const result3 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result3) {
      throw "Shouldn't be any syntax error !";
    }

    // with only recmaMdxChangeImports, it doesn't catch expectedly
    expect(String(result3.compiledSource)).not.toContain(dedent`from "/image.png"`);
  });

  // ******************************************
  test("single markdown image syntax with a protocol-like pattern in MDX", async () => {
    const source = dedent`
      ![alt](https://www.google.com/image.png)
    `;

    const result1 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result1) {
      throw "Shouldn't be any syntax error !";
    }

    // with only recmaMdxImportMedia, it doesn't catch expectedly
    expect(String(result1.compiledSource)).not.toContain(dedent`
      import imagepng$recmamdximport from "https://www.google.com/image.png";
    `);

    const result2 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia, recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result2) {
      throw "Shouldn't be any syntax error !";
    }

    // with plugins, recmaMdxChangeImports doesn't catch expectedly
    expect(String(result2.compiledSource)).not.toContain(dedent`
      const imagepng$recmamdximport = "https://www.google.com/image.png";
    `);

    const result3 = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxChangeImports],
          baseUrl: import.meta.url,
        },
      },
    });

    if ("error" in result3) {
      throw result3.error;
    }

    // with only recmaMdxChangeImports, it doesn't catch expectedly
    expect(String(result3.compiledSource)).not.toContain(dedent`from "/image.png"`);
  });

  // ******************************************
  test("just for test coverage", async () => {
    const source = dedent`
      import a from "https://www.google.com/image.png";

      import b from "/image.png"

      import c from "./Bar.jsx";

      ![xx](https://www.google.com/image.png)

      ![yy](/image.png)

      ![zz](./Bar.jsx)
    `;

    const result = await serialize({
      source,
      options: {
        mdxOptions: {
          recmaPlugins: [recmaMdxImportMedia, recmaMdxChangeImports],
        },
      },
    });

    if ("error" in result) {
      throw result.error;
    }

    // with plugins, recmaMdxChangeImports doesn't catch expectedly
    expect(String(result.compiledSource)).not.toContain("const a");
    expect(String(result.compiledSource)).not.toContain("const b");
    expect(String(result.compiledSource)).not.toContain("const c");
    expect(String(result.compiledSource)).not.toContain("const barjsx$recmamdximport");
    expect(String(result.compiledSource)).not.toContain("const imagepng$recmamdximport");
  });
});
