/**
 * Parse a TypeScript interface string and convert it to a map object
 * @param interfaceString - TypeScript interface(s) as a string
 * @param interfaceName - Optional: specific interface name to extract
 * @return Promise that resolves to the map object compatible with reduceByMap
 */
export default function parseInterfaceToMap(
  interfaceString: string,
  interfaceName?: string
): Promise<object>;

/**
 * Parse TypeScript source code and extract all interfaces
 * @param sourceCode - TypeScript source code as string
 * @returns Map of interface names to their parsed map objects
 */
export function parseTypeScriptSource(sourceCode: string): Map<string, object>;

export { parseInterfaceToMap, parseTypeScriptSource };
