import fs from 'fs';
// @ts-ignore
import { compile } from 'typescript-to-js';
// @ts-ignore
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
