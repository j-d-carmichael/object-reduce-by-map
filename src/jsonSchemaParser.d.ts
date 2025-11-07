/**
 * Parse a JSON Schema object into a map compatible with reduceByMap
 * Note: Schema must be dereferenced (no $ref)
 * @param schema - JSON Schema object (dereferenced)
 * @returns Map object with JavaScript type constructors
 */
export default function parseJsonSchemaToMap(schema: object): object;

export { parseJsonSchemaToMap };
