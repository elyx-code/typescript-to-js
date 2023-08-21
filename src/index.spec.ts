import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { compile } from './index';

describe('test', () => {
  // Read the files in the test folder and loop over them
  // We then dynamically read the contents of each file and run it as a test

  let testFolder;

  if (__dirname.includes('dist')) {
    testFolder = path.join(__dirname, '..', '..', 'tests', 'compilation-test-files');
  } else {
    testFolder = path.join(__dirname, '..', 'tests', 'compilation-test-files');
  }
  console.log('testFolder: ', testFolder);
  const files = readdirSync(testFolder);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    console.log('file: ', file);
    const fileContents = readFileSync(path.join(testFolder, file), 'utf8');

    test('add', async () => {
      let result;
      try {
        result = compile(fileContents);
        console.log('Successful compilation result: ', result);
        expect(true).toEqual(true);
      } catch (error) {
        console.log('Compilation error: ', error);
        expect(true).toEqual(false);
      }
    });
  }
});
