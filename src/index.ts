import { format, formatSync } from './format';
// DON'T CHANGE: Must be a "require" and not an "import"
const compiler = require('@babel/core');
const toTypescript = require('@babel/plugin-transform-typescript');

export {
  formatSync,
  format,
}

function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null
}

function recursivelyDeleteTSElementsFromAST(tsASTSection: ReturnType<any>) { 
  let tsASTSectionClone: any = { ...tsASTSection };

  // TS expression elements have a 'expression' property where the JS expression lives
  // We override the original expression variable with its child JS expression to get rid of the TS part
  if (
    tsASTSectionClone.expression &&
    tsASTSectionClone.type.startsWith('TS')
  ) {
    tsASTSectionClone = tsASTSectionClone.expression;
  }

  // Loop over the properties of this section of the AST
  for (const key in tsASTSectionClone) {
    if (Object.prototype.hasOwnProperty.call(tsASTSectionClone, key)) {
      let value = tsASTSectionClone[key];

      // Some elements are purely TS elements. Thos properties we simply delete from the tree.
      if (
        key === 'typeAnnotation' ||
        key === 'optional' ||
        key === 'range'
      ) {
        delete tsASTSectionClone[key];

      // If the current property is an array we loop through it
    } else if (Array.isArray(value)) {
        // Remove any element in that array that are purely TS
        tsASTSectionClone[key] = value
          .filter(item => {
            if (
              isObject(item) &&
              item.declaration &&
              item.declaration.type.startsWith('TS')
            ) {
              return false;
            } else {
              return true;
            }
          })
          .map(item => {
            // If the current element in this array is an object, recursively run this same method
            if (isObject(item)) {
              return recursivelyDeleteTSElementsFromAST(item);
            
            // If the current element in this array is NOT an object, we do nothing
            } else {
              return item;
            }
          });
        
      // If the current property value is an object, recursively run this same method on it
      // to continue to delete its TS children properties
      } else if (isObject(value)) {
        tsASTSectionClone[key] = recursivelyDeleteTSElementsFromAST(value);
      
      // If the current property value is primitive value, we do nothing since it is an identifier or a litteral value
      } else {
        tsASTSectionClone[key] = value;
      }
    }
  }

  return tsASTSectionClone;
}

export async function compile(tsCodeString: string) {
  const compiled = compiler.transform(tsCodeString, {
    plugins: [toTypescript],
    babelrc: false,
  });

  const formattedJsCode = await format(compiled?.code);

  return formattedJsCode;
}

export function compileSync(tsCodeString: string) {
  const compiled = compiler.transformSync(tsCodeString, {
    plugins: [toTypescript],
    babelrc: false,
  });

  const formattedJsCode = formatSync(compiled?.code);

  return formattedJsCode;
}
