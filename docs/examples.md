# Examples

Real-world examples of using `object-reduce-by-map` in various scenarios.

## API Response Filtering

### Express.js Middleware

```typescript
import express from 'express';
import reduceByMap from 'object-reduce-by-map';

const app = express();

// Define public user schema
const publicUserMap = {
  id: Number,
  name: String,
  email: String,
  avatar: String,
  createdAt: Date
};

app.get('/api/users/:id', async (req, res) => {
  // Get user from database (includes sensitive fields)
  const user = await db.users.findById(req.params.id);
  // user = {
  //   id: 1,
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   avatar: 'https://...',
  //   createdAt: new Date(),
  //   password: 'hashed_password',
  //   internalId: 'xyz-123',
  //   permissions: ['admin']
  // }
  
  // Filter to public fields only
  const safeUser = reduceByMap(user, publicUserMap);
  
  res.json(safeUser);
  // Response: {
  //   id: 1,
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   avatar: 'https://...',
  //   createdAt: '2024-01-01T00:00:00.000Z'
  // }
});
```

### Using TypeScript Interfaces

```typescript
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  const publicUserInterface = `
    interface PublicUser {
      id: number;
      name: string;
      email: string;
      avatar: string;
      createdAt: string;
    }
  `;
  
  const safeUser = await reduceByMap.fromInterface(user, publicUserInterface);
  res.json(safeUser);
});
```

## Nested API Responses

```typescript
const blogPostMap = {
  id: Number,
  title: String,
  content: String,
  author: {
    id: Number,
    name: String,
    avatar: String
  },
  comments: [{
    id: Number,
    text: String,
    author: {
      id: Number,
      name: String
    }
  }],
  publishedAt: Date
};

const post = await db.posts.findById(postId);
const safePost = reduceByMap(post, blogPostMap);
```

## GraphQL Resolver

```typescript
import { reduceByInterface } from 'object-reduce-by-map';

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      const user = await db.users.findById(id);
      
      const userInterface = `
        interface User {
          id: number;
          name: string;
          email: string;
          posts: Post[];
        }
        
        interface Post {
          id: number;
          title: string;
          content: string;
        }
      `;
      
      return await reduceByInterface(user, userInterface, 'User');
    }
  }
};
```

## Data Sanitization

### Form Input Validation

```typescript
const userRegistrationMap = {
  username: String,
  email: String,
  password: String,
  age: Number,
  acceptTerms: Boolean
};

app.post('/api/register', (req, res) => {
  // Remove any extra fields from request body
  const sanitizedInput = reduceByMap(req.body, userRegistrationMap, {
    throwErrorOnAlien: true  // Throw error if unexpected fields present
  });
  
  // Now safely process the sanitized input
  const user = await createUser(sanitizedInput);
  res.json({ success: true });
});
```

## Database Projections

### MongoDB-style Projections

```typescript
const userProjection = {
  _id: Object,
  name: String,
  email: String,
  profile: {
    bio: String,
    avatar: String
  }
};

const users = await db.users.find({});
const projectedUsers = users.map(user => 
  reduceByMap(user, userProjection)
);
```

## Multi-tenant Data Filtering

```typescript
const tenantSchemas = {
  basic: {
    id: Number,
    name: String,
    email: String
  },
  premium: {
    id: Number,
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      country: String
    }
  },
  enterprise: {
    id: Number,
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      country: String,
      postalCode: String
    },
    company: {
      name: String,
      taxId: String
    }
  }
};

app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  const tenant = await getTenantType(req.user.tenantId);
  
  const schema = tenantSchemas[tenant];
  const filteredUser = reduceByMap(user, schema);
  
  res.json(filteredUser);
});
```

## Webhook Payload Filtering

```typescript
const webhookPayloadMap = {
  event: String,
  timestamp: Date,
  data: {
    orderId: String,
    status: String,
    total: Number,
    customer: {
      id: String,
      email: String
    }
  }
};

app.post('/webhooks/orders', (req, res) => {
  // Filter webhook payload to expected structure
  const payload = reduceByMap(req.body, webhookPayloadMap, {
    throwErrorOnAlien: true
  });
  
  await processWebhook(payload);
  res.json({ received: true });
});
```

## Dynamic Schema Selection

```typescript
const schemas = {
  user: `
    interface User {
      id: number;
      name: string;
      email: string;
    }
  `,
  product: `
    interface Product {
      id: number;
      title: string;
      price: number;
      description: string;
    }
  `,
  order: `
    interface Order {
      id: number;
      userId: number;
      items: OrderItem[];
      total: number;
    }
    
    interface OrderItem {
      productId: number;
      quantity: number;
      price: number;
    }
  `
};

app.get('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  
  const data = await db[resource].findById(id);
  const schema = schemas[resource];
  
  if (schema) {
    const filtered = await reduceByMap.fromInterface(data, schema);
    res.json(filtered);
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
});
```

## Batch Processing

```typescript
const productMap = {
  id: Number,
  name: String,
  price: Number,
  category: String
};

// Process large dataset
const products = await db.products.find({});
const publicProducts = products.map(product => 
  reduceByMap(product, productMap)
);

// Or with interface parsing
const productInterface = `
  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
  }
`;

const publicProducts = await Promise.all(
  products.map(product => 
    reduceByMap.fromInterface(product, productInterface)
  )
);
```

## Error Handling

```typescript
app.post('/api/users', async (req, res) => {
  try {
    const userMap = {
      name: String,
      email: String,
      age: Number
    };
    
    const sanitized = reduceByMap(req.body, userMap, {
      throwErrorOnAlien: true
    });
    
    const user = await createUser(sanitized);
    res.json(user);
  } catch (error) {
    if (error.message.includes('Alien key')) {
      res.status(400).json({ 
        error: 'Invalid fields in request',
        message: error.message 
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

## Testing Helpers

```typescript
import { describe, it, expect } from 'vitest';
import reduceByMap from 'object-reduce-by-map';

describe('API Response', () => {
  it('should not leak sensitive data', () => {
    const dbUser = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      password: 'hashed',
      internalId: 'xyz'
    };
    
    const publicMap = {
      id: Number,
      name: String,
      email: String
    };
    
    const result = reduceByMap(dbUser, publicMap);
    
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('internalId');
    expect(result).toEqual({
      id: 1,
      name: 'John',
      email: 'john@example.com'
    });
  });
});
```

## Real-World: E-commerce API

```typescript
const productInterface = `
  interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  interface Image {
    url: string;
    alt: string;
  }
  
  interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    salePrice: number;
    images: Image[];
    category: Category;
    inStock: boolean;
    rating: number;
  }
`;

app.get('/api/products/:id', async (req, res) => {
  const product = await db.products.findById(req.params.id);
  // product includes: cost, supplierId, internalNotes, etc.
  
  const publicProduct = await reduceByMap.fromInterface(
    product,
    productInterface,
    'Product'
  );
  
  res.json(publicProduct);
});
```

## More Examples

For the most up-to-date examples, check the [test files](https://github.com/j-d-carmichael/object-reduce-by-map/tree/master/__tests__) in the repository.

---

## Navigation

**← Previous:** [Configuration Options](configuration.md)  
**→ Next:** [API Reference](api-reference.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Installation & Basic Usage](installation.md) - Getting started
- [TypeScript Interface Parsing](typescript-interfaces.md) - Use TS interfaces as schemas
- [Migration Guide](migration-guide.md) - Upgrading guide
- [Testing & Distribution](testing.md) - How the package is tested
