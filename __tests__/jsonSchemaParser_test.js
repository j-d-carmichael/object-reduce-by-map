import { describe, it, expect } from 'vitest';
import parseJsonSchemaToMap from '../src/jsonSchemaParser.js';
import { reduceByJsonSchema } from '../src/reducer.js';
import reducer from '../src/reducer.js';

describe('JSON Schema Parser', () => {
  describe('parseJsonSchemaToMap', () => {
    it('should parse basic types', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' }
        }
      };

      const map = parseJsonSchemaToMap(schema);

      expect(map).toEqual({
        name: String,
        age: Number,
        active: Boolean
      });
    });

    it('should parse integer as Number', () => {
      const schema = {
        type: 'object',
        properties: {
          count: { type: 'integer' }
        }
      };

      const map = parseJsonSchemaToMap(schema);
      expect(map).toEqual({ count: Number });
    });

    it('should parse nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      };

      const map = parseJsonSchemaToMap(schema);

      expect(map).toEqual({
        user: {
          name: String,
          email: String
        }
      });
    });

    it('should parse arrays with items', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      };

      const map = parseJsonSchemaToMap(schema);

      expect(map).toEqual({
        tags: [String]
      });
    });

    it('should parse array of objects', () => {
      const schema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              }
            }
          }
        }
      };

      const map = parseJsonSchemaToMap(schema);

      expect(map).toEqual({
        users: [{
          name: String,
          age: Number
        }]
      });
    });

    it('should parse schema without explicit type but with properties', () => {
      const schema = {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const map = parseJsonSchemaToMap(schema);

      expect(map).toEqual({
        name: String,
        age: Number
      });
    });

    it('should handle null type', () => {
      const schema = {
        type: 'object',
        properties: {
          value: { type: 'null' }
        }
      };

      const map = parseJsonSchemaToMap(schema);
      expect(map).toEqual({ value: null });
    });

    it('should handle object without properties as Object', () => {
      const schema = {
        type: 'object',
        properties: {
          metadata: { type: 'object' }
        }
      };

      const map = parseJsonSchemaToMap(schema);
      expect(map).toEqual({ metadata: Object });
    });

    it('should handle array without items as Array', () => {
      const schema = {
        type: 'object',
        properties: {
          items: { type: 'array' }
        }
      };

      const map = parseJsonSchemaToMap(schema);
      expect(map).toEqual({ items: Array });
    });

    it('should throw error for $ref', () => {
      const schema = {
        type: 'object',
        properties: {
          user: { $ref: '#/definitions/User' }
        }
      };

      expect(() => parseJsonSchemaToMap(schema)).toThrow(
        'jsonSchemaParser: $ref found in property "user". Schema must be dereferenced before parsing.'
      );
    });

    it('should throw error for root $ref', () => {
      const schema = {
        $ref: '#/definitions/User'
      };

      expect(() => parseJsonSchemaToMap(schema)).toThrow(
        'jsonSchemaParser: $ref is not supported. Schema must be dereferenced before parsing.'
      );
    });

    it('should throw error for invalid schema', () => {
      expect(() => parseJsonSchemaToMap(null)).toThrow(
        'jsonSchemaParser: schema must be an object'
      );
    });

    it('should throw error for schema without properties', () => {
      const schema = {
        type: 'object'
      };

      expect(() => parseJsonSchemaToMap(schema)).toThrow(
        'jsonSchemaParser: schema must have "properties" or be an array type'
      );
    });

    it('should handle root array schema', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      };

      const map = parseJsonSchemaToMap(schema);
      expect(map).toEqual([{ name: String }]);
    });
  });

  describe('reduceByJsonSchema', () => {
    it('should reduce object using JSON Schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      };

      const input = {
        name: 'John',
        email: 'john@example.com',
        password: 'secret',
        internalId: 'xyz'
      };

      const result = reduceByJsonSchema(input, schema);

      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });

    it('should work with nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        }
      };

      const input = {
        user: {
          name: 'Alice',
          age: 30,
          password: 'secret'
        },
        internalId: 'xyz'
      };

      const result = reduceByJsonSchema(input, schema);

      expect(result).toEqual({
        user: {
          name: 'Alice',
          age: 30
        }
      });
    });

    it('should work with arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' }
              }
            }
          }
        }
      };

      const input = {
        items: [
          { id: 1, name: 'Item 1', secret: 'hidden' },
          { id: 2, name: 'Item 2', secret: 'hidden' }
        ]
      };

      const result = reduceByJsonSchema(input, schema);

      expect(result).toEqual({
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      });
    });

    it('should work with options', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const input = {
        name: 'Bob',
        age: null,
        extra: 'field'
      };

      const result = reduceByJsonSchema(input, schema, {
        allowNullishKeys: true
      });

      expect(result).toEqual({
        name: 'Bob',
        age: null
      });
    });
  });

  describe('reducer.fromJsonSchema', () => {
    it('should work as attached method', () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          count: { type: 'integer' }
        }
      };

      const input = {
        title: 'Test',
        count: 42,
        hidden: 'data'
      };

      const result = reducer.fromJsonSchema(input, schema);

      expect(result).toEqual({
        title: 'Test',
        count: 42
      });
    });
  });

  describe('Complex nested schema', () => {
    it('should handle deeply nested structures', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  contacts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        value: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const input = {
        user: {
          profile: {
            name: 'Jane',
            contacts: [
              { type: 'email', value: 'jane@example.com', verified: true },
              { type: 'phone', value: '555-1234', verified: false }
            ],
            internalId: 'xyz'
          },
          password: 'secret'
        }
      };

      const result = reduceByJsonSchema(input, schema);

      expect(result).toEqual({
        user: {
          profile: {
            name: 'Jane',
            contacts: [
              { type: 'email', value: 'jane@example.com' },
              { type: 'phone', value: '555-1234' }
            ]
          }
        }
      });
    });
  });
});
