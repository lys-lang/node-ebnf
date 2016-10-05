declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
/* https://www.ietf.org/rfc/rfc4627.txt */
value           ::= false | null | true | object | array | number | string
RULE_beginArray      ::= RULE_ws* #x5B RULE_ws*  /* [ left square bracket */
RULE_beginObject     ::= RULE_ws* #x7B RULE_ws*  /* { left curly bracket */
RULE_endArray        ::= RULE_ws* #x5D RULE_ws*  /* ] right square bracket */
RULE_endObject       ::= RULE_ws* #x7D RULE_ws*  /* } right curly bracket */
RULE_nameSeparator   ::= RULE_ws* #x3A RULE_ws*  /* : colon */
RULE_valueSeparator  ::= RULE_ws* #x2C RULE_ws*  /* , comma */
RULE_ws         ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */
false           ::= "false"
null            ::= "null"
true            ::= "true"
object          ::= RULE_beginObject (member (RULE_valueSeparator member)*)? RULE_endObject
member          ::= string RULE_nameSeparator value
array           ::= RULE_beginArray (value (RULE_valueSeparator value)*)? RULE_endArray

/* NUMBERS */

number          ::= "-"? ("0" | [1-9] RULE_digit*) ("." [0-9]+)? exp?
RULE_digit      ::= [0-9]
exp             ::= ("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*)

/* STRINGS */

string          ::= '"' RULE_char* '"'
escape          ::= #x5C /* \ */
HEXDIG          ::= [a-fA-F0-9]
escapable       ::= #x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG
RULE_char       ::= unescaped | escape escapable
unescaped       ::= [#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]
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
    console.log('JSON:\n' + inspect(RULES, false, 20, true));
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