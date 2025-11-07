# object-reduce-by-map aka OBR-M

[![npm version](https://img.shields.io/npm/v/object-reduce-by-map.svg)](https://www.npmjs.com/package/object-reduce-by-map)

Recursively reduce an object to match a given map (Map, JSON Schema, TypeScript Interface). Perfect for filtering API responses and preventing data leakage.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Full Documentation](#full-documentation)
- [Quick Start](#quick-start)
  - [Three Ways to Define Your Schema](#three-ways-to-define-your-schema)
- [Features](#features)
- [Map-Based Filtering Example](#map-based-filtering-example)
- [JSON Schema Support](#json-schema-support)
- [TypeScript Interface String Parsing](#typescript-interface-string-parsing)
  - [Perfect for LLM Output Sanitization](#perfect-for-llm-output-sanitization)
- [Documentation](#documentation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Full Documentation

**📚 [Full Documentation](https://j-d-carmichael.github.io/object-reduce-by-map)**

## Quick Start

```bash
npm install object-reduce-by-map
```

```typescript
import reduceByMap from 'object-reduce-by-map';

const input = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',  // Will be removed
  internalId: 'xyz'       // Will be removed
};

const map = { name: String, email: String };

const result = reduceByMap(input, map);
// { name: 'John', email: 'john@example.com' }
```

### Three Ways to Define Your Schema

**1. Direct Map (Fastest ⚡)**
```typescript
const map = { name: String, email: String, age: Number };
const result = reduceByMap(input, map);
```
This is the **fastest** way to use object-reduce-by-map. Use this when you already have a map or can generate one.

**2. JSON Schema (Convenient)**
```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  }
};
const result = reducer.fromJsonSchema(input, schema);
```
Converts JSON Schema to a map. Slightly slower due to parsing overhead.

**3. TypeScript Interface (Convenient, Async)**
```typescript
const interfaceString = `
  interface User {
    name: string;
    email: string;
  }
`;
const result = await reducer.fromInterface(input, interfaceString);
```
Parses TypeScript interfaces. Slowest option (~600ms first call, <1ms cached) but very convenient.

**Performance Comparison:**
- Direct map: **<1ms** ⚡ (recommended for production)
- JSON Schema: **~1-2ms** (parsing overhead)
- TypeScript Interface: **~600ms first call, <1ms cached** (requires TypeScript peer dependency)

## Features

✅ **Map-based object reduction** - Define schemas using JavaScript constructors (fastest)  
✅ **JSON Schema support** - Use JSON Schema objects as input (NEW!)  
✅ **TypeScript interface parsing** - Use TypeScript interfaces directly as schemas  
✅ **Nested object support** - Handle deeply nested structures  
✅ **Array handling** - Process arrays of objects  
✅ **Type validation** - Ensure correct types  
✅ **Flexible options** - Control behavior with various configuration options  
✅ **Zero dependencies** - Core functionality has no dependencies  
✅ **TypeScript support** - Full type definitions included  
✅ **Tiny bundle size** - ~10 KB (core), TypeScript optional

## Map-Based Filtering Example

A real world use case here is as a middleware in ExpressJS, the middleware would ensure the output does not contain data it should not output.

It can be considered an accidental safety net.

```typescript
// A map using JavaScript type constructors (typically auto generated from an OpenAPI spec):
const map = {
  starts: Number,
  wins: Number,
  secondPlaces: Number,
  thirdPlaces: Number,
  topFives: Number,
  topFiveRatio: Number,
  mostRecentRank: {
    event: {
      locations: [{ country: String, city: String, timezone: String }],
    },
    rank: Number
  },
  bestRank: Number
};

// A payload generated from a database query or similar
const input = {
  This_Should_Not_Be_In_The_Output: 'the api should not deliver this content',
  starts: 0,
  wins: 0,
  secondPlaces: 0,
  thirdPlaces: 0,
  topFives: 0,
  topFiveRatio: null,
  mostRecentRank: {
    event: {
      locations: [{
        country: null
      }]
    }
  },
  bestRank: null
};

// The test case here is asserting that the "This_Should_Not_Be_In_The_Output" attribute in the object is stripped
// When used in an output transformer for an API this is a safety net preventing accidental data leakage 
it('Should handle null leaf values ie remove them', () => {
  expect(reducer(input, map)).toEqual({
    starts: 0,
    wins: 0,
    secondPlaces: 0,
    thirdPlaces: 0,
    topFives: 0,
    mostRecentRank: {
      event: {
        locations: [{}]
      }
    },
  });
});

```

## JSON Schema Support

Use dereferenced JSON Schema objects as input:

```typescript
import reducer from 'object-reduce-by-map';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  }
};

const input = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  password: 'secret123',  // Will be removed
  internalId: 'xyz'       // Will be removed
};

const result = reducer.fromJsonSchema(input, schema);
// { name: 'John Doe', email: 'john@example.com', age: 30 }
```

**Note:** Schema must be dereferenced (no `$ref`). This is a synchronous operation with minimal overhead (~1-2ms).

**Perfect for:**
- OpenAPI/Swagger schemas
- Existing JSON Schema validation
- API contract enforcement

## TypeScript Interface String Parsing

Use TypeScript interfaces directly as schemas:

```typescript
import reducer from 'object-reduce-by-map';

const interfaceString = `
  interface User {
    name: string;
    email: string;
    age: number;
  }
`;

const input = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  password: 'secret123',  // Will be removed
  internalId: 'xyz'       // Will be removed
};

const result = await reducer.fromInterface(input, interfaceString);
// { name: 'John Doe', email: 'john@example.com', age: 30 }
```

**Requires:** `npm install typescript` (optional peer dependency)

### Perfect for LLM Output Sanitization

A powerful use case is cleaning up LLM (Large Language Model) responses. LLMs often hallucinate and add extra fields to their JSON output. Use interface parsing to strip out hallucinated fields and ensure the output strictly matches your expected schema:

```typescript
// LLM returns extra fields like 'confidence', 'reasoning', 'metadata'
const llmOutput = await callLLM('Generate a product...');

// Strip hallucinated fields to match interface exactly
const cleanOutput = await reducer.fromInterface(llmOutput, productInterface);
```

**[Learn more about TypeScript Interface Parsing & LLM Sanitization →](https://j-d-carmichael.github.io/object-reduce-by-map/#/typescript-interfaces)**

## Documentation

- **[Installation & Basic Usage](https://j-d-carmichael.github.io/object-reduce-by-map/#/installation)** - Get started with all three input methods
- **[JSON Schema Support](https://j-d-carmichael.github.io/object-reduce-by-map/#/json-schema)** - Use JSON Schema objects (NEW!)
- **[TypeScript Interface Parsing](https://j-d-carmichael.github.io/object-reduce-by-map/#/typescript-interfaces)** - Use TS interfaces as schemas
- **[Configuration Options](https://j-d-carmichael.github.io/object-reduce-by-map/#/configuration)** - All available options
- **[Examples](https://j-d-carmichael.github.io/object-reduce-by-map/#/examples)** - Real-world examples
- **[API Reference](https://j-d-carmichael.github.io/object-reduce-by-map/#/api-reference)** - Complete API docs
- **[Migration Guide](https://j-d-carmichael.github.io/object-reduce-by-map/#/migration-guide)** - Upgrading guide
- **[Testing & Distribution](https://j-d-carmichael.github.io/object-reduce-by-map/#/testing)** - How it's tested
