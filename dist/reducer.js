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
var reducer_default = reduceByMap;
export {
  reducer_default as default
};
