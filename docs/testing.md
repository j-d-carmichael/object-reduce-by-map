# Testing & Distribution

Documentation on how the package is tested, built, and distributed.

## Test Coverage

The package has comprehensive test coverage with **108 tests** across multiple test suites.

### Test Breakdown

| Test Suite | Tests | Description |
|------------|-------|-------------|
| Core Reducer | 68 | Original functionality tests |
| Interface Parser | 29 | TypeScript interface parsing |
| Distribution | 24 | ESM/CJS build verification |
| TypeScript Usage | 16 | Type safety and TS integration |
| **Total** | **108** | **All passing** ✅ |

### Test Categories

#### Unit Tests (68 tests)

Core reducer functionality:

- ✅ Basic object reduction
- ✅ Nested objects
- ✅ Arrays and array elements
- ✅ Type validation
- ✅ Null and undefined handling
- ✅ Options behavior
- ✅ Error handling
- ✅ Edge cases

**Files:**
- `__tests__/inputReducer_test.js`
- `__tests__/arrays_test.js`
- `__tests__/allowNullishKeys_test.js`
- `__tests__/emptyOrUndefinedMap_test.js`
- `__tests__/throwError_test.js`
- `__tests__/nullPass_test.js`

#### Interface Parser Tests (29 tests)

TypeScript interface parsing features:

- ✅ Basic types (string, number, boolean)
- ✅ Nested objects
- ✅ Arrays (`Type[]` and `Array<Type>`)
- ✅ Multiple interfaces
- ✅ Interface references
- ✅ Forward references
- ✅ Interface inheritance (`extends`)
- ✅ Union types
- ✅ Optional properties
- ✅ Integration with reducer
- ✅ Error handling
- ✅ Edge cases

**File:** `__tests__/interfaceParser_test.js`

#### Distribution Tests (24 tests)

Verify built packages work correctly:

**Build Verification (3 tests)**
- ✅ CJS file exists
- ✅ ESM file exists
- ✅ TypeScript definitions exist

**ESM Import Tests (10 tests)**
- ✅ Default export is a function
- ✅ Named exports work
- ✅ Attached methods exist
- ✅ Basic reduction works
- ✅ Interface parsing works
- ✅ Nested interfaces work
- ✅ Arrays work
- ✅ Options work

**CJS Require Tests (4 tests)**
- ✅ CommonJS require works
- ✅ Basic reduction via CJS
- ✅ Interface parsing via CJS
- ✅ Attached methods via CJS

**Package.json Tests (5 tests)**
- ✅ `main` field correct
- ✅ `module` field correct
- ✅ `types` field correct
- ✅ `exports.require` correct
- ✅ `exports.import` correct

**File:** `__tests__/dist_test.js`

#### TypeScript Usage Tests (16 tests)

Verify TypeScript integration and type safety:

**Type Safety Tests (13 tests)**
- ✅ Default export works
- ✅ Options parameter typing
- ✅ `fromInterface` method
- ✅ `reduceByInterface` named export
- ✅ Interface name parameter
- ✅ Options with interfaces
- ✅ `parseInterfaceToMap`
- ✅ Complex nested interfaces
- ✅ Arrays with interfaces
- ✅ Interface inheritance
- ✅ All Options properties

**Type Checking Tests (3 tests)**
- ✅ Accepts object input
- ✅ Accepts Options type
- ✅ Optional properties work

**File:** `__tests__/typescript-usage_test.ts`

## Build Process

### Build Configuration

The package uses `tsup` for building with the following configuration:

```javascript
// tsup.config.js
export default {
  entry: ['src/reducer.js'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  external: ['typescript'],  // Don't bundle TypeScript
  splitting: false,
  sourcemap: false,
  clean: true,
};
```

### Build Outputs

| File | Format | Size | Description |
|------|--------|------|-------------|
| `dist/reducer.cjs` | CommonJS | ~11 KB | For Node.js require() |
| `dist/reducer.js` | ESM | ~10 KB | For ES imports |
| `dist/reducer.d.ts` | TypeScript | ~2 KB | Type definitions |
| `dist/interfaceParser.d.ts` | TypeScript | ~0.7 KB | Parser types |

### Build Scripts

```json
{
  "scripts": {
    "build": "tsup && npm run build:types",
    "build:types": "cp src/reducer.d.ts dist/reducer.d.ts && cp src/interfaceParser.d.ts dist/interfaceParser.d.ts",
    "test": "vitest run",
    "prepublish": "npm run build:readme:toc && npm run build && npm run test"
  }
}
```

### Build Steps

1. **Clean** - Remove old dist files
2. **Bundle CJS** - Create CommonJS build
3. **Bundle ESM** - Create ES Module build
4. **Copy Types** - Copy TypeScript definitions
5. **Verify** - Run distribution tests

## Bundle Size Optimization

### Before Optimization (v3.0.x)

TypeScript was bundled:

- CJS: 9.44 MB
- ESM: 9.44 MB
- **Total: ~19 MB**

### After Optimization (v3.1.0)

TypeScript is external:

- CJS: 11.59 KB
- ESM: 9.93 KB
- **Total: ~22 KB**

**Reduction: 99.9%** 🎉

### Why So Small?

1. **TypeScript not bundled** - Users install it separately if needed
2. **No dependencies** - Core reducer has zero dependencies
3. **Minimal code** - Focused functionality
4. **Tree-shakeable** - ESM format allows dead code elimination

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suite

```bash
npm test -- interfaceParser_test.js
npm test -- dist_test.js
npm test -- typescript-usage_test.ts
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage

```bash
npm test -- --coverage
```

## Test Framework

Tests use **Vitest** for fast, modern testing:

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*_test.js', '**/*_test.ts'],
    exclude: ['node_modules', 'dist']
  }
});
```

## Continuous Integration

Tests run automatically on:

- ✅ Every commit
- ✅ Pull requests
- ✅ Before publishing
- ✅ Release builds

## Package.json Configuration

### Module Fields

```json
{
  "type": "module",
  "main": "./dist/reducer.cjs",
  "module": "./dist/reducer.js",
  "types": "./dist/reducer.d.ts",
  "exports": {
    "require": "./dist/reducer.cjs",
    "import": "./dist/reducer.js"
  }
}
```

### Dependencies

```json
{
  "peerDependencies": {
    "typescript": ">=5.0.0"
  },
  "peerDependenciesMeta": {
    "typescript": {
      "optional": true
    }
  },
  "devDependencies": {
    "tsup": "^8.4.0",
    "typescript": "^5.8.3",
    "vitest": "^3.1.1"
  }
}
```

**Note:** TypeScript is:
- A **peer dependency** (users install it)
- **Optional** (not required for core functionality)
- A **dev dependency** (for testing)

## Distribution Testing Strategy

### What We Test

1. **File Existence** - Verify all build artifacts exist
2. **Module Exports** - Check ESM and CJS exports work
3. **API Surface** - Ensure all methods are accessible
4. **Functionality** - Test actual usage of built files
5. **Type Definitions** - Verify TypeScript types work
6. **Real-world Usage** - Simulate how users will import

### Why It Matters

Distribution tests catch:

- ❌ Missing files in build
- ❌ Incorrect exports
- ❌ Broken type definitions
- ❌ Module resolution issues
- ❌ CommonJS/ESM incompatibilities

### Example Distribution Test

```javascript
it('should work with interface string', async () => {
  const { default: reducer } = await import('../dist/reducer.js');
  
  const interfaceString = `
    interface User {
      name: string;
      age: number;
    }
  `;
  
  const input = { name: 'John', age: 30, password: 'secret' };
  const result = await reducer.fromInterface(input, interfaceString);
  
  expect(result).toEqual({ name: 'John', age: 30 });
});
```

## Performance Testing

### Benchmarks

```javascript
// Core reducer
console.time('core');
for (let i = 0; i < 10000; i++) {
  reduceByMap(input, map);
}
console.timeEnd('core');
// ~50ms for 10,000 iterations

// Interface parsing (first call)
console.time('interface-first');
await reducer.fromInterface(input, interfaceString);
console.timeEnd('interface-first');
// ~600ms (loads TypeScript)

// Interface parsing (cached)
console.time('interface-cached');
await reducer.fromInterface(input, interfaceString);
console.timeEnd('interface-cached');
// <1ms (TypeScript cached)
```

## Quality Assurance

### Pre-publish Checklist

Before publishing, we verify:

- ✅ All 108 tests pass
- ✅ Build succeeds
- ✅ Type definitions are correct
- ✅ Distribution files work
- ✅ Documentation is updated
- ✅ README TOC is generated
- ✅ Version is bumped
- ✅ Changelog is updated

### Automated Checks

```json
{
  "scripts": {
    "prepublish": "npm run build:readme:toc && npm run build && npm run test"
  }
}
```

This ensures:
1. Documentation is up to date
2. Build is fresh
3. All tests pass

## Test Examples

### Unit Test Example

```javascript
it('should reduce object with nested structure', () => {
  const input = {
    user: {
      name: 'John',
      email: 'john@example.com',
      password: 'secret'
    }
  };
  
  const map = {
    user: {
      name: String,
      email: String
    }
  };
  
  const result = reduceByMap(input, map);
  
  expect(result).toEqual({
    user: {
      name: 'John',
      email: 'john@example.com'
    }
  });
});
```

### Integration Test Example

```javascript
it('should work with interface inheritance', async () => {
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
    name: 'Alice',
    age: 30,
    employeeId: 'E-123',
    salary: 100000
  };
  
  const result = await reduceByInterface(input, interfaceString, 'Employee');
  
  expect(result).toEqual({
    name: 'Alice',
    age: 30,
    employeeId: 'E-123'
  });
});
```

## Contributing Tests

When contributing, please:

1. **Add tests** for new features
2. **Update tests** for changed behavior
3. **Don't remove tests** without good reason
4. **Run full test suite** before submitting
5. **Check coverage** to ensure new code is tested

---

## Navigation

**← Previous:** [Migration Guide](migration-guide.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Installation & Basic Usage](installation.md) - Getting started
- [TypeScript Interface Parsing](typescript-interfaces.md) - Use TS interfaces as schemas
- [Configuration Options](configuration.md) - All available options
- [Examples](examples.md) - Real-world usage examples
- [API Reference](api-reference.md) - Complete API documentation
