/**
 * Option object to control this package
 */
export interface Options {
  /**
   * Bool determine to keep the keys missing from the input but present in the map but only with values of null
   */
  keepKeys?: boolean,
  /**
   * Bool if true will throw an error when an alien attribute is found
   */
  throwErrorOnAlien?: boolean,

  /**
   * If true, will pass null or undefined through
   */
  allowNullish?: boolean

  /**
   * If true, will pass null or undefined keys through
   */
  allowNullishKeys?: boolean

  /**
   * If true, will not attempt to reduce the input when the map is an empty object
   */
  permitEmptyMap?: boolean

  /**
   * If true, will not attempt to reduce the input when the map is undefined
   */
  permitUndefinedMap?: boolean
}

/**
 * Reduce an object using a TypeScript interface string as the map
 * @param input - The input array or object
 * @param interfaceString - TypeScript interface(s) as a string
 * @param interfaceName - Optional: specific interface name to use from the string
 * @param options - Options object for the package (same as reduceByMap)
 * @return Promise that resolves to the reduced object/array
 */
export function reduceByInterface(
  input: any,
  interfaceString: string,
  interfaceName?: string,
  options?: Options
): Promise<any>;

/**
 * Reduce an object using a TypeScript interface string as the map (overload with options)
 * @param input - The input array or object
 * @param interfaceString - TypeScript interface(s) as a string
 * @param options - Options object for the package (same as reduceByMap)
 * @return Promise that resolves to the reduced object/array
 */
export function reduceByInterface(
  input: any,
  interfaceString: string,
  options?: Options
): Promise<any>;

/**
 * Parse a TypeScript interface string to a map object
 */
export function parseInterfaceToMap(interfaceString: string, interfaceName?: string): Promise<object>;

/**
 * Parse a JSON Schema object to a map object
 * Note: Schema must be dereferenced (no $ref)
 */
export function parseJsonSchemaToMap(schema: object): object;

/**
 * Reduce an object using a JSON Schema object as the map
 * Note: Schema must be dereferenced (no $ref)
 * @param input - The input array or object
 * @param jsonSchema - JSON Schema object (dereferenced, no $ref)
 * @param options - Options object for the package (same as reduceByMap)
 * @return The reduced object/array
 */
export function reduceByJsonSchema(
  input: any,
  jsonSchema: object,
  options?: Options
): any;

/**
 * Main reducer function with attached methods
 */
interface ReduceByMap {
  (input: object, map: object, options?: Options): object;
  fromInterface: typeof reduceByInterface;
  fromJsonSchema: typeof reduceByJsonSchema;
  parseInterface: typeof parseInterfaceToMap;
  parseJsonSchema: typeof parseJsonSchemaToMap;
}

declare const reduceByMap: ReduceByMap;

export default reduceByMap;
export { reduceByMap }
