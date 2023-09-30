import { describe, expect, test } from 'vitest'
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { compile } from './index';

describe('Test file compilations', () => {
  // Read the files in the test folder and loop over them
  // We then dynamically read the contents of each file and run it as a test

  let testFolder;

  if (__dirname.includes('dist')) {
    testFolder = path.join(__dirname, '..', '..', 'tests', 'compilation-test-files');
  } else {
    testFolder = path.join(__dirname, '..', 'tests', 'compilation-test-files');
  }
  const files = readdirSync(testFolder);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const fileContents = readFileSync(path.join(testFolder, file), 'utf8');

    test(`Test compilation of demo file: ${file}`, async () => {
      try {
        const result = compile(fileContents);
        expect(true).toEqual(true);
      } catch (error) {
        expect(true).toEqual(false);
      }
    });
  }
});
