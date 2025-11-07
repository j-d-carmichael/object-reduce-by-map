# Migration Guide

Guide for upgrading to the latest version with optional TypeScript dependency.

## Version 3.1.0 - Optional TypeScript Dependency

### Overview

Version 3.1.0 introduces a major architectural change: TypeScript is now an **optional peer dependency** instead of being bundled. This reduces the bundle size by **99.9%** (from 9.4 MB to ~10 KB).

### Breaking Changes

#### 1. Interface Parsing Methods Are Now Async

All interface parsing methods now return Promises and must be awaited.

**Before (v3.0.x):**

```typescript
const result = reducer.fromInterface(input, interfaceString);
const map = parseInterfaceToMap(interfaceString);
```

**After (v3.1.0):**

```typescript
const result = await reducer.fromInterface(input, interfaceString);
const map = await parseInterfaceToMap(interfaceString);
```

#### 2. TypeScript Must Be Installed for Interface Parsing

If you use the interface parsing feature, you must install TypeScript as a peer dependency.

**Installation:**

```bash
npm install typescript
```

**Note:** If you only use the core map-based reducer, you don't need TypeScript.

### Migration Steps

#### Step 1: Install TypeScript (if using interface parsing)

```bash
npm install typescript
```

#### Step 2: Update Function Calls to Async/Await

Find all uses of interface parsing methods and add `await`:

```typescript
// Update all of these:
reducer.fromInterface(...)          → await reducer.fromInterface(...)
reduceByInterface(...)              → await reduceByInterface(...)
parseInterfaceToMap(...)            → await parseInterfaceToMap(...)
reducer.parseInterface(...)         → await reducer.parseInterface(...)
```

#### Step 3: Update Function Signatures

If you're calling these methods from other functions, make those functions async:

**Before:**

```typescript
function processUser(input: any): any {
  return reducer.fromInterface(input, userInterface);
}
```

**After:**

```typescript
async function processUser(input: any): Promise<any> {
  return await reducer.fromInterface(input, userInterface);
}
```

#### Step 4: Update Tests

If you have tests using interface parsing, make them async:

**Before:**

```typescript
it('should filter user data', () => {
  const result = reducer.fromInterface(input, interfaceString);
  expect(result).toEqual(expected);
});
```

**After:**

```typescript
it('should filter user data', async () => {
  const result = await reducer.fromInterface(input, interfaceString);
  expect(result).toEqual(expected);
});
```

### What's Not Affected

The following continue to work exactly as before:

✅ **Core reducer** - No changes  
✅ **Map-based reduction** - No changes  
✅ **Options** - No changes  
✅ **Type definitions** - Updated but compatible  
✅ **CommonJS/ESM** - No changes

```typescript
// These work exactly the same:
const result = reduceByMap(input, map);
const result = reduceByMap(input, map, options);
```

### Benefits of Upgrading

#### For All Users

- ✅ **99.9% smaller bundle** (~10 KB vs 9.4 MB)
- ✅ **Faster installation**
- ✅ **Smaller node_modules**
- ✅ **Same functionality**

#### For Users Not Using Interface Parsing

- ✅ **No TypeScript dependency** needed
- ✅ **Zero breaking changes**
- ✅ **Immediate benefit** from smaller bundle

#### For Users Using Interface Parsing

- ✅ **Control TypeScript version**
- ✅ **No duplication** if already using TypeScript
- ✅ **Clearer dependencies**
- ✅ **Better error messages**

### Error Handling

#### TypeScript Not Installed

If you try to use interface parsing without TypeScript:

```
Error: TypeScript is required to parse interface strings.
Please install it: npm install typescript
Original error: Cannot find package 'typescript'
```

**Solution:** Install TypeScript:

```bash
npm install typescript
```

### Example Migration

#### Before (v3.0.x)

```typescript
import express from 'express';
import reducer from 'object-reduce-by-map';

const app = express();

app.get('/api/users/:id', (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  const userInterface = `
    interface User {
      id: number;
      name: string;
      email: string;
    }
  `;
  
  // Synchronous call
  const safeUser = reducer.fromInterface(user, userInterface);
  res.json(safeUser);
});
```

#### After (v3.1.0)

```typescript
import express from 'express';
import reducer from 'object-reduce-by-map';

const app = express();

// Make handler async
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  const userInterface = `
    interface User {
      id: number;
      name: string;
      email: string;
    }
  `;
  
  // Now async - add await
  const safeUser = await reducer.fromInterface(user, userInterface);
  res.json(safeUser);
});
```

### TypeScript Type Updates

The type definitions have been updated to reflect the async nature:

**Before:**

```typescript
function reduceByInterface(
  input: any,
  interfaceString: string,
  interfaceName?: string,
  options?: Options
): any;
```

**After:**

```typescript
function reduceByInterface(
  input: any,
  interfaceString: string,
  interfaceName?: string,
  options?: Options
): Promise<any>;
```

If you're using TypeScript, the compiler will help you find places that need updating.

### Performance Considerations

#### First Call

The first interface parsing call will take ~600ms as TypeScript is loaded dynamically:

```typescript
// First call: ~600ms
const result1 = await reducer.fromInterface(input, interface1);

// Subsequent calls: <1ms
const result2 = await reducer.fromInterface(input, interface2);
```

#### Optimization Tip

If you're processing many items, parse the interface once and reuse the map:

**Less Efficient:**

```typescript
for (const item of items) {
  const result = await reducer.fromInterface(item, interfaceString);
  results.push(result);
}
```

**More Efficient:**

```typescript
// Parse once
const map = await parseInterfaceToMap(interfaceString);

// Reuse map (synchronous)
for (const item of items) {
  const result = reduceByMap(item, map);
  results.push(result);
}
```

### Rollback Plan

If you need to rollback to the previous version:

```bash
npm install object-reduce-by-map@3.0.x
```

However, we recommend upgrading and following this migration guide for the significant bundle size benefits.

### Testing Your Migration

1. **Install TypeScript** (if using interface parsing)
2. **Update all interface parsing calls** to use `await`
3. **Make calling functions async**
4. **Run your test suite**
5. **Check for TypeScript compilation errors**
6. **Verify functionality** in development environment

### Getting Help

If you encounter issues during migration:

1. Check this migration guide
2. Review the [API Reference](api-reference.md)
3. See [Examples](examples.md) for updated patterns
4. Open an issue on [GitHub](https://github.com/j-d-carmichael/object-reduce-by-map/issues)

### Checklist

Use this checklist to ensure a smooth migration:

- [ ] Install TypeScript (`npm install typescript`)
- [ ] Find all uses of `reducer.fromInterface`
- [ ] Find all uses of `reduceByInterface`
- [ ] Find all uses of `parseInterfaceToMap`
- [ ] Add `await` to all interface parsing calls
- [ ] Make calling functions `async`
- [ ] Update function return types to `Promise<T>`
- [ ] Update tests to be async
- [ ] Run test suite
- [ ] Test in development environment
- [ ] Deploy to staging
- [ ] Monitor for errors

### Common Pitfalls

#### Forgetting await

```typescript
// ❌ Wrong - returns a Promise
const result = reducer.fromInterface(input, interfaceString);

// ✅ Correct
const result = await reducer.fromInterface(input, interfaceString);
```

#### Not making function async

```typescript
// ❌ Wrong - can't use await in non-async function
function process(input) {
  return await reducer.fromInterface(input, interfaceString);
}

// ✅ Correct
async function process(input) {
  return await reducer.fromInterface(input, interfaceString);
}
```

#### Forgetting to install TypeScript

```typescript
// Will throw error if TypeScript not installed
const result = await reducer.fromInterface(input, interfaceString);
// Error: TypeScript is required to parse interface strings
```

**Solution:** `npm install typescript`

## Next Steps

- Review the [API Reference](api-reference.md)
- Check out [Examples](examples.md) with updated patterns
- Learn about [Configuration Options](configuration.md)
- Read about [TypeScript Interface Parsing](typescript-interfaces.md)
