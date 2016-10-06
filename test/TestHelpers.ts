import { IToken, Parser, Grammars } from '../dist';

declare var require, it;

export const printBNF = (parser: Parser) => console.log(Grammars.W3C.emit(parser));

let inspect = require('util').inspect;

export function testParseToken(parser: Parser, txt: string, target?: string) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    console.log('      ---------------------------------------------------');
    let result = parser.getAST(txt, target);
    parser.debug && console.log(txt + '\n' + inspect(result, false, 20, true));
    try {
      if (!result)
        throw new Error('Did not resolve');

      if (target && result.type != target)
        throw new Error('Type doesn\'t match. Got: ' + result.type);

      if (result.text.length == 0)
        throw new Error('Empty text result');

      if (result.rest.length != 0)
        throw new Error('Got rest: ' + result.rest);
    } catch (e) {
      parser.debug || console.log(txt + '\n' + inspect(result, false, 20, true));
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
