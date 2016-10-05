declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


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
CharCodeRange ::= CharCode "-" CharCode /* comentarios */
RULE_Whitespace ::= (#x09 | #x20)*  | Comment RULE_Whitespace*
RULE_S ::= RULE_Whitespace RULE_S* | RULE_EOL RULE_S*
Comment ::= "/*" ([^*] | "*"+ [^\/]*)*  "*/"
RULE_EOL ::= #x0D #x0A | #x0A | #x0D
  `;


describe('Parse W3CEBNF', () => {
  let parser: Parser;

  it('create parser', () => {
    parser = new Parser(Grammars.W3C.RULES, {});
    testParseToken(parser, grammar);
  });
});

describe('Grammars.W3C parses itself', function () {
  let parser = new Parser(Grammars.W3C.RULES, {});

  let RULES = Grammars.W3C.getRules(grammar);

  parser = new Parser(RULES, {});

  testParseToken(parser, grammar);
});