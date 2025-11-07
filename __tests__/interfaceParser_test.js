import { describe, it, expect } from 'vitest';
import parseInterfaceToMap from '../src/interfaceParser.js';
import reducer, { reduceByInterface } from '../src/reducer.js';

describe('TypeScript Interface Parser - Basic Types', () => {
  it('should parse simple interface with primitive types', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
        active: boolean;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      name: String,
      age: Number,
      active: Boolean
    });
  });

  it('should parse interface with optional properties', async () => {
    const interfaceString = `
      interface Product {
        id: number;
        name: string;
        description?: string;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      id: Number,
      name: String,
      description: String
    });
  });

  it('should handle object and any types', async () => {
    const interfaceString = `
      interface Config {
        data: object;
        metadata: any;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      data: Object,
      metadata: Object
    });
  });
});

describe('TypeScript Interface Parser - Nested Objects', () => {
  it('should parse nested object types', async () => {
    const interfaceString = `
      interface User {
        name: string;
        address: {
          street: string;
          city: string;
          zip: number;
        };
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      name: String,
      address: {
        street: String,
        city: String,
        zip: Number
      }
    });
  });

  it('should parse deeply nested objects', async () => {
    const interfaceString = `
      interface Company {
        name: string;
        location: {
          country: string;
          office: {
            building: string;
            floor: number;
          };
        };
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      name: String,
      location: {
        country: String,
        office: {
          building: String,
          floor: Number
        }
      }
    });
  });
});

describe('TypeScript Interface Parser - Arrays', () => {
  it('should parse array types with [] syntax', async () => {
    const interfaceString = `
      interface Data {
        tags: string[];
        scores: number[];
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      tags: [String],
      scores: [Number]
    });
  });

  it('should parse array types with Array<T> syntax', async () => {
    const interfaceString = `
      interface Data {
        items: Array<string>;
        values: Array<number>;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      items: [String],
      values: [Number]
    });
  });

  it('should parse arrays of objects', async () => {
    const interfaceString = `
      interface Team {
        members: Array<{
          name: string;
          role: string;
        }>;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      members: [{
        name: String,
        role: String
      }]
    });
  });
});

describe('TypeScript Interface Parser - Multiple Interfaces', () => {
  it('should parse multiple interfaces and return specific one', async () => {
    const interfaceString = `
      interface Address {
        street: string;
        city: string;
      }
      
      interface User {
        name: string;
        age: number;
      }
    `;
    
    const userResult = await parseInterfaceToMap(interfaceString, 'User');
    const addressResult = await parseInterfaceToMap(interfaceString, 'Address');
    
    expect(userResult).toEqual({
      name: String,
      age: Number
    });
    
    expect(addressResult).toEqual({
      street: String,
      city: String
    });
  });

  it('should return all interfaces when no name specified', async () => {
    const interfaceString = `
      interface User {
        name: string;
      }
      
      interface Product {
        title: string;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      User: {
        name: String
      },
      Product: {
        title: String
      }
    });
  });
});

describe('TypeScript Interface Parser - Interface References', () => {
  it('should resolve interface references', async () => {
    const interfaceString = `
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
    
    const result = await parseInterfaceToMap(interfaceString, 'User');
    
    expect(result).toEqual({
      name: String,
      address: {
        street: String,
        city: String,
        zip: Number
      }
    });
  });

  it('should handle forward references', async () => {
    const interfaceString = `
      interface User {
        name: string;
        company: Company;
      }
      
      interface Company {
        name: string;
        employees: number;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString, 'User');
    
    expect(result).toEqual({
      name: String,
      company: {
        name: String,
        employees: Number
      }
    });
  });

  it('should handle arrays of interface references', async () => {
    const interfaceString = `
      interface Comment {
        text: string;
        author: string;
      }
      
      interface Post {
        title: string;
        comments: Comment[];
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString, 'Post');
    
    expect(result).toEqual({
      title: String,
      comments: [{
        text: String,
        author: String
      }]
    });
  });
});

describe('TypeScript Interface Parser - Interface Inheritance', () => {
  it('should handle interface extension', async () => {
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
    
    const result = await parseInterfaceToMap(interfaceString, 'Employee');
    
    expect(result).toEqual({
      name: String,
      age: Number,
      employeeId: String,
      department: String
    });
  });

  it('should handle multiple interface extension', async () => {
    const interfaceString = `
      interface Named {
        name: string;
      }
      
      interface Aged {
        age: number;
      }
      
      interface Person extends Named, Aged {
        email: string;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString, 'Person');
    
    expect(result).toEqual({
      name: String,
      age: Number,
      email: String
    });
  });
});

describe('TypeScript Interface Parser - Union Types', () => {
  it('should handle union types by taking first non-null type', async () => {
    const interfaceString = `
      interface Data {
        value: string | number;
        optional: string | null;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      value: String,
      optional: String
    });
  });

  it('should handle nullable types', async () => {
    const interfaceString = `
      interface User {
        name: string;
        nickname: string | null | undefined;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      name: String,
      nickname: String
    });
  });
});

describe('Integration with reduceByMap', () => {
  it('should reduce object using interface string', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
        email: string;
      }
    `;
    
    const input = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      password: 'secret123',
      internalId: 'xyz'
    };
    
    const result = await reduceByInterface(input, interfaceString);
    
    expect(result).toEqual({
      name: 'John',
      age: 30,
      email: 'john@example.com'
    });
  });

  it('should work with nested interfaces', async () => {
    const interfaceString = `
      interface Address {
        street: string;
        city: string;
      }
      
      interface User {
        name: string;
        address: Address;
      }
    `;
    
    const input = {
      name: 'Jane',
      address: {
        street: '123 Main St',
        city: 'Boston',
        country: 'USA',
        internalCode: 'XYZ'
      },
      secretData: 'should not appear'
    };
    
    const result = await reduceByInterface(input, interfaceString, 'User');
    
    expect(result).toEqual({
      name: 'Jane',
      address: {
        street: '123 Main St',
        city: 'Boston'
      }
    });
  });

  it('should work with arrays', async () => {
    const interfaceString = `
      interface Product {
        id: number;
        name: string;
        tags: string[];
      }
    `;
    
    const input = {
      id: 1,
      name: 'Widget',
      tags: ['electronics', 'gadget', 'new'],
      internalNotes: 'Do not expose'
    };
    
    const result = await reduceByInterface(input, interfaceString);
    
    expect(result).toEqual({
      id: 1,
      name: 'Widget',
      tags: ['electronics', 'gadget', 'new']
    });
  });

  it('should handle complex real-world example', async () => {
    const interfaceString = `
      interface Location {
        country: string;
        city: string;
        timezone: string;
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
        secondPlaces: number;
        thirdPlaces: number;
        topFives: number;
        topFiveRatio: number;
        mostRecentRank: Rank;
        bestRank: number;
      }
    `;
    
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
    
    const result = await reduceByInterface(input, interfaceString, 'Stats');
    
    expect(result).toEqual({
      starts: 0,
      wins: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
      topFives: 0,
      mostRecentRank: {
        event: {
          locations: [{}]
        }
      }
    });
  });

  it('should work with options parameter', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
      }
    `;
    
    const input = {
      name: 'Bob',
      email: 'bob@example.com'
    };
    
    const result = await reduceByInterface(input, interfaceString, { keepKeys: true });
    
    expect(result).toEqual({
      name: 'Bob',
      age: null
    });
  });

  it('should use fromInterface method', async () => {
    const interfaceString = `
      interface Product {
        id: number;
        name: string;
      }
    `;
    
    const input = {
      id: 1,
      name: 'Test',
      secret: 'hidden'
    };
    
    const result = await reducer.fromInterface(input, interfaceString);
    
    expect(result).toEqual({
      id: 1,
      name: 'Test'
    });
  });
});

describe('Error Handling', () => {
  it('should throw error for non-string input', async () => {
    await expect(parseInterfaceToMap(123)).rejects.toThrow('interfaceString must be a string');
  });

  it('should throw error when no interfaces found', async () => {
    await expect(parseInterfaceToMap('const x = 5;')).rejects.toThrow('No interfaces found');
  });

  it('should throw error when specified interface not found', async () => {
    const interfaceString = `
      interface User {
        name: string;
      }
    `;
    
    await expect(parseInterfaceToMap(interfaceString, 'Product')).rejects.toThrow('Interface "Product" not found');
  });
});

describe('Edge Cases', () => {
  it('should handle empty interface', async () => {
    const interfaceString = `
      interface Empty {}
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({});
  });

  it('should handle interface with comments', async () => {
    const interfaceString = `
      interface User {
        // User's full name
        name: string;
        /* User's age in years */
        age: number;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      name: String,
      age: Number
    });
  });

  it('should handle multiline type definitions', async () => {
    const interfaceString = `
      interface Config {
        value: 
          string;
        data: 
          number;
      }
    `;
    
    const result = await parseInterfaceToMap(interfaceString);
    
    expect(result).toEqual({
      value: String,
      data: Number
    });
  });
});
