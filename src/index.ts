import AbstractSyntaxTree, { generate, append } from 'abstract-syntax-tree';
import { parse } from '@typescript-eslint/parser';
import { format } from 'format-javascript';

function compile(tsCodeString: string) {
  const typescriptAST = parse(tsCodeString, {
    sourceType: 'module',
    range: true
  });
  
  function isObject(obj: any) {
    return typeof obj === 'object' && obj !== null
  }
  
  function recursivelyDeleteTSElementsFromAST(tsASTSection: ReturnType<typeof parse>) { 
    const astClone: any = { ...tsASTSection };
  
    for (const key in astClone) {
      if (Object.prototype.hasOwnProperty.call(astClone, key)) {
        let value = astClone[key];
        
        if (value && value.type === 'TSAsExpression') {
          value = value.expression;
        }
  
        if (
          key === 'typeAnnotation' ||
          key === 'optional' ||
          key === 'range'
        ) {
          delete astClone[key];
        } else if (Array.isArray(value)) {
          astClone[key] = value.map(item => {
            let itemClone = { ...item };
  
            if (itemClone && itemClone.type === 'TSAsExpression') {
              itemClone = itemClone.expression;
            }
  
            if (isObject(itemClone)) {
              const sanitizedSection = recursivelyDeleteTSElementsFromAST(itemClone);
      
              return sanitizedSection;
            } else {
              return itemClone;
            }
          });
        } else if (isObject(value)) {
          const sanitizedSection = recursivelyDeleteTSElementsFromAST(value);
  
          astClone[key] = sanitizedSection
        } else {
          astClone[key] = value;
        }
      }
    }
  
    return astClone;
  }
  
  const jsAST = new AbstractSyntaxTree();
  
  for (let index = 0; index < typescriptAST.body.length; index++) {
    const element: any = typescriptAST.body[index];
  
    const generatedNode = recursivelyDeleteTSElementsFromAST(element);
  
    append(jsAST, generatedNode);
  }
  
  const unformattedJsCode = generate(jsAST);
  
  const formattedJsCode = format(unformattedJsCode, { indent_size: 2, space_in_empty_paren: true });

  return formattedJsCode;
}

export {
  compile
}
