# API Reference

Complete API documentation for `object-reduce-by-map`.

## Core Function

### `reduceByMap(input, map, options?)`

The main reducer function that filters objects based on a map.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `any` | ✅ Yes | The input object or array to reduce |
| `map` | `object` | ✅ Yes | The map defining the structure to keep |
| `options` | `Options` | ❌ No | Configuration options |

**Returns:** `any` - The reduced object/array

**Example:**

```typescript
import reduceByMap from 'object-reduce-by-map';

const result = reduceByMap(input, map, options);
```

## Interface Parsing Methods

All interface parsing methods are **async** and return Promises.

### `reduceByMap.fromInterface(input, interfaceString, interfaceName?, options?)`

Reduce an object using a TypeScript interface string as the schema.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `any` | ✅ Yes | The input object or array to reduce |
| `interfaceString` | `string` | ✅ Yes | TypeScript interface(s) as a string |
| `interfaceName` | `string` | ❌ No | Specific interface name to use |
| `options` | `Options` | ❌ No | Configuration options |

**Returns:** `Promise<any>` - Promise resolving to the reduced object/array

**Example:**

```typescript
const result = await reduceByMap.fromInterface(input, interfaceString);
const result = await reduceByMap.fromInterface(input, interfaceString, 'User');
const result = await reduceByMap.fromInterface(input, interfaceString, options);
const result = await reduceByMap.fromInterface(input, interfaceString, 'User', options);
```

### `reduceByInterface(input, interfaceString, interfaceName?, options?)`

Named export version of the interface reducer.

**Parameters:** Same as `reduceByMap.fromInterface`

**Returns:** `Promise<any>`

**Example:**

```typescript
import { reduceByInterface } from 'object-reduce-by-map';

const result = await reduceByInterface(input, interfaceString);
```

### `parseInterfaceToMap(interfaceString, interfaceName?)`

Parse a TypeScript interface string into a map object without reducing.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `interfaceString` | `string` | ✅ Yes | TypeScript interface(s) as a string |
| `interfaceName` | `string` | ❌ No | Specific interface name to extract |

**Returns:** `Promise<object>` - Promise resolving to the map object

**Example:**

```typescript
import { parseInterfaceToMap } from 'object-reduce-by-map';

const map = await parseInterfaceToMap(interfaceString);
const map = await parseInterfaceToMap(interfaceString, 'User');

// Then use with regular reducer
const result = reduceByMap(input, map);
```

### `reduceByMap.parseInterface(interfaceString, interfaceName?)`

Attached method version of `parseInterfaceToMap`.

**Parameters:** Same as `parseInterfaceToMap`

**Returns:** `Promise<object>`

**Example:**

```typescript
const map = await reduceByMap.parseInterface(interfaceString);
```

## Options Interface

```typescript
interface Options {
  keepKeys?: boolean;
  throwErrorOnAlien?: boolean;
  allowNullish?: boolean;
  permitEmptyMap?: boolean;
  permitUndefinedMap?: boolean;
}
```

### Options Properties

#### `keepKeys`

**Type:** `boolean`  
**Default:** `false`

When `true`, keeps keys that exist in the input but have `null` or `undefined` values in the map.

#### `throwErrorOnAlien`

**Type:** `boolean`  
**Default:** `false`

When `true`, throws an error if the input contains keys that are not in the map.

#### `allowNullish`

**Type:** `boolean`  
**Default:** `false`

When `true`, allows `null` and `undefined` values to pass through even if they don't match the map type.

#### `permitEmptyMap`

**Type:** `boolean`  
**Default:** `false`

When `true`, allows an empty map `{}` to be passed without throwing an error.

#### `permitUndefinedMap`

**Type:** `boolean`  
**Default:** `false`

When `true`, allows `undefined` to be passed as the map without throwing an error.

See [Configuration Options](configuration.md) for detailed examples.

## Type Constructors

The following JavaScript constructors can be used in map objects:

| Constructor | Description | Example |
|-------------|-------------|---------|
| `String` | String values | `{ name: String }` |
| `Number` | Numeric values | `{ age: Number }` |
| `Boolean` | Boolean values | `{ active: Boolean }` |
| `Object` | Any object | `{ metadata: Object }` |
| `Array` | Any array | `{ tags: Array }` |
| `Date` | Date objects | `{ createdAt: Date }` |
| Custom | Your own classes | `{ user: User }` |

### Nested Objects

```typescript
const map = {
  user: {
    name: String,
    email: String
  }
};
```

### Arrays

```typescript
// Array of primitives
const map = {
  tags: [String]
};

// Array of objects
const map = {
  users: [{
    name: String,
    email: String
  }]
};
```

## Import Patterns

### Default Import

```typescript
import reduceByMap from 'object-reduce-by-map';

// Use core reducer
reduceByMap(input, map);

// Use attached methods
reduceByMap.fromInterface(input, interfaceString);
reduceByMap.parseInterface(interfaceString);
```

### Named Imports

```typescript
import { 
  reduceByMap, 
  reduceByInterface, 
  parseInterfaceToMap 
} from 'object-reduce-by-map';
```

### CommonJS

```javascript
const { 
  reduceByMap, 
  reduceByInterface, 
  parseInterfaceToMap 
} = require('object-reduce-by-map');
```

### TypeScript Types

```typescript
import type { Options } from 'object-reduce-by-map';

const options: Options = {
  keepKeys: true,
  allowNullish: true
};
```

## Error Handling

### TypeScript Not Installed

When using interface parsing without TypeScript installed:

```
Error: TypeScript is required to parse interface strings.
Please install it: npm install typescript
```

### Invalid Interface String

```
Error: interfaceString must be a string
```

### No Interfaces Found

```
Error: No interfaces found in the provided string
```

### Interface Not Found

```
Error: Interface "Product" not found. Available interfaces: User, Address
```

### Alien Keys (with throwErrorOnAlien)

```
Error: Alien key found: password
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
// Function signatures
function reduceByMap(input: any, map: object, options?: Options): any;
function reduceByInterface(
  input: any,
  interfaceString: string,
  interfaceName?: string,
  options?: Options
): Promise<any>;
function parseInterfaceToMap(
  interfaceString: string,
  interfaceName?: string
): Promise<object>;

// Options interface
interface Options {
  keepKeys?: boolean;
  throwErrorOnAlien?: boolean;
  allowNullish?: boolean;
  permitEmptyMap?: boolean;
  permitUndefinedMap?: boolean;
}
```

## Performance Characteristics

### Core Reducer

- **Time Complexity:** O(n) where n is the number of keys
- **Space Complexity:** O(n)
- **Performance:** < 1ms for typical objects

### Interface Parsing

- **First Call:** ~600ms (loads TypeScript)
- **Subsequent Calls:** < 1ms (TypeScript cached)
- **Parsing:** Depends on interface complexity

## Bundle Size

| Component | Size | Dependencies |
|-----------|------|--------------|
| Core reducer | ~10 KB | None |
| Interface parser | ~10 KB | TypeScript (peer, optional) |
| TypeScript | Not bundled | User installs if needed |

## Browser Support

The package is designed for Node.js environments. For browser usage, ensure your bundler supports:

- ES Modules or CommonJS
- Dynamic imports (for interface parsing)
- Async/await

## Node.js Version

- **Minimum:** Node.js 16+
- **Recommended:** Node.js 18+ LTS

---

## Navigation

**← Previous:** [Examples](examples.md)  
**→ Next:** [Migration Guide](migration-guide.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Installation & Basic Usage](installation.md) - Getting started
- [TypeScript Interface Parsing](typescript-interfaces.md) - Use TS interfaces as schemas
- [Configuration Options](configuration.md) - All available options
- [Testing & Distribution](testing.md) - How the package is tested
