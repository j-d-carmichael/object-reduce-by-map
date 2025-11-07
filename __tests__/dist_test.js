import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

describe('Distribution Files - Build Verification', () => {
  const distDir = resolve(process.cwd(), 'dist');
  
  it('should have built CJS file', async () => {
    const cjsPath = resolve(distDir, 'reducer.cjs');
    expect(existsSync(cjsPath)).toBe(true);
  });

  it('should have built ESM file', async () => {
    const esmPath = resolve(distDir, 'reducer.js');
    expect(existsSync(esmPath)).toBe(true);
  });

  it('should have TypeScript definitions', async () => {
    const dtsPath = resolve(distDir, 'reducer.d.ts');
    expect(existsSync(dtsPath)).toBe(true);
  });
});

describe('Distribution Files - ESM Import', () => {
  let reducer, reduceByInterface, parseInterfaceToMap;

  beforeAll(async () => {
    // Dynamically import the built ESM file
    const distModule = await import('../dist/reducer.js');
    reducer = distModule.default;
    reduceByInterface = distModule.reduceByInterface;
    parseInterfaceToMap = distModule.parseInterfaceToMap;
  });

  it('should export default reducer function', async () => {
    expect(typeof reducer).toBe('function');
  });

  it('should export reduceByInterface function', async () => {
    expect(typeof reduceByInterface).toBe('function');
  });

  it('should export parseInterfaceToMap function', async () => {
    expect(typeof parseInterfaceToMap).toBe('function');
  });

  it('should have fromInterface method on default export', async () => {
    expect(typeof reducer.fromInterface).toBe('function');
  });

  it('should have parseInterface method on default export', async () => {
    expect(typeof reducer.parseInterface).toBe('function');
  });

  it('should work with basic map reduction', async () => {
    const input = { a: 1, b: 2, c: 3 };
    const map = { a: Number, b: Number };
    const result = reducer(input, map);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should work with interface string', async () => {
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
    expect(result).toEqual({
      name: 'John',
      age: 30
    });
  });

  it('should work with reduceByInterface named export', async () => {
    const interfaceString = `
      interface Product {
        id: number;
        name: string;
      }
    `;
    
    const input = {
      id: 1,
      name: 'Widget',
      internalCode: 'XYZ'
    };
    
    const result = await reduceByInterface(input, interfaceString);
    expect(result).toEqual({
      id: 1,
      name: 'Widget'
    });
  });

  it('should work with parseInterfaceToMap', async () => {
    const interfaceString = `
      interface Test {
        name: string;
        count: number;
      }
    `;
    
    const map = await parseInterfaceToMap(interfaceString);
    expect(map).toEqual({
      name: String,
      count: Number
    });
  });

  it('should handle nested interfaces in built version', async () => {
    const interfaceString = `
      interface Address {
        city: string;
        zip: number;
      }
      
      interface User {
        name: string;
        address: Address;
      }
    `;
    
    const input = {
      name: 'Jane',
      address: {
        city: 'Boston',
        zip: 12345,
        internal: 'secret'
      },
      password: 'hidden'
    };
    
    const result = await reducer.fromInterface(input, interfaceString, 'User');
    expect(result).toEqual({
      name: 'Jane',
      address: {
        city: 'Boston',
        zip: 12345
      }
    });
  });

  it('should handle arrays in built version', async () => {
    const interfaceString = `
      interface Item {
        id: number;
        name: string;
      }
      
      interface List {
        items: Item[];
      }
    `;
    
    const input = {
      items: [
        { id: 1, name: 'A', secret: 'x' },
        { id: 2, name: 'B', secret: 'y' }
      ],
      metadata: 'hidden'
    };
    
    const result = await reducer.fromInterface(input, interfaceString, 'List');
    expect(result).toEqual({
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ]
    });
  });

  it('should work with options in built version', async () => {
    const interfaceString = `
      interface User {
        name: string;
        age: number;
      }
    `;
    
    const input = {
      name: 'Bob'
    };
    
    const result = await reducer.fromInterface(input, interfaceString, { keepKeys: true });
    expect(result).toEqual({
      name: 'Bob',
      age: null
    });
  });
});

describe('Distribution Files - CJS Require', () => {
  it('should be importable via CommonJS require', async () => {
    // Use dynamic import to test CJS file
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    const cjsModule = require('../dist/reducer.cjs');
    
    // CJS exports named exports, not default
    expect(typeof cjsModule.reduceByMap).toBe('function');
    expect(typeof cjsModule.reduceByInterface).toBe('function');
    expect(typeof cjsModule.parseInterfaceToMap).toBe('function');
  });

  it('should work with basic reduction via CJS', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    const { reduceByMap } = require('../dist/reducer.cjs');
    
    const input = { a: 1, b: 2, c: 3 };
    const map = { a: Number, b: Number };
    const result = reduceByMap(input, map);
    
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should work with interface parsing via CJS', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    const { reduceByInterface } = require('../dist/reducer.cjs');
    
    const interfaceString = `
      interface User {
        name: string;
        email: string;
      }
    `;
    
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret'
    };
    
    const result = await reduceByInterface(input, interfaceString);
    
    expect(result).toEqual({
      name: 'Alice',
      email: 'alice@example.com'
    });
  });
  
  it('should have fromInterface method on reduceByMap via CJS', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    const { reduceByMap } = require('../dist/reducer.cjs');
    
    expect(typeof reduceByMap.fromInterface).toBe('function');
    expect(typeof reduceByMap.parseInterface).toBe('function');
    
    const interfaceString = `
      interface Test {
        value: string;
      }
    `;
    
    const input = { value: 'test', extra: 'removed' };
    const result = await reduceByMap.fromInterface(input, interfaceString);
    
    expect(result).toEqual({ value: 'test' });
  });
});

describe('Package.json Exports', () => {
  let packageJson;

  beforeAll(async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const packagePath = resolve(process.cwd(), 'package.json');
    packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  });

  it('should have correct main field for CJS', async () => {
    expect(packageJson.main).toBe('./dist/reducer.cjs');
  });

  it('should have correct module field for ESM', async () => {
    expect(packageJson.module).toBe('./dist/reducer.mjs');
  });

  it('should have correct types field', async () => {
    expect(packageJson.types).toBe('./dist/reducer.d.ts');
  });

  it('should have correct exports for require', async () => {
    expect(packageJson.exports.require).toBe('./dist/reducer.cjs');
  });

  it('should have correct exports for import', async () => {
    expect(packageJson.exports.import).toBe('./dist/reducer.mjs');
  });
});
