![logo.png](logo.png)

# object-reduce-by-map

Recursively reduce an object to match a given map, plus config options, 1 js file (with types)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation & Usage](#installation--usage)
  - [CommonJS with TypeScript (using `import` syntax)](#commonjs-with-typescript-using-import-syntax)
  - [CommonJS](#commonjs)
  - [ES Modules](#es-modules)
- [Features](#features)
- [Example use as an API output transformer](#example-use-as-an-api-output-transformer)
- [Example usages](#example-usages)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation & Usage

Install the package:

```bash
npm install object-reduce-by-map
```

### CommonJS with TypeScript (using `import` syntax)

If you're using TypeScript with `module: commonjs` and `esModuleInterop`/`allowSyntheticDefaultImports` enabled, you can import like this:

```ts
import reduceByMap from 'object-reduce-by-map';

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```

### CommonJS
```typescript
const reduceByMap = require('object-reduce-by-map');

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```
### ES Modules
```typescript
import reduceByMap from 'object-reduce-by-map';

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```

## Features
There are several options available to control how the reducer operates, the description for each can be read in the definition file:
[reducer.d.ts](../src/reducer.d.ts)

## Example use as an API output transformer

An example use case of this package can be found in the TypeScript openapi-nodegen templates as an output
transformer: [openapi-nodegen-typescript-server](https://github.com/acr-lfr/openapi-nodegen-typescript-server/blob/master/src/http/nodegen/routes/___op.ts.njk#L31)

## Example usages

The most up-to-date examples can always
be [found in the tests of this project](https://github.com/j-d-carmichael/object-reduce-by-map/tree/master/__tests__)
