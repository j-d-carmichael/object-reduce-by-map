# TypeScript Interface Parsing

> **NEW Feature:** Parse TypeScript interface strings directly as schemas!

## Overview

Instead of manually creating map objects, you can now use TypeScript interface strings directly. This is powered by the TypeScript Compiler API for accurate parsing.

## Requirements

To use this feature, install TypeScript as a peer dependency:

```bash
npm install typescript
```

> **Note:** TypeScript is an **optional** peer dependency. If you don't need interface parsing, you don't need to install it. The core reducer functionality works without TypeScript, keeping your bundle size minimal (~10 KB).

## Bundle Size

| Feature | Bundle Size | TypeScript Required |
|---------|-------------|---------------------|
| Core reducer | ~10 KB | ❌ No |
| Interface parsing | ~10 KB + TypeScript | ✅ Yes |

TypeScript is **not bundled** with the package, so users who don't need interface parsing don't pay the cost.

## Basic Usage

All interface parsing methods are **async** and return Promises:

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
  password: 'secret123',        // Will be removed
  internalId: 'xyz-internal'    // Will be removed
};

// Use the interface to filter the object (async!)
const result = await reducer.fromInterface(input, interfaceString);

console.log(result);
// Output: { name: 'John Doe', email: 'john@example.com', age: 30 }
```

## Advanced Features

### Nested Objects & Interface References

```typescript
const interfaceString = `
  interface Address {
    street: string;
    city: string;
    country: string;
  }
  
  interface User {
    name: string;
    email: string;
    address: Address;
  }
`;

const input = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  address: {
    street: '123 Main St',
    city: 'Boston',
    country: 'USA',
    internalCode: 'XYZ'  // Will be removed
  },
  password: 'secret'     // Will be removed
};

const result = await reducer.fromInterface(input, interfaceString);
// Output: {
//   name: 'Jane Smith',
//   email: 'jane@example.com',
//   address: {
//     street: '123 Main St',
//     city: 'Boston',
//     country: 'USA'
//   }
// }
```

### Arrays

```typescript
const interfaceString = `
  interface Item {
    id: number;
    name: string;
  }
  
  interface Cart {
    items: Item[];
    total: number;
  }
`;

const input = {
  items: [
    { id: 1, name: 'Widget', internalSku: 'W-001' },
    { id: 2, name: 'Gadget', internalSku: 'G-002' }
  ],
  total: 99.99,
  userId: 'internal-123'
};

const result = await reducer.fromInterface(input, interfaceString, 'Cart');
// Output: {
//   items: [
//     { id: 1, name: 'Widget' },
//     { id: 2, name: 'Gadget' }
//   ],
//   total: 99.99
// }
```

### Multiple Interfaces

When you have multiple interfaces, specify which one to use:

```typescript
const interfaceString = `
  interface User {
    name: string;
    email: string;
  }
  
  interface Product {
    id: number;
    title: string;
  }
`;

// Specify the interface name
const result = await reducer.fromInterface(input, interfaceString, 'User');
```

If only one interface is defined, it will be used automatically.

### Interface Inheritance

```typescript
const interfaceString = `
  interface Person {
    name: string;
    age: number;
  }
  
  interface Employee extends Person {
    employeeId: string;
    department: string;
  }
`;

const input = {
  name: 'Bob',
  age: 35,
  employeeId: 'E-12345',
  department: 'Engineering',
  salary: 100000  // Will be removed
};

const result = await reducer.fromInterface(input, interfaceString, 'Employee');
// Output: {
//   name: 'Bob',
//   age: 35,
//   employeeId: 'E-12345',
//   department: 'Engineering'
// }
```

### Optional Properties & Union Types

```typescript
const interfaceString = `
  interface User {
    name: string;
    email?: string;
    age: number | null;
  }
`;

// Optional properties and union types are handled automatically
```

### With Options

You can use all the same options as the regular reducer:

```typescript
const result = await reducer.fromInterface(input, interfaceString, {
  keepKeys: true,
  allowNullish: true
});

// Or with interface name and options
const result = await reducer.fromInterface(
  input, 
  interfaceString, 
  'User',
  { keepKeys: true }
);
```

## API Methods

### Method 1: Attached Method

```typescript
import reducer from 'object-reduce-by-map';

await reducer.fromInterface(input, interfaceString, interfaceName?, options?)
```

### Method 2: Named Export

```typescript
import { reduceByInterface } from 'object-reduce-by-map';

await reduceByInterface(input, interfaceString, interfaceName?, options?)
```

### Method 3: Parse Only (No Reduction)

```typescript
import { parseInterfaceToMap } from 'object-reduce-by-map';

// Convert interface to map object
const map = await parseInterfaceToMap(interfaceString, interfaceName?);

// Then use with regular reducer
const result = reducer(input, map);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | `any` | ✅ Yes | The object to filter |
| `interfaceString` | `string` | ✅ Yes | TypeScript interface(s) as a string |
| `interfaceName` | `string` | ❌ No | Specific interface name when multiple are defined |
| `options` | `Options` | ❌ No | Same options as `reduceByMap` |

## Return Value

All interface methods return `Promise<any>` - they are async functions.

## Error Handling

If TypeScript is not installed:

```
Error: TypeScript is required to parse interface strings.
Please install it: npm install typescript
```

If the interface is not found:

```
Error: Interface "Product" not found. Available interfaces: User, Address
```

## Supported TypeScript Features

✅ **Primitive types**: `string`, `number`, `boolean`  
✅ **Object types**: Nested interfaces  
✅ **Array types**: `Type[]` and `Array<Type>`  
✅ **Interface references**: Reference other interfaces  
✅ **Forward references**: Interfaces can reference each other  
✅ **Inheritance**: `extends` keyword  
✅ **Union types**: `string | number`  
✅ **Optional properties**: `property?:`  
✅ **Type literals**: Inline object types  
✅ **Comments**: Preserved in interface strings

❌ **Not supported**: Generics, conditional types, mapped types, utility types

## Performance

- **First call**: ~600ms (loads TypeScript dynamically)
- **Subsequent calls**: <1ms (TypeScript cached in memory)
- **No impact** on core reducer performance

## Real-World Example

```typescript
// API route handler
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  // Define public API schema
  const publicUserInterface = `
    interface PublicUser {
      id: number;
      name: string;
      email: string;
      avatar: string;
      createdAt: string;
    }
  `;
  
  // Filter out sensitive fields
  const safeUser = await reducer.fromInterface(user, publicUserInterface);
  
  res.json(safeUser);
});
```

## Next Steps

- See more [Examples](examples.md)
- Learn about [Configuration Options](configuration.md)
- Check the [API Reference](api-reference.md)
- Read the [Migration Guide](migration-guide.md) for upgrading
