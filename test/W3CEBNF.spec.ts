declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
Grammar ::= S* (Production S*)*
Production ::= NCName S* "::=" WS* (SequenceOrDifference (WS* "|" WS* SequenceOrDifference)* ) WS* EOL+ S*
NCName ::= [a-zA-Z][a-zA-Z_0-9]*
SequenceOrDifference ::= (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) WS* (Minus (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) | (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?)* )?
Minus ::= "-"
PrimaryDecoration ::= "?" | "*" | "+"
SubItem ::= "(" WS* (SequenceOrDifference (WS* "|" WS* SequenceOrDifference)* ) WS* ")"
StringLiteral ::= '"' [^"]* '"' | "'" [^']* "'"
CharCode ::= "#x" [0-9a-zA-Z]+
CharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | CHAR)+  "]"
CHAR ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]
CharRange ::= CHAR "-" CHAR
CharCodeRange ::= CharCode "-" CharCode /* comentarios */
WS ::= (#x09 | #x20)* | Comment WS*
S ::= WS S* | EOL S*
Comment ::= "/*" ([^*] | "*"+ [^\/]*)*  "*/"
EOL ::= #x0D #x0A | #x0A | #x0D
  `;


describe('Parse W3CEBNF', () => {
  let parser: Parser;

  it('create parser', () => {
    parser = new Parser(Grammars.W3C.RULES, {});
    testParseToken(parser, grammar);
    printBNF(parser);
  });
});

describe('Grammars.W3C parses itself', function () {
  let parser = new Parser(Grammars.W3C.RULES, {});

  let RULES = Grammars.W3C.getRules(grammar);

  parser = new Parser(RULES, {});

  testParseToken(parser, grammar);
});