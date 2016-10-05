declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;

let lexer = Grammars.W3C.RULES;
let parser = new Parser(Grammars.W3C.RULES, {});

printBNF(parser);

parser.debug = true;

describe('Parse W3CEBNF', () => {
  let grammar = `
Grammar ::= RULE_S* (Production RULE_S*)*
Production ::= NCName RULE_S* "::=" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* "|" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* RULE_EOL+ RULE_S*
NCName ::= [a-zA-Z][a-zA-Z_0-9]*
SequenceOrDifference ::= (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) RULE_Whitespace* (Minus (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) | (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?)* )?
Minus ::= "-"
PrimaryDecoration ::= "?" | "*" | "+"
SubItem ::= "(" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* "|" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* ")"
StringLiteral ::= '"' [^"]* '"' | "'" [^']* "'"
CharCode ::= "#x" [0-9a-zA-Z]+
CharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | RULE_Char)+  "]"
RULE_Char ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]
CharRange ::= RULE_Char "-" RULE_Char
CharCodeRange ::= CharCode "-" CharCode
RULE_Whitespace ::= (#x09 | #x20)*  | Comment RULE_Whitespace*
RULE_S ::= RULE_Whitespace RULE_S* | RULE_EOL RULE_S*
Comment ::= "/*" ([^*] | "*"+ [^\/]*)*  "*/"
RULE_EOL ::= #x0D #x0A | #x0A | #x0D
  `;

  let lispParser: Parser;

  it('create parser', () => {
    lispParser = new Parser(lexer, {});

    printBNF(lispParser);

    testParseToken(lispParser, grammar);
  });

  lispParser = new Parser(lexer, {});
  // lispParser.debug = true;

  testParseToken(lispParser, grammar);

  let ruleset = lispParser.getAST(grammar);

  console.log(inspect(ruleset, false, 20, true));

  let RULES = [];

  let subitems = 0;

  function restar(total, resta) {
    console.log('reberia restar ' + inspect(resta) + ' a ' + inspect(total));
  }

  function convertRegex(txt: string): RegExp {
    return new RegExp(txt
      .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
      .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
      .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
      .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1')
    );
  }

  function getSubItems(RULES, seq: IToken, parent: IToken, parentName: string) {
    let anterior = null;
    let bnfSeq = [];

    seq.children.forEach((x, i) => {
      if (x.type == 'Minus') {
        restar(anterior, x);
      } else {

      }

      let decoration: any = seq.children[i + 1];
      decoration = decoration && decoration.type == 'PrimaryDecoration' && decoration.text || '';

      switch (x.type) {
        case 'SubItem':
          let name = '%' + (parentName + (subitems++));

          createRule(RULES, x, name);

          bnfSeq.push(name + decoration);
          break;
        case 'NCName':
        case 'StringLiteral':
          bnfSeq.push(x.text + decoration);
          break;
        case 'CharCode':
        case 'CharClass':
          bnfSeq.push(convertRegex(x.text + decoration));
          break;
        case 'PrimaryDecoration':
          break;
        default:
          console.log('  ' + inspect(x, false, 2, true));
      }



      anterior = x;
    });

    return bnfSeq;
  }

  function createRule(RULES: any[], token: IToken, name: string) {
    console.log(name);

    let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(RULES, s, token, name));

    let rule = {
      name,
      bnf
    };

    RULES.push(rule);
  }

  let rules = ruleset.children
    .filter(x => x.type == 'Production')
    .map((x: any) => {
      let name = x.children.filter(x => x.type == 'NCName')[0].text;
      createRule(RULES, x, name);

    });

  console.log(inspect(RULES, false, 20, true));


  lispParser = new Parser(RULES, {});
  lispParser.debug = true;

  testParseToken(lispParser, grammar);
});