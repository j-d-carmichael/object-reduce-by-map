# object-reduce-by-map aka OBR-M

Recursively reduce an object to match a given map. Perfect for filtering API responses and preventing data leakage.

[![npm version](https://img.shields.io/npm/v/object-reduce-by-map.svg)](https://www.npmjs.com/package/object-reduce-by-map)
[![npm downloads](https://img.shields.io/npm/dm/object-reduce-by-map.svg)](https://www.npmjs.com/package/object-reduce-by-map)

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

## Features

✅ **Map-based object reduction** - Define schemas using JavaScript constructors  
✅ **TypeScript interface parsing** - Use TypeScript interfaces directly as schemas (NEW!)  
✅ **Nested object support** - Handle deeply nested structures  
✅ **Array handling** - Process arrays of objects  
✅ **Type validation** - Ensure correct types  
✅ **Flexible options** - Control behavior with various configuration options  
✅ **Zero dependencies** - Core functionality has no dependencies  
✅ **TypeScript support** - Full type definitions included  
✅ **Tiny bundle size** - ~10 KB (core), TypeScript optional

## Example:

A real world use case here is as a middleware in ExpressJS, the middleware would ensure the output does not contain data it should not output.

It can be considered an accidental safety net.

```typescript
// A map (typically auto generated from an OpenAPI scec):
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

## NEW: TypeScript Interface Parsing

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

**[Learn more about TypeScript Interface Parsing →](https://j-d-carmichael.github.io/object-reduce-by-map/#/typescript-interfaces)**

## Documentation

- **[Installation & Basic Usage](https://j-d-carmichael.github.io/object-reduce-by-map/#/installation)** - Get started
- **[TypeScript Interface Parsing](https://j-d-carmichael.github.io/object-reduce-by-map/#/typescript-interfaces)** - Use TS interfaces as schemas
- **[Configuration Options](https://j-d-carmichael.github.io/object-reduce-by-map/#/configuration)** - All available options
- **[Examples](https://j-d-carmichael.github.io/object-reduce-by-map/#/examples)** - Real-world examples
- **[API Reference](https://j-d-carmichael.github.io/object-reduce-by-map/#/api-reference)** - Complete API docs
- **[Migration Guide](https://j-d-carmichael.github.io/object-reduce-by-map/#/migration-guide)** - Upgrading guide
- **[Testing & Distribution](https://j-d-carmichael.github.io/object-reduce-by-map/#/testing)** - How it's tested
