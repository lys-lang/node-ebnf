import { IToken, Parser } from '../dist';

declare var require, it;

let inspect = require('util').inspect;

export function printBNF(parser: Parser) {
  console.log('BNF:');

  parser.grammarRules.forEach(l => {
    console.log(l.name + ' ::= ' + l.bnf.map(options => {
      if (!options) return inspect('ERROR, MISSING OPTIONS', false, 1, true);
      return options.join(' ');
    }).join(' | '));
  });

  console.log('Expr:');

  parser.grammarRules.forEach(l => {
    (l as any).expr && console.log('  ' + l.name + ': ' + inspect((l as any).expr, false, 2, true));
  });

}


export function testParseToken(parser: Parser, txt: string, target?: string) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    let result = parser.getAST(txt, target);

    try {
      if (!result)
        throw new Error('Did not resolve');

      if (target && result.type != target)
        throw new Error('Type doesn\'t match. Got: ' + result.type);

      if (result.text.length == 0)
        throw new Error('Empty text result');
    } catch (e) {
      console.log(txt + '\n' + inspect(result, false, 20, true));
      throw e;
    }

    describeTree(result);
  });

}

function printDescription(token: IToken, maxLength: number) {
  console.log(
    new Array(token.start + 1).join(' ')
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
