# JSON Schema Support

Use dereferenced JSON Schema objects to define your filtering schema.

## Overview

JSON Schema support provides a convenient way to use existing JSON Schema definitions with `object-reduce-by-map`. The schema is converted to the internal map format, allowing you to leverage existing schema definitions from OpenAPI, Swagger, or other JSON Schema-based systems.

## Performance

JSON Schema parsing is **synchronous** and has minimal overhead:

- **Parsing time**: ~1-2ms
- **No dependencies**: Pure JavaScript implementation
- **Production-ready**: Fast enough for real-time API filtering

**Performance comparison:**
- Direct map: <1ms ⚡ (fastest)
- JSON Schema: ~1-2ms (recommended when you have schemas)
- TypeScript Interface: ~600ms first call, <1ms cached (async)

## Basic Usage

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
  password: 'secret123',      // Will be removed
  internalId: 'xyz-internal'  // Will be removed
};

const result = reducer.fromJsonSchema(input, schema);
// { name: 'John Doe', email: 'john@example.com', age: 30 }
```

## Supported JSON Schema Features

### Basic Types

```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    count: { type: 'integer' },  // Mapped to Number
    active: { type: 'boolean' },
    data: { type: 'object' },    // Generic object
    items: { type: 'array' },    // Generic array
    value: { type: 'null' }
  }
};
```

**Type mapping:**
- `string` → `String`
- `number` → `Number`
- `integer` → `Number`
- `boolean` → `Boolean`
- `object` → `Object` (or nested map if properties defined)
- `array` → `Array` (or typed array if items defined)
- `null` → `null`

### Nested Objects

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        profile: {
          type: 'object',
          properties: {
            bio: { type: 'string' },
            avatar: { type: 'string' }
          }
        }
      }
    }
  }
};

const input = {
  user: {
    name: 'Jane',
    profile: {
      bio: 'Developer',
      avatar: 'https://example.com/avatar.jpg',
      internalRating: 5  // Will be removed
    },
    password: 'secret'  // Will be removed
  }
};

const result = reducer.fromJsonSchema(input, schema);
// {
//   user: {
//     name: 'Jane',
//     profile: {
//       bio: 'Developer',
//       avatar: 'https://example.com/avatar.jpg'
//     }
//   }
// }
```

### Arrays

```typescript
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        }
      }
    }
  }
};

const input = {
  tags: ['javascript', 'nodejs', 'api'],
  users: [
    { id: 1, name: 'Alice', password: 'secret1' },
    { id: 2, name: 'Bob', password: 'secret2' }
  ]
};

const result = reducer.fromJsonSchema(input, schema);
// {
//   tags: ['javascript', 'nodejs', 'api'],
//   users: [
//     { id: 1, name: 'Alice' },
//     { id: 2, name: 'Bob' }
//   ]
// }
```

## API Methods

### Method 1: Attached Method

```typescript
import reducer from 'object-reduce-by-map';

const result = reducer.fromJsonSchema(input, schema, options?);
```

### Method 2: Named Export

```typescript
import { reduceByJsonSchema } from 'object-reduce-by-map';

const result = reduceByJsonSchema(input, schema, options?);
```

### Method 3: Parse Then Reduce

```typescript
import reducer from 'object-reduce-by-map';

// Parse schema to map
const map = reducer.parseJsonSchema(schema);

// Use map with regular reducer
const result = reducer(input, map, options);
```

## With Options

All standard options work with JSON Schema:

```typescript
const result = reducer.fromJsonSchema(input, schema, {
  keepKeys: true,
  allowNullishKeys: true,
  throwErrorOnAlien: false
});
```

See [Configuration Options](configuration.md) for all available options.

## Real-World Examples

### OpenAPI/Swagger Integration

```typescript
// Extract schema from OpenAPI spec
const openApiSpec = {
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
};

// Use the schema
const userSchema = openApiSpec.components.schemas.User;
const safeUser = reducer.fromJsonSchema(dbUser, userSchema);
```

### API Response Filtering

```typescript
import express from 'express';
import reducer from 'object-reduce-by-map';

const app = express();

// Define response schema
const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    createdAt: { type: 'string' }
  }
};

app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  // user includes: password, internalId, permissions, etc.
  
  const safeUser = reducer.fromJsonSchema(user, userResponseSchema);
  res.json(safeUser);
});
```

### Batch Processing

```typescript
const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' }
  }
};

// Process multiple items
const products = await db.products.find({});
const publicProducts = products.map(product => 
  reducer.fromJsonSchema(product, productSchema)
);
```

### Schema Reuse

```typescript
// Parse once, reuse many times
const map = reducer.parseJsonSchema(productSchema);

// Use the map for multiple operations
const filtered1 = reducer(product1, map);
const filtered2 = reducer(product2, map);
const filtered3 = reducer(product3, map);
```

## Important Limitations

### $ref Not Supported

Schemas **must be dereferenced** before use. References (`$ref`) are not supported:

```typescript
// ❌ This will throw an error
const schemaWithRef = {
  type: 'object',
  properties: {
    user: { $ref: '#/definitions/User' }
  }
};

// ✅ Use dereferenced schema instead
const dereferencedSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    }
  }
};
```

**Solution:** Use a JSON Schema dereferencing library:

```typescript
import $RefParser from '@apidevtools/json-schema-ref-parser';

// Dereference the schema
const dereferencedSchema = await $RefParser.dereference(schemaWithRefs);

// Now use it
const result = reducer.fromJsonSchema(input, dereferencedSchema);
```

### Advanced JSON Schema Features Not Supported

The following JSON Schema features are **not** supported:

❌ `$ref` - References  
❌ `allOf`, `anyOf`, `oneOf` - Combinators  
❌ `not` - Negation  
❌ `additionalProperties` - Dynamic properties  
❌ `patternProperties` - Pattern-based properties  
❌ `if/then/else` - Conditional schemas  
❌ Validation keywords (`minLength`, `maxLength`, `pattern`, etc.)

**Why?** These features don't map cleanly to the JavaScript type constructor format. The focus is on **structure filtering**, not validation.

## Error Handling

### Schema with $ref

```typescript
try {
  const result = reducer.fromJsonSchema(input, schemaWithRef);
} catch (error) {
  console.error(error.message);
  // "jsonSchemaParser: $ref found in property "user". 
  //  Schema must be dereferenced before parsing."
}
```

### Invalid Schema

```typescript
try {
  const result = reducer.fromJsonSchema(input, null);
} catch (error) {
  console.error(error.message);
  // "jsonSchemaParser: schema must be an object"
}
```

## When to Use JSON Schema

**Use JSON Schema when:**
- ✅ You already have JSON Schema definitions (OpenAPI, Swagger)
- ✅ You need fast, synchronous filtering
- ✅ Your schemas are dereferenced
- ✅ You want minimal overhead (~1-2ms)

**Use Direct Map when:**
- ✅ You need the absolute fastest performance (<1ms)
- ✅ You're generating schemas programmatically
- ✅ You have simple, static schemas

**Use TypeScript Interfaces when:**
- ✅ You're working in a TypeScript codebase
- ✅ You want to use existing TypeScript types
- ✅ The ~600ms first-call overhead is acceptable
- ✅ You can cache the parsed result

## Comparison Table

| Feature | Direct Map | JSON Schema | TypeScript Interface |
|---------|-----------|-------------|---------------------|
| **Performance** | <1ms ⚡ | ~1-2ms | ~600ms first, <1ms cached |
| **Async** | No | No | Yes |
| **Dependencies** | None | None | TypeScript (peer) |
| **Type Safety** | Manual | Via schema | Native TS |
| **Reusability** | High | High | High |
| **Learning Curve** | Low | Low | Medium |

---

## Navigation

**← Previous:** [Installation & Basic Usage](installation.md)  
**→ Next:** [TypeScript Interface Parsing](typescript-interfaces.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Configuration Options](configuration.md) - All available options
- [Examples](examples.md) - Real-world usage examples
- [API Reference](api-reference.md) - Complete API documentation
- [Migration Guide](migration-guide.md) - Upgrading guide
- [Testing & Distribution](testing.md) - How the package is tested
