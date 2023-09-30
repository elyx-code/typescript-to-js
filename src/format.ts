import { format as formatCode } from 'prettier';
import { format as formatCodeSync } from '@prettier/sync';

function addNewLines(inputCode: string) {
  // Add a single new line after all import statements
  const importRegex = /(import [^\n]+;\s*)/g;
  inputCode = inputCode.replace(importRegex, (match, p1) => `${p1}\n`);

  // Add new lines after function and class declarations
  const declarationRegex = /(function [^\n]+{|class [^\n]+{|}\s*;)/g;
  inputCode = inputCode.replace(declarationRegex, '$1\n');

  // Add new lines before if statements
  const ifRegex = /\n(\s*if \([^)]+\) {)/g;
  inputCode = inputCode.replace(ifRegex, '\n\n$1');

  // Add new lines after code blocks
  const blockRegex = /}\s*(?!(?:else|catch|finally))/g;
  inputCode = inputCode.replace(blockRegex, '$&\n');

  // Add new line at the end of the file
  inputCode = inputCode.trim() + '\n';

  // Add new lines after method declarations within a class
  const methodRegex = /\n(\s*[a-zA-Z0-9_$]+\(.*\) {)/g;
  inputCode = inputCode.replace(methodRegex, '\n\n$1');

  // Add new line after class properties
  const propertyRegex = /\n(\s*[a-zA-Z0-9_$]+;)/g;
  inputCode = inputCode.replace(propertyRegex, '\n\n$1');

  // Add new lines before return statements
  const returnRegex = /(\n\s*return [^;]+;)/g;
  inputCode = inputCode.replace(returnRegex, '\n$1');

  // Add new lines after console.log statements
  const consoleLogRegex = /(console\.log\([^)]+\);)/g;
  inputCode = inputCode.replace(consoleLogRegex, '$1\n');

  return inputCode;
}

function cleanup(inputCode: string) {
  // Remove extra new lines before imports
  const importCleanupRegex = /\n+(import [^\n]+;)/g;
  inputCode = inputCode.replace(importCleanupRegex, '\n$1');

  return inputCode;
}

export async function format(inputCode: string) {
  return cleanup(await formatCode(addNewLines(inputCode), { parser: 'babel' }));
}

export function formatSync(inputCode: string) {
  return cleanup(
    formatCodeSync(addNewLines(inputCode), { parser: 'babel' }),
  );
}
