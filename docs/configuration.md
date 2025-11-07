# Configuration Options

All configuration options are optional and can be passed as the third parameter to `reduceByMap` or interface parsing methods.

## Options Interface

```typescript
interface Options {
  keepKeys?: boolean;
  throwErrorOnAlien?: boolean;
  allowNullish?: boolean;
  permitEmptyMap?: boolean;
  permitUndefinedMap?: boolean;
}
```

## keepKeys

**Type:** `boolean`  
**Default:** `false`

When `true`, keeps keys that exist in the input but have `null` or `undefined` values in the map.

### Example

```typescript
const input = { name: 'John', age: 30, email: null };
const map = { name: String, age: Number, email: String };

// Without keepKeys (default)
const result1 = reduceByMap(input, map);
// Output: { name: 'John', age: 30 }

// With keepKeys
const result2 = reduceByMap(input, map, { keepKeys: true });
// Output: { name: 'John', age: 30, email: null }
```

## throwErrorOnAlien

**Type:** `boolean`  
**Default:** `false`

When `true`, throws an error if the input contains keys that are not in the map.

### Example

```typescript
const input = { name: 'John', age: 30, password: 'secret' };
const map = { name: String, age: Number };

// Without throwErrorOnAlien (default)
const result1 = reduceByMap(input, map);
// Output: { name: 'John', age: 30 } - password silently removed

// With throwErrorOnAlien
try {
  const result2 = reduceByMap(input, map, { throwErrorOnAlien: true });
} catch (error) {
  console.error('Unexpected key found:', error.message);
}
```

**Use case:** Strict validation where you want to ensure the input exactly matches the expected schema.

## allowNullish

**Type:** `boolean`  
**Default:** `false`

When `true`, allows `null` and `undefined` values to pass through even if they don't match the map type.

### Example

```typescript
const input = { name: 'John', age: null };
const map = { name: String, age: Number };

// Without allowNullish (default)
const result1 = reduceByMap(input, map);
// Output: { name: 'John' } - age removed because it's null

// With allowNullish
const result2 = reduceByMap(input, map, { allowNullish: true });
// Output: { name: 'John', age: null } - age kept even though it's null
```

**Use case:** APIs that allow nullable fields, optional data.

## permitEmptyMap

**Type:** `boolean`  
**Default:** `false`

When `true`, allows an empty map `{}` to be passed without throwing an error. Returns an empty object.

### Example

```typescript
const input = { name: 'John', age: 30 };
const map = {};

// Without permitEmptyMap (default)
try {
  const result1 = reduceByMap(input, map);
} catch (error) {
  console.error('Empty map not allowed');
}

// With permitEmptyMap
const result2 = reduceByMap(input, map, { permitEmptyMap: true });
// Output: {}
```

**Use case:** Dynamic schemas where an empty map might be valid.

## permitUndefinedMap

**Type:** `boolean`  
**Default:** `false`

When `true`, allows `undefined` to be passed as the map without throwing an error. Returns the input unchanged.

### Example

```typescript
const input = { name: 'John', age: 30 };
const map = undefined;

// Without permitUndefinedMap (default)
try {
  const result1 = reduceByMap(input, map);
} catch (error) {
  console.error('Undefined map not allowed');
}

// With permitUndefinedMap
const result2 = reduceByMap(input, map, { permitUndefinedMap: true });
// Output: { name: 'John', age: 30 } - input returned unchanged
```

**Use case:** Optional filtering where you might not always have a schema.

## Combining Options

You can combine multiple options:

```typescript
const result = reduceByMap(input, map, {
  keepKeys: true,
  allowNullish: true,
  throwErrorOnAlien: false
});
```

## Using Options with Interface Parsing

All options work the same way with TypeScript interface parsing:

```typescript
const interfaceString = `
  interface User {
    name: string;
    email: string;
    age: number;
  }
`;

// With options
const result = await reducer.fromInterface(input, interfaceString, {
  keepKeys: true,
  allowNullish: true
});

// With interface name and options
const result = await reducer.fromInterface(
  input,
  interfaceString,
  'User',
  {
    keepKeys: true,
    allowNullish: true
  }
);
```

## Common Patterns

### Strict Validation

```typescript
const options = {
  throwErrorOnAlien: true,
  allowNullish: false
};
```

Use when you want to ensure the input exactly matches the schema with no extra fields and no null values.

### Lenient Filtering

```typescript
const options = {
  keepKeys: true,
  allowNullish: true
};
```

Use when you want to preserve null values and keep all mapped keys even if they're null.

### API Response Filtering

```typescript
const options = {
  allowNullish: true,
  throwErrorOnAlien: false
};
```

Use when filtering API responses where some fields might be null but you don't want to throw errors on extra fields.

### Optional Schema

```typescript
const options = {
  permitUndefinedMap: true,
  permitEmptyMap: true
};
```

Use when the schema might not always be available or might be empty.

---

## Navigation

**← Previous:** [TypeScript Interface Parsing](typescript-interfaces.md)  
**→ Next:** [Examples](examples.md)  
**↑ Back to:** [Documentation Home](README.md)

### Related Pages
- [Installation & Basic Usage](installation.md) - Getting started
- [API Reference](api-reference.md) - Complete API documentation
- [Migration Guide](migration-guide.md) - Upgrading guide
- [Testing & Distribution](testing.md) - How the package is tested
