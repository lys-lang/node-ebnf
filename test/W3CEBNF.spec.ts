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

  let RULES = Grammars.W3C.getRules(grammar);

  lispParser = new Parser(RULES, {});
  lispParser.debug = true;

  testParseToken(lispParser, grammar);
});