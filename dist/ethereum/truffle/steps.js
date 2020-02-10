"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tap = tap;
exports.requestsBanner = requestsBanner;
exports.requestsSucceed = requestsSucceed;
exports.migrationsBanner = migrationsBanner;
exports.migrationsSucceed = migrationsSucceed;
exports.fail = fail;
exports.readFile = readFile;
exports.loadSchema = loadSchema;
exports.compile = compile;
exports.execute = execute;
exports.pack = pack;
exports.intoProtoBuf = intoProtoBuf;
exports.intoSol = intoSol;
exports.writeSol = writeSol;
exports.writeMigrations = writeMigrations;
exports.readSolidityArgs = readSolidityArgs;
exports.readMigrationArgs = readMigrationArgs;
exports.mockSolidityArgs = mockSolidityArgs;
exports.matchAll = matchAll;

var Addresses = _interopRequireWildcard(require("../addresses"));

var Witnet = _interopRequireWildcard(require("../../.."));

var Babel = _interopRequireWildcard(require("@babel/core/lib/transform"));

var _protocolBuffers = _interopRequireDefault(require("protocol-buffers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * THESE ARE THE DIFFERENT STEPS THAT CAN BE USED IN THE COMPILER SCRIPT.
 */
function tap(x) {
  console.log(x);
  return x;
}

function requestsBanner() {
  console.log("\nCompiling your Witnet requests...\n=================================");
}

function requestsSucceed() {
  console.log("\n> All requests compiled successfully\n");
}

function migrationsBanner() {
  console.log("\nGenerating automatic migrations for your contracts...\n=====================================================");
}

function migrationsSucceed() {
  console.log("\n> All migrations written successfully \x1B[33m(please remember to manually customize them if necessary)\x1B[0m.\n");
}

function fail(error) {
  console.error("\n! \x1B[31mWITNET REQUESTS COMPILATION ERRORS:\x1B[0m\n  - ".concat(error.message));
  process.exitCode = 1;
  throw error;
}

function readFile(path, fs) {
  return fs.readFileSync(path, "utf8");
}

function loadSchema(schemaDir, schemaName, fs) {
  return (0, _protocolBuffers["default"])(readFile("".concat(schemaDir).concat(schemaName, ".proto"), fs));
}

function compile(code) {
  return Babel.transformSync(code, {
    "plugins": [["@babel/plugin-transform-modules-commonjs", {
      "allowTopLevelThis": true
    }]]
  }).code;
}

function execute(code, requestName, dirName, vm) {
  var context = vm.createContext({
    module: {},
    exports: {},
    require: function (_require) {
      function require(_x) {
        return _require.apply(this, arguments);
      }

      require.toString = function () {
        return _require.toString();
      };

      return require;
    }(function (depName) {
      if (["witnet-requests", "witnet-request", "witnet"].indexOf(depName) >= 0) {
        return Witnet;
      } else {
        return require(depName);
      }
    })
  });

  try {
    var request = vm.runInContext(code, context, __dirname);
    console.log("  - The result type of the request is \x1B[36m".concat(Witnet.Types.typeFormat(request.dataPointType), "\x1B[0m"));
    return request;
  } catch (e) {
    var error = e;

    if (e.message.includes("is not a export function")) {
      error = Error("\x1B[1m".concat(requestName, " has one of these issues:\x1B[0m\n    1: \x1B[1mIt is missing the `export` statement\x1B[0m\n       Adding this line at the end of ").concat(requestName, " may help (please replace `request` by the name of your request object):\n      \n         export {request as default}\n\n    2: \x1B[1mThe exported object is not an instance of the `Request` class\x1B[0m\n       Please double-check that ").concat(requestName, " contains an instance of the `Request` class and it is exported as explained in issue 1.\n       New instances of the `Request` class are created like this:\n\n         const request = new Request()\n         \n       The Witnet documentation contains a complete tutorial on how to create requests from scratch:\n       https://witnet.github.io/documentation/try/my-first-data-request/#write-your-first-witnet-request\n    \n    (Node.js error was: ").concat(e, ")"));
    } else if (e.message.includes("is not defined")) {
      var missing = e.message.match(/(.*) is not defined/)[1];

      if (Witnet.hasOwnProperty(missing)) {
        error = Error("\x1B[1m".concat(requestName, " is missing an import for the `").concat(missing, "` module\x1B[0m\n    Adding this line at the beginning of ").concat(requestName, " may help:\n      \n         import { ").concat(missing, " } from \"witnet-requests\"\n    \n    (Node.js error was: ").concat(e, ")"));
      }
    }

    throw error;
  }
}

function pack(dro) {
  var request = dro.data.data_request;
  var retrieve = request.retrieve.map(function (branch) {
    return _objectSpread({}, branch, {
      script: branch.encode()
    });
  });
  var aggregate = request.aggregate.pack();
  var tally = request.tally.pack();
  return _objectSpread({}, dro.data, {
    data_request: _objectSpread({}, request, {
      retrieve: retrieve,
      aggregate: aggregate,
      tally: tally
    })
  });
}

function intoProtoBuf(request, schema) {
  return schema.DataRequestOutput.encode(request);
}

function intoSol(hex, fileName) {
  var contractName = fileName.replace(/\.js/, "");
  return "pragma solidity ^0.5.0;\n\nimport \"witnet-ethereum-bridge/contracts/Request.sol\";\n\n// The bytecode of the ".concat(contractName, " request that will be sent to Witnet\ncontract ").concat(contractName, "Request is Request {\n  constructor () Request(hex\"").concat(hex, "\") public { }\n}\n");
}

function writeSol(sol, fileName, requestContractsDir, fs) {
  var solFileName = fileName.replace(/\.js/, ".sol");
  fs.writeFileSync("".concat(requestContractsDir).concat(solFileName), sol);
  return fileName;
}

function writeMigrations(contractNames, userContractsDir, migrationsDir, fs) {
  var artifacts = contractNames.filter(function (fileName) {
    return fileName !== "Migrations.sol";
  }).map(function (fileName) {
    return "".concat(fileName[0].toUpperCase()).concat(fileName.slice(1).replace(".sol", ""));
  });
  var stage2 = "// WARNING: DO NOT DELETE THIS FILE\n// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten.\nconst WitnetBridgeInterface = artifacts.require(\"WitnetBridgeInterface\")\nconst MockWitnetBridgeInterface = artifacts.require(\"MockWitnetBridgeInterface\")\nconst CBOR = artifacts.require(\"CBOR\")\nconst Witnet = artifacts.require(\"Witnet\")\n\nconst addresses = ".concat(JSON.stringify(Addresses, null, 2).replace(/(["}])$\n/gm, function (m, p1) {
    return "".concat(p1, ",\n");
  }), "\n\nmodule.exports = function (deployer, network) {\n  network = network.split(\"-\")[0]\n  if (network in addresses) {\n    Witnet.address = addresses[network][\"Witnet\"]\n    WitnetBridgeInterface.address = addresses[network][\"WitnetBridgeInterface\"]\n  } else {\n    deployer.deploy(CBOR)\n    deployer.link(CBOR, Witnet)\n    deployer.deploy(Witnet)\n    deployer.deploy(MockWitnetBridgeInterface).then(function() {\n    return  WitnetBridgeInterface.address = MockWitnetBridgeInterface.address\n  })\n  }\n}\n");
  fs.writeFileSync("".concat(migrationsDir, "2_witnet_core.js"), stage2);
  var userContractsArgs = readMigrationArgs(migrationsDir, fs);
  var stage3 = "// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten except\n// each contracts' constructor arguments (you can freely edit those and the compiler will respect them).\nconst Witnet = artifacts.require(\"Witnet\")\nconst WitnetBridgeInterface = artifacts.require(\"WitnetBridgeInterface\")\n".concat(artifacts.map(function (artifact) {
    return "const ".concat(artifact, " = artifacts.require(\"").concat(artifact, "\")");
  }).join("\n"), "\n\nmodule.exports = function (deployer) {\n  deployer.link(Witnet, [").concat(artifacts.join(", "), "])\n").concat(artifacts.map(function (artifact) {
    if (artifact in userContractsArgs) {
      var args = userContractsArgs[artifact].split(/[(,)]/).slice(2).reverse().slice(1).reverse().map(function (x) {
        return x.trim();
      }).join(", ");
      console.log("> ".concat(artifact, ": reusing existing constructor arguments (").concat(args, ")"));
      return userContractsArgs[artifact];
    } else {
      var _args = [artifact].concat(_toConsumableArray(mockSolidityArgs(readSolidityArgs(artifact, userContractsDir, fs))));

      console.log("> ".concat(artifact, " generating default constructor arguments (").concat(_args.slice(1).join(", "), ")\n  \x1B[33mWARNING: the autogenerated argument values may not make sense for the logic of the ").concat(artifact) + " contract's constructor.\n  Please make sure you customize them if needed before actually deploying anything" + ".\x1b[0m");
      return "   deployer.deploy(".concat(_args.join(", "), ")");
    }
  }).join("\n"), "\n}\n");
  fs.writeFileSync("".concat(migrationsDir, "3_user_contracts.js"), stage3);
}

function readSolidityArgs(artifact, userContractsDir, fs) {
  var content = readFile("".concat(userContractsDir).concat(artifact, ".sol"), fs);
  var regex = /constructor\s*\(([\w\s,]*)/m;
  return content.match(regex)[1];
}

function readMigrationArgs(migrationsDir, fs) {
  fs.closeSync(fs.openSync("".concat(migrationsDir, "3_user_contracts.js"), "a"));
  var content = readFile("".concat(migrationsDir, "3_user_contracts.js"), fs);
  var regex = /^\s*deployer\.deploy\([\s\n]*(\w+)[^)]*\)/mg;
  return matchAll(regex, content).reduce(function (acc, match) {
    return _objectSpread({}, acc, _defineProperty({}, match[1], match[0]));
  }, {});
}

function mockSolidityArgs(args) {
  var mocks = {
    "uint": 0,
    "uint8": 0,
    "uint16": 0,
    "uint32": 0,
    "uint64": 0,
    "uint128": 0,
    "uint256": 0,
    "int": 0,
    "int8": 0,
    "int16": 0,
    "int32": 0,
    "int64": 0,
    "int128": 0,
    "int256": 0,
    "string": "\"CHANGEME\"",
    "bytes": "\"DEADC0FFEE\"",
    "address": "\"0x0000000000000000000000000000000000000000\"",
    "bool": false
  };
  return args.split(",").map(function (arg) {
    var _arg$trim$split = arg.trim().split(" "),
        _arg$trim$split2 = _slicedToArray(_arg$trim$split, 2),
        type = _arg$trim$split2[0],
        argName = _arg$trim$split2[1];

    if (type === "address" && argName === "_wbi") {
      return "WitnetBridgeInterface.address";
    } else if (mocks.hasOwnProperty(type)) {
      return mocks[type];
    } else {
      return 0;
    }
  });
}

function matchAll(regex, string) {
  var matches = [];

  while (true) {
    var match = regex.exec(string);
    if (match === null) break;
    matches.push(match);
  }

  return matches;
}