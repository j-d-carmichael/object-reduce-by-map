import { describe, it, expect } from 'vitest';
import reducer, { reduceByInterface, parseInterfaceToMap, type Options } from '../src/reducer.js';

describe('TypeScript Usage - Type Safety', () => {
  it('should work with default export', async () => {
    const input = { a: 1, b: 2, c: 3 };
    const map = { a: Number, b: Number };
    const result = reducer(input, map);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should work with options parameter', async () => {
    const input = { a: 1 };
    const map = { a: Number, b: Number };
    const options: Options = {
      keepKeys: true,
      allowNullish: false
    };
    const result = reducer(input, map, options);
    expect(result).toEqual({ a: 1, b: null });
  });

  it('should work with fromInterface method', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
      }
    `;
    
    const input = {
      name: 'John',
      age: 30,
      password: 'secret'
    };
    
    const result = await reducer.fromInterface(input, interfaceString);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should work with reduceByInterface named export', async () => {
    const interfaceString = `
      interface Product {
        id: number;
        title: string;
      }
    `;
    
    const input = {
      id: 1,
      title: 'Widget',
      internalCode: 'ABC'
    };
    
    const result = await reduceByInterface(input, interfaceString);
    expect(result).toEqual({ id: 1, title: 'Widget' });
  });

  it('should work with reduceByInterface with interface name', async () => {
    const interfaceString = `
      interface User {
        name: string;
      }
      
      interface Product {
        title: string;
      }
    `;
    
    const input = {
      name: 'Alice',
      extra: 'data'
    };
    
    const result = await reduceByInterface(input, interfaceString, 'User');
    expect(result).toEqual({ name: 'Alice' });
  });

  it('should work with reduceByInterface with options', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
      }
    `;
    
    const input = {
      name: 'Bob'
    };
    
    const options: Options = {
      keepKeys: true
    };
    
    const result = await reduceByInterface(input, interfaceString, options);
    expect(result).toEqual({ name: 'Bob', age: null });
  });

  it('should work with reduceByInterface with interface name and options', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
      }
      
      interface Product {
        title: string;
      }
    `;
    
    const input = {
      name: 'Charlie'
    };
    
    const options: Options = {
      keepKeys: true
    };
    
    const result = await reduceByInterface(input, interfaceString, 'User', options);
    expect(result).toEqual({ name: 'Charlie', age: null });
  });

  it('should work with parseInterfaceToMap', async () => {
    const interfaceString = `
      interface Test {
        name: string;
        count: number;
        active: boolean;
      }
    `;
    
    const map = await parseInterfaceToMap(interfaceString);
    expect(map).toEqual({
      name: String,
      count: Number,
      active: Boolean
    });
  });

  it('should work with parseInterfaceToMap with interface name', async () => {
    const interfaceString = `
      interface User {
        name: string;
      }
      
      interface Product {
        title: string;
      }
    `;
    
    const map = await parseInterfaceToMap(interfaceString, 'Product');
    expect(map).toEqual({
      title: String
    });
  });

  it('should handle complex nested TypeScript interfaces', async () => {
    const interfaceString = `
      interface Location {
        city: string;
        country: string;
      }
      
      interface Company {
        name: string;
        location: Location;
      }
      
      interface Employee {
        name: string;
        company: Company;
      }
    `;
    
    const input = {
      name: 'David',
      company: {
        name: 'TechCorp',
        location: {
          city: 'San Francisco',
          country: 'USA',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        revenue: 1000000
      },
      salary: 100000
    };
    
    const result = await reduceByInterface(input, interfaceString, 'Employee');
    expect(result).toEqual({
      name: 'David',
      company: {
        name: 'TechCorp',
        location: {
          city: 'San Francisco',
          country: 'USA'
        }
      }
    });
  });

  it('should handle arrays with TypeScript interfaces', async () => {
    const interfaceString = `
      interface Tag {
        name: string;
        color: string;
      }
      
      interface Post {
        title: string;
        tags: Tag[];
      }
    `;
    
    const input = {
      title: 'My Post',
      tags: [
        { name: 'tech', color: 'blue', id: 1 },
        { name: 'news', color: 'red', id: 2 }
      ],
      views: 100
    };
    
    const result = await reduceByInterface(input, interfaceString, 'Post');
    expect(result).toEqual({
      title: 'My Post',
      tags: [
        { name: 'tech', color: 'blue' },
        { name: 'news', color: 'red' }
      ]
    });
  });

  it('should handle interface inheritance', async () => {
    const interfaceString = `
      interface Person {
        name: string;
        age: number;
      }
      
      interface Employee extends Person {
        employeeId: string;
      }
    `;
    
    const input = {
      name: 'Eve',
      age: 28,
      employeeId: 'EMP001',
      salary: 75000
    };
    
    const result = await reduceByInterface(input, interfaceString, 'Employee');
    expect(result).toEqual({
      name: 'Eve',
      age: 28,
      employeeId: 'EMP001'
    });
  });

  it('should work with all Options properties', async () => {
    const input = { a: 1 };
    const map = { a: Number, b: Number };
    
    const options: Options = {
      keepKeys: true,
      throwErrorOnAlien: false,
      allowNullish: true,
      allowNullishKeys: true,
      permitEmptyMap: false,
      permitUndefinedMap: false
    };
    
    const result = reducer(input, map, options);
    expect(result).toEqual({ a: 1, b: null });
  });
});

describe('TypeScript Usage - Type Checking', () => {
  it('should accept object as input', async () => {
    const input: object = { a: 1, b: 2 };
    const map: object = { a: Number };
    const result = reducer(input, map);
    expect(result).toBeDefined();
  });

  it('should accept Options type', async () => {
    const options: Options = {
      keepKeys: true
    };
    expect(options.keepKeys).toBe(true);
  });

  it('should allow optional Options properties', async () => {
    const options1: Options = {};
    const options2: Options = { keepKeys: true };
    const options3: Options = { allowNullish: true, keepKeys: false };
    
    expect(options1).toBeDefined();
    expect(options2).toBeDefined();
    expect(options3).toBeDefined();
  });
});
