import { IToken, Parser, Grammars } from '../dist';

declare var require, it;

export const printBNF = (parser: Parser) => console.log(parser.emitSource());

let inspect = require('util').inspect;

export function testParseToken(parser: Parser, txt: string, target?: string, customTest?: (document: IToken) => void) {
  testParseTokenFailsafe(parser, txt, target, (doc: IToken) => {
    if (doc.errors.length) throw doc.errors[0];

    if (doc.rest.length != 0) throw new Error('Got rest: ' + doc.rest);

    customTest && customTest(doc);
  });
}

export function testParseTokenFailsafe(
  parser: Parser,
  txt: string,
  target?: string,
  customTest?: (document: IToken) => void
) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    console.log('      ---------------------------------------------------');

    let result;

    try {
      result = parser.getAST(txt, target);

      if (!result) throw new Error('Did not resolve');

      if (target && result.type != target) throw new Error("Type doesn't match. Got: " + result.type);

      if (result.text.length == 0) throw new Error('Empty text result');

      if (customTest) customTest(result);
    } catch (e) {
      console.error(e);
      // parser.debug = true;
      // try {
      //   // result = parser.getAST(txt, target);
      //   console.log(txt + '\n' + inspect(result, false, 20, true));
      // } catch (ee) {
      //   console.(ee);
      // }
      // parser.debug = false;
      describeTree(result);
      throw e;
    }

    describeTree(result);
  });
}

function printAST(token: IToken, level = 0) {
  console.log(
    '         ' + '  '.repeat(level) + `|-${token.type}${token.children.length == 0 ? '=' + token.text : ''}`
  );
  token.children &&
    token.children.forEach(c => {
      printAST(c, level + 1);
    });
}

export function describeTree(token: IToken) {
  printAST(token);
}
