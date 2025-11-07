import reducer from '../src/reducer.js';

console.log('=== TypeScript Interface Parser Examples ===\n');

// Example 1: Basic Interface
console.log('1. Basic Interface:');
const basicInterface = `
  interface User {
    name: string;
    email: string;
    age: number;
  }
`;

const basicInput = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  password: 'secret123',
  internalId: 'xyz-internal'
};

const basicResult = reducer.fromInterface(basicInput, basicInterface);
console.log('Input:', basicInput);
console.log('Output:', basicResult);
console.log('✓ Removed: password, internalId\n');

// Example 2: Nested Objects with Interface References
console.log('2. Nested Objects with Interface References:');
const nestedInterface = `
  interface Address {
    street: string;
    city: string;
    zip: number;
  }
  
  interface User {
    name: string;
    address: Address;
  }
`;

const nestedInput = {
  name: 'Jane Smith',
  address: {
    street: '123 Main St',
    city: 'Boston',
    zip: 12345,
    internalCode: 'XYZ',
    coordinates: { lat: 42.3601, lng: -71.0589 }
  },
  secretData: 'should-not-appear'
};

const nestedResult = reducer.fromInterface(nestedInput, nestedInterface, 'User');
console.log('Input:', JSON.stringify(nestedInput, null, 2));
console.log('Output:', JSON.stringify(nestedResult, null, 2));
console.log('✓ Removed: internalCode, coordinates, secretData\n');

// Example 3: Arrays
console.log('3. Arrays:');
const arrayInterface = `
  interface Comment {
    text: string;
    author: string;
  }
  
  interface Post {
    title: string;
    comments: Comment[];
  }
`;

const arrayInput = {
  title: 'My Blog Post',
  comments: [
    { text: 'Great post!', author: 'Alice', ip: '192.168.1.1' },
    { text: 'Thanks!', author: 'Bob', ip: '192.168.1.2' }
  ],
  views: 1000,
  internalMetrics: { clicks: 50 }
};

const arrayResult = reducer.fromInterface(arrayInput, arrayInterface, 'Post');
console.log('Input:', JSON.stringify(arrayInput, null, 2));
console.log('Output:', JSON.stringify(arrayResult, null, 2));
console.log('✓ Removed: ip fields, views, internalMetrics\n');

// Example 4: Interface Inheritance
console.log('4. Interface Inheritance:');
const inheritanceInterface = `
  interface Person {
    name: string;
    age: number;
  }
  
  interface Employee extends Person {
    employeeId: string;
    department: string;
  }
`;

const inheritanceInput = {
  name: 'Bob Johnson',
  age: 35,
  employeeId: 'EMP001',
  department: 'Engineering',
  salary: 100000,
  ssn: '123-45-6789'
};

const inheritanceResult = reducer.fromInterface(inheritanceInput, inheritanceInterface, 'Employee');
console.log('Input:', inheritanceInput);
console.log('Output:', inheritanceResult);
console.log('✓ Removed: salary, ssn\n');

// Example 5: Forward References
console.log('5. Forward References:');
const forwardRefInterface = `
  interface User {
    name: string;
    company: Company;
  }
  
  interface Company {
    name: string;
    employees: number;
  }
`;

const forwardRefInput = {
  name: 'Alice',
  company: {
    name: 'TechCorp',
    employees: 500,
    revenue: 1000000,
    privateKey: 'secret'
  },
  personalData: 'private'
};

const forwardRefResult = reducer.fromInterface(forwardRefInput, forwardRefInterface, 'User');
console.log('Input:', JSON.stringify(forwardRefInput, null, 2));
console.log('Output:', JSON.stringify(forwardRefResult, null, 2));
console.log('✓ Removed: revenue, privateKey, personalData\n');

// Example 6: Real-world API Response Filtering
console.log('6. Real-world API Response Filtering (Express Middleware Use Case):');
const apiInterface = `
  interface Location {
    country: string;
    city: string;
  }
  
  interface Event {
    locations: Location[];
  }
  
  interface Rank {
    event: Event;
    rank: number;
  }
  
  interface Stats {
    starts: number;
    wins: number;
    mostRecentRank: Rank;
  }
`;

const apiInput = {
  INTERNAL_ID: 'xyz-123',
  DATABASE_VERSION: 2,
  starts: 10,
  wins: 3,
  mostRecentRank: {
    event: {
      locations: [
        { country: 'USA', city: 'New York', internalCode: 'NYC001' }
      ],
      INTERNAL_EVENT_ID: 'evt-456'
    },
    rank: 1,
    CALCULATED_SCORE: 95.5
  },
  ADMIN_NOTES: 'Top performer'
};

const apiResult = reducer.fromInterface(apiInput, apiInterface, 'Stats');
console.log('Input:', JSON.stringify(apiInput, null, 2));
console.log('Output:', JSON.stringify(apiResult, null, 2));
console.log('✓ Removed all internal/admin fields - safe for public API response\n');

console.log('=== All Examples Complete ===');
