// src/interfaceParser.js
var ts = null;
var loadTypeScript = async () => {
  if (ts) {
    return ts;
  }
  try {
    const tsModule = await import("typescript");
    ts = tsModule.default || tsModule;
    return ts;
  } catch (error) {
    throw new Error(
      "TypeScript is required to parse interface strings. Please install it: npm install typescript\nOriginal error: " + error.message
    );
  }
};
var mapTypeNodeToConstructor = (typeNode, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  if (!typeNode) {
    return Object;
  }
  if (ts && ts.isArrayTypeNode(typeNode)) {
    const elementType = mapTypeNodeToConstructor(typeNode.elementType, sourceFile, interfaceMap, parseInterfaceRecursive);
    return [elementType];
  }
  if (ts && ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName.getText(sourceFile);
    if (typeName === "Array" && typeNode.typeArguments && typeNode.typeArguments.length > 0) {
      const elementType = mapTypeNodeToConstructor(typeNode.typeArguments[0], sourceFile, interfaceMap, parseInterfaceRecursive);
      return [elementType];
    }
    if (interfaceMap && interfaceMap.has(typeName) && parseInterfaceRecursive) {
      const referencedInterface = parseInterfaceRecursive(typeName);
      if (referencedInterface && Object.keys(referencedInterface).length > 0) {
        return referencedInterface;
      }
    }
    return Object;
  }
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
  if (ts && ts.isIntersectionTypeNode(typeNode)) {
    return Object;
  }
  if (ts && ts.isTypeLiteralNode(typeNode)) {
    return parseTypeLiteral(typeNode, sourceFile, interfaceMap, parseInterfaceRecursive);
  }
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
var parseTypeLiteral = (typeLiteral, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  const result = {};
  for (const member of typeLiteral.members) {
    if (ts && ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText(sourceFile);
      const propertyType = member.type;
      result[propertyName] = mapTypeNodeToConstructor(propertyType, sourceFile, interfaceMap, parseInterfaceRecursive);
    }
    if (ts && ts.isIndexSignatureDeclaration(member)) {
      return Object;
    }
  }
  return result;
};
var parseInterface = (interfaceDecl, sourceFile, interfaceMap, parseInterfaceRecursive) => {
  const result = {};
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
  for (const member of interfaceDecl.members) {
    if (ts && ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText(sourceFile);
      const propertyType = member.type;
      result[propertyName] = mapTypeNodeToConstructor(propertyType, sourceFile, interfaceMap, parseInterfaceRecursive);
    }
    if (ts && ts.isIndexSignatureDeclaration(member)) {
      return Object;
    }
  }
  return result;
};
var parseTypeScriptSource = (sourceCode, typescript) => {
  const sourceFile = typescript.createSourceFile(
    "temp.ts",
    sourceCode,
    typescript.ScriptTarget.Latest,
    true
  );
  const interfaceMap = /* @__PURE__ */ new Map();
  const interfaceNodes = /* @__PURE__ */ new Map();
  const visit = (node) => {
    if (typescript.isInterfaceDeclaration(node) && node.name) {
      const interfaceName = node.name.getText(sourceFile);
      interfaceNodes.set(interfaceName, node);
      interfaceMap.set(interfaceName, null);
    }
    typescript.forEachChild(node, visit);
  };
  visit(sourceFile);
  const parseInterfaceRecursive = (interfaceName) => {
    if (interfaceMap.get(interfaceName) !== null) {
      return interfaceMap.get(interfaceName);
    }
    const node = interfaceNodes.get(interfaceName);
    if (!node) {
      return null;
    }
    interfaceMap.set(interfaceName, {});
    const parsed = parseInterface(node, sourceFile, interfaceMap, parseInterfaceRecursive);
    interfaceMap.set(interfaceName, parsed);
    return parsed;
  };
  for (const interfaceName of interfaceNodes.keys()) {
    parseInterfaceRecursive(interfaceName);
  }
  return interfaceMap;
};
var parseInterfaceToMap = async (interfaceString, interfaceName) => {
  if (typeof interfaceString !== "string") {
    throw new Error("interfaceString must be a string");
  }
  const typescript = await loadTypeScript();
  const interfaceMap = parseTypeScriptSource(interfaceString, typescript);
  if (interfaceMap.size === 0) {
    throw new Error("No interfaces found in the provided string");
  }
  if (interfaceName) {
    const result2 = interfaceMap.get(interfaceName);
    if (!result2) {
      throw new Error(`Interface "${interfaceName}" not found. Available interfaces: ${Array.from(interfaceMap.keys()).join(", ")}`);
    }
    return result2;
  }
  if (interfaceMap.size === 1) {
    return Array.from(interfaceMap.values())[0];
  }
  const result = {};
  for (const [name, map] of interfaceMap.entries()) {
    result[name] = map;
  }
  return result;
};
var interfaceParser_default = parseInterfaceToMap;

// src/reducer.js
var savedOpts;
var getType = (a) => {
  if (typeof a === "function") {
    if (a === Object || a === "Object") {
      return "object";
    } else if (a === Array || a === "Array") {
      return "array";
    } else if (a === String || a === "String") {
      return "string";
    } else if (a === Number || a === "Number") {
      return "number";
    } else if (a === Boolean || a === "Boolean") {
      return "boolean";
    }
  }
  if (a === null) {
    return "null";
  } else if (Array.isArray(a)) {
    return "array";
  } else if (typeof a === "object") {
    return "object";
  }
  return typeof a;
};
var innerCompare = (input, mapItem, inputMaster, key) => {
  const keyExistsInMap = typeof mapItem !== "undefined";
  if (Array.isArray(input)) {
    if (getType(mapItem) === "array" && typeof mapItem !== "function") {
      reducerWalk(input, mapItem, inputMaster);
    }
  } else if (String(input) === "[object Object]") {
    if (getType(mapItem) === "object" && typeof mapItem !== "function") {
      reducer(input, mapItem);
    }
  }
  if (!keyExistsInMap) {
    if (savedOpts.throwErrorOnAlien) {
      throw new Error("Alien entry found in object");
    }
    delete inputMaster[key];
  } else if (input == null) {
    if (!savedOpts.allowNullishKeys) {
      inputMaster[key] = void 0;
      delete inputMaster[key];
    }
  } else if (getType(mapItem) !== getType(input)) {
    if (savedOpts.keepKeys) {
      inputMaster[key] = null;
    } else {
      delete inputMaster[key];
    }
  }
};
var reducerWalk = (input, map, inputMaster) => {
  for (let i = 0; i < input.length; ++i) {
    innerCompare(input[i], map[0], i, inputMaster);
  }
};
var reducer = (input, map, options) => {
  savedOpts = options || savedOpts || {};
  Object.keys(input).forEach(function(key) {
    innerCompare(input[key], map[key], input, key);
  });
  return input;
};
var injectMissingKeys = (input, map) => {
  Object.keys(map).forEach(function(key) {
    const mapType = getType(map[key]);
    if (typeof input[key] === "undefined") {
      switch (mapType) {
        case "object":
          if (Object.keys(map[key]).length > 0) {
            input[key] = {};
            break;
          }
        case "array":
          if (map[key].length > 0) {
            input[key] = {};
            break;
          }
        default:
          input[key] = null;
      }
    }
    if (["object", "array"].indexOf(mapType) !== -1) {
      injectMissingKeys(input[key], map[key]);
    }
  });
  return input;
};
var reduceByMap = (input, map, options = {}) => {
  if (typeof input === "undefined" || input === null) {
    if (options.allowNullish) {
      return input;
    }
    throw new Error(`object-reduce-by-map: array or object expected, received type '${input}'. Override with option allowNullish`);
  }
  if (options.permitUndefinedMap && typeof map === "undefined") {
    return input;
  }
  if (getType(input) === "array" && getType(map) === "array") {
    if (input.length === 0 && !options.keepKeys) {
      return input;
    }
    input.forEach((item, index) => {
      if (index > 0) {
        map.push(map[0]);
      }
    });
  }
  if (options.permitEmptyMap && !Object.keys(map).length) {
    return input;
  }
  input = reducer(JSON.parse(JSON.stringify(input)), map, options);
  if (savedOpts.keepKeys) {
    input = injectMissingKeys(input, map);
  }
  return input;
};
var reduceByInterface = async (input, interfaceString, interfaceName, options) => {
  if (typeof interfaceName === "object" && !Array.isArray(interfaceName)) {
    options = interfaceName;
    interfaceName = void 0;
  }
  const map = await interfaceParser_default(interfaceString, interfaceName);
  return reduceByMap(input, map, options);
};
reduceByMap.fromInterface = reduceByInterface;
reduceByMap.parseInterface = interfaceParser_default;
var reducer_default = reduceByMap;
export {
  reducer_default as default,
  interfaceParser_default as parseInterfaceToMap,
  reduceByInterface,
  reduceByMap
};
