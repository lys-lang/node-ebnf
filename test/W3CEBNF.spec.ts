declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
Grammar ::= RULE_S* (Production RULE_S*)*  EOF
Production ::= NCName RULE_S* "::=" RULE_WHITESPACE* Choice RULE_WHITESPACE* RULE_EOL+ RULE_S*
NCName ::= [a-zA-Z][a-zA-Z_0-9]*
Choice ::= SequenceOrDifference (RULE_WHITESPACE* "|" RULE_WHITESPACE* SequenceOrDifference)*
SequenceOrDifference ::= Item RULE_WHITESPACE* (Minus Item | Item*)?
Minus ::= "-"
Item ::= RULE_WHITESPACE* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?
PrimaryDecoration ::= "?" | "*" | "+"
DecorationName ::= "ebnf://" [^#x5D#]+
SubItem ::= "(" RULE_WHITESPACE* Choice RULE_WHITESPACE* ")"
StringLiteral ::= '"' [^"]* '"' | "'" [^']* "'"
CharCode ::= "#x" [0-9a-zA-Z]+
CharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | RULE_Char)+  "]"
RULE_Char ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]
CharRange ::= RULE_Char "-" RULE_Char
CharCodeRange ::= CharCode "-" CharCode
RULE_WHITESPACE ::= (#x09 | #x20)*  | Comment RULE_WHITESPACE*
RULE_S ::= RULE_WHITESPACE RULE_S* | RULE_EOL RULE_S*
Comment ::= "/*" ( [^*])*  "*/"
RULE_EOL ::= #x0D #x0A | #x0A | #x0D
Link ::= '[' Url ']'
Url ::= [^#x5D:\/?#] "://" [^#x5D#]+ ("#" NCName)?
  `;


describe('Parse W3CEBNF', () => {
  let parser: Parser;

  it('create parser', () => {
    parser = new Parser(Grammars.W3C.RULES, {});
    testParseToken(parser, grammar);
    console.log('W3C PARSER', Grammars.W3C.emit(parser));
    printBNF(parser);
  });
});

describe('Grammars.W3C parses itself', function () {
  let RULES = Grammars.W3C.getRules(grammar);
  let parser = new Parser(RULES, {});

  testParseToken(parser, grammar);
});