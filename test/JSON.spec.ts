declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
/* https://www.ietf.org/rfc/rfc4627.txt */
value                ::= false | null | true | object | array | number | string
BEGIN_ARRAY          ::= WS* #x5B WS*  /* [ left square bracket */
BEGIN_OBJECT         ::= WS* #x7B WS*  /* { left curly bracket */
END_ARRAY            ::= WS* #x5D WS*  /* ] right square bracket */
END_OBJECT           ::= WS* #x7D WS*  /* } right curly bracket */
NAME_SEPARATOR       ::= WS* #x3A WS*  /* : colon */
VALUE_SEPARATOR      ::= WS* #x2C WS*  /* , comma */
WS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */
false                ::= "false"
null                 ::= "null"
true                 ::= "true"
object               ::= BEGIN_OBJECT (member (VALUE_SEPARATOR member)*)? END_OBJECT
member               ::= string NAME_SEPARATOR value
array                ::= BEGIN_ARRAY (value (VALUE_SEPARATOR value)*)? END_ARRAY

/* NUMBERS */

number          ::= "-"? ("0" | [1-9] DIGIT*) ("." [0-9]+)? EXP?
DIGIT           ::= [0-9]
EXP             ::= ("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*)

/* STRINGS */

string          ::= '"' CHAR* '"'
ESCAPE          ::= #x5C /* \ */
HEXDIG          ::= [a-fA-F0-9]
ESCAPABLE       ::= #x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG
CHAR            ::= UNESCAPED | ESCAPE ESCAPABLE
UNESCAPED       ::= [#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]
  `;

describe('JSON', () => {
  describe('Parse JSON', () => {
    let parser: Parser;

    it('create parser', () => {
      parser = new Parser(Grammars.W3C.RULES, {});
      testParseToken(parser, grammar);
    });
  });

  describe('Grammars.W3C parses JSON grammar', function () {
    let RULES = Grammars.W3C.getRules(grammar);
    
    let parser = new Parser(RULES, {});

    printBNF(parser);

    testParseToken(parser, JSON.stringify(true));
    testParseToken(parser, JSON.stringify(false));
    testParseToken(parser, JSON.stringify(null));
    testParseToken(parser, JSON.stringify(""));
    testParseToken(parser, JSON.stringify("\""));
    testParseToken(parser, JSON.stringify("\"{}"));
    testParseToken(parser, JSON.stringify(10));
    testParseToken(parser, JSON.stringify(-10));
    testParseToken(parser, JSON.stringify(-10.1));

    parser.debug = true;
    testParseToken(parser, JSON.stringify(10.1E123));
    parser.debug = false;

    testParseToken(parser, JSON.stringify({}));
    testParseToken(parser, JSON.stringify({ a: true }));
    testParseToken(parser, JSON.stringify({ a: false }));

    parser.debug = true;
    testParseToken(parser, JSON.stringify({
      a: false, b: `asd
      asd `, list: [1, 2, 3, true]
    }));
    parser.debug = false;

    testParseToken(parser, JSON.stringify([]));
    testParseToken(parser, JSON.stringify([{}]));
    testParseToken(parser, JSON.stringify([null, false]));
  });
});