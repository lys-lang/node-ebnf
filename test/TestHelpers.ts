import { IToken, Parser } from '../dist';

declare var require, it;

let inspect = require('util').inspect;

const decorationRE = /(\?|\+|\*)$/;
const subExpressionRE = /^%/;

function getBNFRule(name: string | RegExp, parser: Parser): string {
  if (typeof name == 'string') {
    let decoration = decorationRE.exec(name);

    let decorationText = decoration ? decoration[0] + ' ' : '';

    let subexpression = subExpressionRE.test(name);

    let cleanName = name.replace(decorationRE, '');

    if (subexpression) {
      return '(' + getBNFBody(name, parser) + ')' + decorationText;
    }

    return name;
  } else {
    return name.source
      .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
      .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
  }
}

function grtBNFChoice(rules, parser: Parser) {
  return rules.map(x => getBNFRule(x, parser)).join(' ');
}

function getBNFBody(name: string, parser: Parser): string {
  for (let i = 0; i < parser.grammarRules.length; i++) {
    let rule = parser.grammarRules[i];
    name = name.replace(decorationRE, '');
    if (rule && rule.name == name) {
      return rule.bnf.map(x => grtBNFChoice(x, parser)).join(' | ');
    }
  }
  return 'RULE_NOT_FOUND{' + name + '}';
}

export function printBNF(parser: Parser) {
  console.log('BNF:');

  parser.grammarRules.forEach(l => {
    if (!(/^%/.test(l.name))) {
      console.log(l.name + ' ::= ' + getBNFBody(l.name, parser));
    }
  });
}


export function testParseToken(parser: Parser, txt: string, target?: string) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
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
