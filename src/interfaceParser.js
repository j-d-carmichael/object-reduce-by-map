/**
 * Lazy-loaded TypeScript module
 * @type {typeof import('typescript') | null}
 */
let ts = null;

/**
 * Dynamically imports TypeScript if not already loaded
 * @returns {Promise<typeof import('typescript')>}
 */
const loadTypeScript = async () => {
  if (ts) {
    return ts;
  }
  
  try {
    const tsModule = await import('typescript');
    ts = tsModule.default || tsModule;
    return ts;
  } catch (error) {
    throw new Error(
      'TypeScript is required to parse interface strings. ' +
      'Please install it: npm install typescript\n' +
      'Original error: ' + error.message
    );
  }
};

/**
 * Maps TypeScript type kinds to JavaScript constructors
 * @param {ts.TypeNode} typeNode - The TypeScript type node
 * @param {ts.SourceFile} sourceFile - The source file for reference resolution
 * @param {Map<string, object>} interfaceMap - Map of interface names to their parsed objects
 * @param {Function} parseInterfaceRecursive - Function to recursively parse referenced interfaces
 * @return {*}
 */
const mapTypeNodeToConstructor = (typeNode, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  if (!typeNode) {
    return Object;
  }

  // Handle array types: Type[] or Array<Type>
  if (ts && ts.isArrayTypeNode(typeNode)) {
    const elementType = mapTypeNodeToConstructor(typeNode.elementType, sourceFile, interfaceMap, parseInterfaceRecursive);
    return [elementType];
  }

  // Handle type references (could be Array<T>, custom interfaces, etc.)
  if (ts && ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName.getText(sourceFile);
    
    // Handle Array<Type> syntax
    if (typeName === 'Array' && typeNode.typeArguments && typeNode.typeArguments.length > 0) {
      const elementType = mapTypeNodeToConstructor(typeNode.typeArguments[0], sourceFile, interfaceMap, parseInterfaceRecursive);
      return [elementType];
    }
    
    // Check if it's a reference to a known interface
    if (interfaceMap && interfaceMap.has(typeName) && parseInterfaceRecursive) {
      const referencedInterface = parseInterfaceRecursive(typeName);
      if (referencedInterface && Object.keys(referencedInterface).length > 0) {
        return referencedInterface;
      }
    }
    
    // For other type references, return Object
    return Object;
  }

  // Handle union types - take the first non-null/undefined type
  if (ts && ts.isUnionTypeNode(typeNode)) {
    for (const type of typeNode.types) {
      if (ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NullKeyword) {
        continue;
      }
      if (type.kind === ts.SyntaxKind.UndefinedKeyword) {
        continue;
      }
      return mapTypeNodeToConstructor(type, sourceFile, interfaceMap, parseInterfaceRecursive);
    }
    return Object;
  }

  // Handle intersection types - merge objects (simplified: return Object)
  if (ts && ts.isIntersectionTypeNode(typeNode)) {
    return Object;
  }

  // Handle type literals (inline object types)
  if (ts && ts.isTypeLiteralNode(typeNode)) {
    return parseTypeLiteral(typeNode, sourceFile, interfaceMap, parseInterfaceRecursive);
  }

  // Handle primitive types
  if (!ts) return Object;
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return String;
    case ts.SyntaxKind.NumberKeyword:
      return Number;
    case ts.SyntaxKind.BooleanKeyword:
      return Boolean;
    case ts.SyntaxKind.ObjectKeyword:
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
      return Object;
    case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
      return null;
    default:
      return Object;
  }
};

/**
 * Parse a type literal node (inline object type)
 * @param {ts.TypeLiteralNode} typeLiteral
 * @param {ts.SourceFile} sourceFile
 * @param {Map<string, object>} interfaceMap - Map of interface names to their parsed objects
 * @param {Function} parseInterfaceRecursive - Function to recursively parse referenced interfaces
 * @return {object}
 */
const parseTypeLiteral = (typeLiteral, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  const result = {};
  
  for (const member of typeLiteral.members) {
    if (ts && ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText(sourceFile);
      const propertyType = member.type;
      result[propertyName] = mapTypeNodeToConstructor(propertyType, sourceFile, interfaceMap, parseInterfaceRecursive);
    }
    
    if (ts && ts.isIndexSignatureDeclaration(member)) {
      // Handle index signatures like [key: string]: Type
      // For now, return Object as we can't represent this in the map format
      return Object;
    }
  }
  
  return result;
};

/**
 * Parse an interface declaration into a map object
 * @param {ts.InterfaceDeclaration} interfaceDecl
 * @param {ts.SourceFile} sourceFile
 * @param {Map<string, object>} interfaceMap - Map of interface names to their parsed objects
 * @param {Function} parseInterfaceRecursive - Function to recursively parse referenced interfaces
 * @return {object}
 */
const parseInterface = (interfaceDecl, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  const result = {};
  
  // Handle heritage clauses (extends)
  if (interfaceDecl.heritageClauses) {
    for (const heritage of interfaceDecl.heritageClauses) {
      for (const type of heritage.types) {
        const baseInterfaceName = type.expression.getText(sourceFile);
        const baseInterface = parseInterfaceRecursive(baseInterfaceName);
        if (baseInterface) {
          Object.assign(result, baseInterface);
        }
      }
    }
  }
  
  // Parse members
  for (const member of interfaceDecl.members) {
    if (ts && ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText(sourceFile);
      const propertyType = member.type;
      
      result[propertyName] = mapTypeNodeToConstructor(propertyType, sourceFile, interfaceMap, parseInterfaceRecursive);
    }
    
    if (ts && ts.isIndexSignatureDeclaration(member)) {
      // Handle index signatures - return Object for dynamic keys
      return Object;
    }
  }
  
  return result;
};

/**
 * Parse TypeScript source code and extract all interfaces
 * @param {string} sourceCode - TypeScript source code as string
 * @param {typeof import('typescript')} typescript - TypeScript module instance
 * @return {Map<string, object>} Map of interface names to their parsed map objects
 */
const parseTypeScriptSource = (sourceCode, typescript) => {
  const sourceFile = typescript.createSourceFile(
    'temp.ts',
    sourceCode,
    typescript.ScriptTarget.Latest,
    true
  );
  
  const interfaceMap = new Map();
  const interfaceNodes = new Map();
  
  // First pass: collect all interface nodes
  const visit = (node) => {
    if (typescript.isInterfaceDeclaration(node) && node.name) {
      const interfaceName = node.name.getText(sourceFile);
      interfaceNodes.set(interfaceName, node);
      interfaceMap.set(interfaceName, null); // Placeholder
    }
    typescript.forEachChild(node, visit);
  };
  
  visit(sourceFile);
  
  // Recursive function to parse interfaces with forward reference support
  const parseInterfaceRecursive = (interfaceName) => {
    // If already parsed, return it
    if (interfaceMap.get(interfaceName) !== null) {
      return interfaceMap.get(interfaceName);
    }
    
    const node = interfaceNodes.get(interfaceName);
    if (!node) {
      return null;
    }
    
    // Set to empty object to prevent infinite recursion
    interfaceMap.set(interfaceName, {});
    
    // Parse the interface
    const parsed = parseInterface(node, sourceFile, interfaceMap, parseInterfaceRecursive);
    interfaceMap.set(interfaceName, parsed);
    
    return parsed;
  };
  
  // Parse all interfaces
  for (const interfaceName of interfaceNodes.keys()) {
    parseInterfaceRecursive(interfaceName);
  }
  
  return interfaceMap;
};

/**
 * Parse a TypeScript interface string and convert it to a map object
 * @param {string} interfaceString - TypeScript interface(s) as a string
 * @param {string} [interfaceName] - Optional: specific interface name to extract
 * @return {Promise<object>} The map object compatible with reduceByMap
 */
const parseInterfaceToMap = async (interfaceString, interfaceName) => {
  if (typeof interfaceString !== 'string') {
    throw new Error('interfaceString must be a string');
  }
  
  const typescript = await loadTypeScript();
  const interfaceMap = parseTypeScriptSource(interfaceString, typescript);
  
  if (interfaceMap.size === 0) {
    throw new Error('No interfaces found in the provided string');
  }
  
  // If interface name is specified, return that specific interface
  if (interfaceName) {
    const result = interfaceMap.get(interfaceName);
    if (!result) {
      throw new Error(`Interface "${interfaceName}" not found. Available interfaces: ${Array.from(interfaceMap.keys()).join(', ')}`);
    }
    return result;
  }
  
  // If only one interface, return it
  if (interfaceMap.size === 1) {
    return Array.from(interfaceMap.values())[0];
  }
  
  // If multiple interfaces and no name specified, return all as an object
  const result = {};
  for (const [name, map] of interfaceMap.entries()) {
    result[name] = map;
  }
  return result;
};

export default parseInterfaceToMap;
export { parseInterfaceToMap, parseTypeScriptSource };
