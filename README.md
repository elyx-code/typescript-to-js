# Typescript to Javascript compiler

This Typescript to javascript compiler only drops the keywords. No other changes to the code.

Usually, when you compile typescript code with the official typescript compiler, the outputted javascript code looks something like this:
```js
"use strict";
var __assign = (this && this.__assign) || function () {
	__assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
	};
	return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
	return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
var abstract_syntax_tree_1 = __importDefault(require("abstract-syntax-tree"));
var parser_1 = require("@typescript-eslint/parser");
var format_javascript_1 = require("format-javascript");
function compile(tsCodeString) {
	var typescriptAST = (0, parser_1.parse)(tsCodeString, {
		sourceType: 'module',
		range: true
	});
	return typescriptAST;
}
exports.compile = compile;
```

With this compiler, the result is almost the same code that you wrote, minus the typescript specific keywords.
Outputs beautiful, formatted Javascript code.

### Example ts input file

```ts
import fs from 'fs';
import { compile } from 'typescript-to-js';
export * from './types/index.d.ts';

export type FileArgument = string | Buffer;

function main(file: FileArgument) {
  let readFile: Buffer;

  if (file instanceof Buffer) {
    readFile = file;
  } else {
    readFile = fs.readFileSync(file);
  }
  
  const tsCode: string = readFile.toString();
  const outputFileName: string = 'output.js';
  
  const compiledJsCode: string = compile(tsCode);
  
  fs.writeFileSync(outputFileName, compiledJsCode);

  console.log('Javascript output code:\n', compiledJsCode);
}

const pathToFile = __dirname + '/src/index.ts';

main(pathToFile);

export { main };
```

### Example js output file

Unfortunatly some white space is still lost 😔. Might add white space support in the future.
```js
import fs from "fs";
import { compile } from "typescript-to-js";
export * from "./types/index.d.ts";

function main(file) {
  let readFile;
  if (file instanceof Buffer) {
    readFile = file;
  } else {
    readFile = fs.readFileSync(file);
  }
  const tsCode = readFile.toString();
  const outputFileName = "output.js";
  const compiledJsCode = compile(tsCode);
  fs.writeFileSync(outputFileName, compiledJsCode);
  console.log("Javascript output code:\n", compiledJsCode);
}
const relativeBoilerplateCodeLocation = __dirname + "/src/index.ts";
main(relativeBoilerplateCodeLocation);
export { main };
```

## Usage

In Javascript:
```js
import { compile } from 'typescript-to-js';

const tsCode = `
  export type FileArgument = string | Buffer;

  function main(file: FileArgument) {
    console.log('Hello world!', file);
  }
`;

const outputJsCodeString = compile(tsCodeString);
```

In Typescript:
```ts
import { compile } from 'typescript-to-js';

const tsCode: string = `
  export type FileArgument = string | Buffer;

  function main(file: FileArgument) {
    console.log('Hello world!', file);
  }
`;

const outputJsCode: string = compile(tsCode);
```
