/**
 * Convert a JSON Schema type to a JavaScript constructor
 * @param {object} schemaProp - JSON Schema property definition
 * @return {Function|object|Array}
 */
function convertJsonSchemaType(schemaProp) {
  if (!schemaProp || typeof schemaProp !== 'object') {
    return Object;
  }

  const type = schemaProp.type;

  switch (type) {
    case 'string':
      return String;
    
    case 'number':
    case 'integer':
      return Number;
    
    case 'boolean':
      return Boolean;
    
    case 'object':
      if (schemaProp.properties) {
        return parseJsonSchemaToMap(schemaProp);
      }
      return Object;
    
    case 'array':
      if (schemaProp.items) {
        return [convertJsonSchemaType(schemaProp.items)];
      }
      return Array;
    
    case 'null':
      return null;
    
    default:
      return Object;
  }
}

/**
 * Parse a JSON Schema object into a map compatible with reduceByMap
 * Note: Schema must be dereferenced (no $ref)
 * @param {object} schema - JSON Schema object (dereferenced)
 * @return {object} - Map object with JavaScript type constructors
 */
export default function parseJsonSchemaToMap(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('jsonSchemaParser: schema must be an object');
  }

  // Check for $ref - not supported
  if (schema.$ref) {
    throw new Error('jsonSchemaParser: $ref is not supported. Schema must be dereferenced before parsing.');
  }

  const map = {};

  // Handle root object type
  if (schema.type === 'object' && schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      // Check for nested $ref
      if (value.$ref) {
        throw new Error(`jsonSchemaParser: $ref found in property "${key}". Schema must be dereferenced before parsing.`);
      }
      map[key] = convertJsonSchemaType(value);
    }
  } else if (schema.type === 'array' && schema.items) {
    // Handle root array type
    return [convertJsonSchemaType(schema.items)];
  } else if (schema.properties) {
    // Handle schema without explicit type but with properties
    for (const [key, value] of Object.entries(schema.properties)) {
      if (value.$ref) {
        throw new Error(`jsonSchemaParser: $ref found in property "${key}". Schema must be dereferenced before parsing.`);
      }
      map[key] = convertJsonSchemaType(value);
    }
  } else {
    throw new Error('jsonSchemaParser: schema must have "properties" or be an array type');
  }

  return map;
}

export { parseJsonSchemaToMap };
