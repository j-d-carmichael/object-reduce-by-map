# Installation & Basic Usage

## Installation

Install the package via npm:

```bash
npm install object-reduce-by-map
```

For TypeScript interface parsing (optional):

```bash
npm install typescript
```

## Module Systems

The package supports both CommonJS and ES Modules.

### ES Modules (Recommended)

```typescript
import reduceByMap from 'object-reduce-by-map';

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```

### CommonJS

```javascript
const { reduceByMap } = require('object-reduce-by-map');

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```

### TypeScript with CommonJS

If you're using TypeScript with `module: commonjs` and `esModuleInterop`/`allowSyntheticDefaultImports` enabled:

```typescript
import reduceByMap from 'object-reduce-by-map';

const input = { foo: 1, bar: null };
const map = { foo: Number };

const output = reduceByMap(input, map);
console.log(output); // { foo: 1 }
```

## Basic Usage

### Simple Object Reduction

```typescript
import reduceByMap from 'object-reduce-by-map';

const input = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  internalId: 'abc-internal'
};

const map = {
  name: String,
  email: String
};

const result = reduceByMap(input, map);
console.log(result);
// Output: { name: 'John Doe', email: 'john@example.com' }
```

### Nested Objects

```typescript
const input = {
  user: {
    name: 'Jane',
    email: 'jane@example.com',
    password: 'secret'
  },
  metadata: {
    created: '2024-01-01',
    internalFlag: true
  }
};

const map = {
  user: {
    name: String,
    email: String
  },
  metadata: {
    created: String
  }
};

const result = reduceByMap(input, map);
// Output: {
//   user: { name: 'Jane', email: 'jane@example.com' },
//   metadata: { created: '2024-01-01' }
// }
```

### Arrays

```typescript
const input = {
  users: [
    { name: 'Alice', email: 'alice@example.com', password: 'secret1' },
    { name: 'Bob', email: 'bob@example.com', password: 'secret2' }
  ]
};

const map = {
  users: [{
    name: String,
    email: String
  }]
};

const result = reduceByMap(input, map);
// Output: {
//   users: [
//     { name: 'Alice', email: 'alice@example.com' },
//     { name: 'Bob', email: 'bob@example.com' }
//   ]
// }
```

## Type Constructors

You can use JavaScript constructors to define expected types:

- `String` - String values
- `Number` - Numeric values
- `Boolean` - Boolean values
- `Object` - Any object
- `Array` - Any array
- `Date` - Date objects
- Custom constructors - Your own classes

```typescript
const map = {
  name: String,
  age: Number,
  active: Boolean,
  metadata: Object,
  tags: Array,
  createdAt: Date
};
```

## Next Steps

- Learn about [TypeScript Interface Parsing](typescript-interfaces.md)
- Explore [Configuration Options](configuration.md)
- See more [Examples](examples.md)
- Check the [API Reference](api-reference.md)
