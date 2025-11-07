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

## Real-World Examples

### API Response Filtering

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

### LLM Output Sanitization

One powerful use case is sanitizing LLM (Large Language Model) outputs. LLMs often hallucinate and add extra fields or unexpected data to their JSON responses. With interface parsing, you can ensure the output strictly matches your expected schema.

```typescript
import reducer from 'object-reduce-by-map';

// Define the expected structure for LLM output
const productInterface = `
  interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
  }
`;

// Call LLM API (e.g., OpenAI, Anthropic, etc.)
const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: 'Generate a product in JSON format matching this interface: ' + productInterface
    }],
    response_format: { type: 'json_object' }
  })
});

const data = await llmResponse.json();
const llmOutput = JSON.parse(data.choices[0].message.content);

// LLM might return:
// {
//   id: "prod-123",
//   name: "Widget",
//   description: "A useful widget",
//   price: 29.99,
//   category: "Tools",
//   confidence: 0.95,              // ❌ Hallucinated field
//   reasoning: "Based on...",      // ❌ Hallucinated field
//   metadata: { source: "ai" }     // ❌ Hallucinated field
// }

// Strip out hallucinated fields to match the interface exactly
const sanitizedProduct = await reducer.fromInterface(llmOutput, productInterface);

// Result: Only the expected fields
// {
//   id: "prod-123",
//   name: "Widget",
//   description: "A useful widget",
//   price: 29.99,
//   category: "Tools"
// }

console.log(sanitizedProduct);
```

**Why This Matters for LLMs:**

- ✅ **Prevents hallucinated fields** - LLMs often add extra fields like `confidence`, `reasoning`, `metadata`
- ✅ **Ensures type safety** - Guarantees the output matches your TypeScript interface
- ✅ **Validates structure** - Removes unexpected nested objects or arrays
- ✅ **Simplifies integration** - No need to manually validate every field
- ✅ **Works with any LLM** - OpenAI, Anthropic, Cohere, local models, etc.

**Common LLM Hallucination Patterns:**

```typescript
// LLMs often add these types of extra fields:
{
  // Expected fields
  name: "Product",
  price: 100,
  
  // Hallucinated fields (will be removed)
  confidence: 0.95,
  reasoning: "I chose this because...",
  metadata: { generated_by: "gpt-4" },
  _internal: { tokens: 150 },
  source: "ai",
  timestamp: "2024-01-01"
}
```

**Multi-Step LLM Workflow:**

```typescript
// Step 1: Define your data structure
const orderInterface = `
  interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
  }
  
  interface Order {
    orderId: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
  }
`;

// Step 2: Ask LLM to extract order from natural language
const userMessage = "I want to order 2 widgets at $10 each and 1 gadget at $20";
const llmExtraction = await callLLM(
  `Extract order information from this message and return JSON matching this interface: ${orderInterface}\n\nMessage: ${userMessage}`
);

// Step 3: Sanitize LLM output to match interface exactly
const validOrder = await reducer.fromInterface(
  JSON.parse(llmExtraction),
  orderInterface,
  'Order'
);

// Step 4: Safely process the validated order
await processOrder(validOrder);
```

This approach is particularly valuable when:
- Building AI-powered APIs
- Processing structured data from LLM responses
- Ensuring consistent output formats
- Validating AI-generated content before storage
- Creating type-safe LLM integrations

---

## Navigation

**← Previous:** [Installation & Basic Usage](installation.md)  
**→ Next:** [Configuration Options](configuration.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Examples](examples.md) - Real-world usage examples
- [API Reference](api-reference.md) - Complete API documentation
- [Migration Guide](migration-guide.md) - Upgrading guide
- [Testing & Distribution](testing.md) - How the package is tested
