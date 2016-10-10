import { IToken, Parser, Grammars } from '../dist';

declare var require, it;

export const printBNF = (parser: Parser) => console.log(parser.emitSource());

let inspect = require('util').inspect;

export function testParseToken(parser: Parser, txt: string, target?: string, customTest?: (document: IToken) => void) {
  testParseTokenFailsafe(parser, txt, target, (doc: IToken) => {
    if (doc.errors.length)
      throw doc.errors[0];

    if (doc.rest.length != 0)
      throw new Error('Got rest: ' + doc.rest);

    customTest && customTest(doc);
  });

}

export function testParseTokenFailsafe(parser: Parser, txt: string, target?: string, customTest?: (document: IToken) => void) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    console.log('      ---------------------------------------------------');

    let result;

    try {
      result = parser.getAST(txt, target);

      if (!result)
        throw new Error('Did not resolve');

      if (target && result.type != target)
        throw new Error('Type doesn\'t match. Got: ' + result.type);

      if (result.text.length == 0)
        throw new Error('Empty text result');

      if (customTest) customTest(result);
    } catch (e) {
      ;
      parser.debug = true;
      try {
        result = parser.getAST(txt, target);
        console.log(txt + '\n' + inspect(result, false, 20, true));
      } catch (ee) {
        console.log(ee);
      }
      parser.debug = false;
      throw e;
    }

    describeTree(result);
  });

}

function printDescription(token: IToken, maxLength: number) {
  if (/\n/.test(token.text)) return;
  console.log(
    '         '
    + new Array(token.start + 1).join(' ')
    + token.text // new Array(token.text.length + 1).join('^')
    + new Array(maxLength - token.end + 2).join(' ')
    + token.type
  );
  token.children && token.children.forEach(c => {
    printDescription(c, maxLength);
  });
}

export function describeTree(token: IToken) {
  printDescription(token, token.text.length);
}
