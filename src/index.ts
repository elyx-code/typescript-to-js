// @ts-ignore abstract-syntax-tree module doesn't have type declaration.
import AbstractSyntaxTree from 'abstract-syntax-tree';
import { parse } from '@typescript-eslint/parser';
import { format } from 'format-javascript';

function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null
}

function recursivelyDeleteTSElementsFromAST(tsASTSection: ReturnType<typeof parse>) { 
  let tsASTSectionClone: any = { ...tsASTSection };

  // TS expression elements have a 'expression' property where the JS expression lives
  // We override the original expression variable with its child JS expression to get rid of the TS part
  if (
    tsASTSectionClone.expression &&
    tsASTSectionClone.type.startsWith('TS')
  ) {
    tsASTSectionClone = tsASTSectionClone.expression;
  }

  // Loop over the keys of this section of the AST
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

function compile(tsCodeString: string) {
  // Pass the TS code to the 3rd party parser to turn it into a compliant TS abstract syntax tree (AST)
  const typescriptAST = parse(tsCodeString, {
    sourceType: 'module',
    range: true
  });

  // Recursively read that AST object and drop all the TS elements to leave only the JS ones
  const sanitizedAst = recursivelyDeleteTSElementsFromAST(typescriptAST);

  const jsAST = new AbstractSyntaxTree();

  // Looping root list of elements in the TS tree and appending them to the new and empty JS tree
  for (let index = 0; index < sanitizedAst.body.length; index++) {
    const element: any = sanitizedAst.body[index];
  
    AbstractSyntaxTree.append(jsAST, element);
  }
  
  // Take the newly created JS AST and use a 3rd party code generator to output a string of JS code
  const unformattedJsCode = AbstractSyntaxTree.generate(jsAST);

  // Format the output code with a 3rd party code formatter
  const formattedJsCode = format(unformattedJsCode, { indent_size: 2, space_in_empty_paren: true });

  return formattedJsCode;
}

export {
  compile
}
