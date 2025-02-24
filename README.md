# recma-mdx-change-imports

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a **[unified][unified]** (**[recma][recma]**) plugin **that converts import declarations for assets and media with relative links into variable declarations with string URLs in the compiled MDX source.**

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[recma][recma]** adds support for producing a javascript code by transforming **[esast][esast]** which stands for Ecma Script Abstract Syntax Tree (AST) that is used in production of compiled source for the **[MDX][MDX]**.

## When should I use this?

**Use this plugin to enable direct asset URL resolution in MDX documents.**

This plugin allows you to transform asset and media imports with relative paths into string URLs, ensuring they resolve correctly in the compiled MDX output.

For example, it transforms:

```javascript
import imgUrl from "./image.png";
```
into
```javascript
const imgUrl = "/image.png";
```

Using this plugin, you can write content in MDX like this:
```markdown
import imgUrl from "./image.png";

<img src={imgUrl} alt="Example image" />
```

## Installation

This package is suitable for ESM only. In Node.js (version 18+), install with npm:

```bash
npm install recma-mdx-change-imports
```

or

```bash
yarn add recma-mdx-change-imports
```

## Usage

Say we have the following file, `example.mdx`,

```markdown
## Title

import imgUrl from "./image.png";

<img src={imgUrl} alt="Example image" />
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import { compile } from "@mdx-js/mdx";
import recmaMdxChangeImports from "recma-mdx-change-imports";

main();

async function main() {
  const source = await read("example.mdx");

  const compiledSource = await compile(source, {
    outputFormat: "function-body",
    recmaPlugins: [recmaMdxChangeImports],
  });

  return String(compiledSource);
}
```

Now, running `node example.js` produces the `compiled source` below:

```js
"use strict";
const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
const _importMetaUrl = arguments[0].baseUrl;
if (!_importMetaUrl) throw new Error("Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`");
const imgUrl = "/image.png";
function _createMdxContent(props) {
  const _components = {
    h2: "h2",
    ...props.components
  };
  return _jsxs(_Fragment, {
    children: [_jsx(_components.h2, {
      children: "Title"
    }), "\\n", "\\n", _jsx("img", {
      src: imgUrl,
      alt: "Example image"
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, {
    ...props,
    children: _jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
return {
  default: MDXContent
};
function _resolveDynamicMdxSpecifier(d) {
  if (typeof d !== "string") return d;
  try {
    new URL(d);
    return d;
  } catch {}
  if (d.startsWith("/") || d.startsWith("./") || d.startsWith("../")) return new URL(d, _importMetaUrl).href;
  return d;
}
```

Pay attention to that the compiled source contains the variable declatation **`const imgUrl = "/image.png";`**. Without the `recma-mdx-change-imports`, the statement would be an import declaration **`import imgUrl from "./image.png";`**.

## Options

All options are optional and have default value.

```typescript
export type ChangeImportsOptions = {
  pathname?: string; // default is empty string ""
};
```

The options are self-explainotary, so that is why no need to represent more example here.

```javascript
use(recmaMdxChangeImports, {pathname: "blog-images"} as ChangeImportsOptions);
```

now, the statement (variable declaration) in the compiled MDX source is going to be:
```javascript
const imgUrl = "/blog-images/image.png";
```

## Syntax tree

This plugin only modifies the ESAST (Ecma Script Abstract Syntax Tree) as explained.

## Types

This package is fully typed with [TypeScript][url-typescript]. The plugin options is exported as `ChangeImportsOptions`.

## Compatibility

This plugin works with `unified` version 6+. It is compatible with `mdx` version 3+.

## Security

Use of `recma-mdx-change-imports` does not involve user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.

## License

[MIT License](./LICENSE) © ipikuka

[unified]: https://github.com/unifiedjs/unified
[micromark]: https://github.com/micromark/micromark
[recma]: https://mdxjs.com/docs/extending-mdx/#list-of-plugins
[esast]: https://github.com/syntax-tree/esast
[estree]: https://github.com/estree/estree
[MDX]: https://mdxjs.com/

[badge-npm-version]: https://img.shields.io/npm/v/recma-mdx-change-imports
[badge-npm-download]:https://img.shields.io/npm/dt/recma-mdx-change-imports
[url-npm-package]: https://www.npmjs.com/package/recma-mdx-change-imports
[url-github-package]: https://github.com/ipikuka/recma-mdx-change-imports

[badge-license]: https://img.shields.io/github/license/ipikuka/recma-mdx-change-imports
[url-license]: https://github.com/ipikuka/recma-mdx-change-imports/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/recma-mdx-change-imports/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/recma-mdx-change-imports/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/recma-mdx-change-imports
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-change-imports/graph/badge.svg?token=MPKUA07Z6N
[url-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-change-imports

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Frecma-mdx-change-imports%2Fmaster%2Fpackage.json
