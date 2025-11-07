import reducer from '../src/reducer.js';

// Example 1: Basic JSON Schema usage
console.log('=== Example 1: Basic JSON Schema ===');

const basicSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  }
};

const userInput = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  password: 'secret123',      // Will be removed
  internalId: 'xyz-internal'  // Will be removed
};

const result1 = reducer.fromJsonSchema(userInput, basicSchema);
console.log('Input:', userInput);
console.log('Result:', result1);
// Output: { name: 'John Doe', email: 'john@example.com', age: 30 }

// Example 2: Nested objects
console.log('\n=== Example 2: Nested Objects ===');

const nestedSchema = {
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

const nestedInput = {
  user: {
    name: 'Jane Smith',
    profile: {
      bio: 'Software developer',
      avatar: 'https://example.com/avatar.jpg',
      internalRating: 5  // Will be removed
    },
    password: 'secret'  // Will be removed
  },
  adminFlag: true  // Will be removed
};

const result2 = reducer.fromJsonSchema(nestedInput, nestedSchema);
console.log('Result:', JSON.stringify(result2, null, 2));

// Example 3: Arrays
console.log('\n=== Example 3: Arrays ===');

const arraySchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          price: { type: 'number' }
        }
      }
    }
  }
};

const arrayInput = {
  items: [
    { id: 1, name: 'Widget', price: 9.99, cost: 5.00 },
    { id: 2, name: 'Gadget', price: 19.99, cost: 10.00 }
  ]
};

const result3 = reducer.fromJsonSchema(arrayInput, arraySchema);
console.log('Result:', JSON.stringify(result3, null, 2));

// Example 4: LLM Output Sanitization
console.log('\n=== Example 4: LLM Output Sanitization ===');

const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' }
  }
};

// Simulated LLM output with hallucinated fields
const llmOutput = {
  id: 'prod-123',
  name: 'Smart Widget',
  description: 'An intelligent widget',
  price: 29.99,
  category: 'Electronics',
  confidence: 0.95,              // ❌ Hallucinated
  reasoning: 'Based on...',      // ❌ Hallucinated
  metadata: { source: 'ai' },    // ❌ Hallucinated
  _internal: { tokens: 150 }     // ❌ Hallucinated
};

const cleanOutput = reducer.fromJsonSchema(llmOutput, productSchema);
console.log('LLM Output (with hallucinations):', llmOutput);
console.log('Clean Output:', cleanOutput);

// Example 5: Using parseJsonSchema separately
console.log('\n=== Example 5: Parse Schema to Map ===');

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    count: { type: 'integer' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

const map = reducer.parseJsonSchema(schema);
console.log('Generated map:', map);
// Output: { title: String, count: Number, tags: [String] }

// Now use the map with regular reducer
const input = {
  title: 'Example',
  count: 42,
  tags: ['javascript', 'nodejs'],
  hidden: 'data'
};

const result5 = reducer(input, map);
console.log('Result:', result5);
