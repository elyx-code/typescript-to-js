function main() {
  console.log('Hello world from the main exported function!');
}

export interface ISomeRandomInterfaceExport {
  one: string;
  two: string;
}

export type Hello = string | number;

export {
  main
}