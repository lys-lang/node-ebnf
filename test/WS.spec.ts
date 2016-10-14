declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
{ ws=implicit }
/* https://www.ietf.org/rfc/rfc4627.txt */
value                ::= false | null | true | object | array | number | string
BEGIN_ARRAY          ::= #x5B  /* [ left square bracket */
BEGIN_OBJECT         ::= #x7B  /* { left curly bracket */
END_ARRAY            ::= #x5D  /* ] right square bracket */
END_OBJECT           ::= #x7D  /* } right curly bracket */
NAME_SEPARATOR       ::= #x3A  /* : colon */
VALUE_SEPARATOR      ::= #x2C  /* , comma */
WS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */
false                ::= "false"
null                 ::= "null"
true                 ::= "true"
object               ::= BEGIN_OBJECT (member (VALUE_SEPARATOR member)*)? END_OBJECT
member               ::= string NAME_SEPARATOR value
array                ::= BEGIN_ARRAY (value (VALUE_SEPARATOR value)*)? END_ARRAY

number                ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {ws=explicit}

/* STRINGS */

string                ::= '"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '"' {ws=explicit}
HEXDIG                ::= [a-fA-F0-9] {ws=explicit}
  `;

describe('WS', () => {
  describe('Parse JSON', () => {
    let parser: Parser;

    it('create parser', () => {
      parser = new Parser(Grammars.Custom.RULES, {});
      testParseToken(parser, grammar);
    });
  });

  describe('Grammars.W3C parses JSON grammar', function () {
    let RULES = Grammars.Custom.getRules(grammar);
    console.log('JSON:\n' + inspect(RULES, false, 20, true));
    let parser = new Parser(RULES, {});

    printBNF(parser);

    testParseToken(parser, JSON.stringify(true, null, 2));
    testParseToken(parser, JSON.stringify(false, null, 2));
    testParseToken(parser, JSON.stringify(null, null, 2));
    testParseToken(parser, JSON.stringify("", null, 2));
    testParseToken(parser, JSON.stringify("\"", null, 2));
    testParseToken(parser, JSON.stringify("\"{}", null, 2));
    testParseToken(parser, JSON.stringify(10, null, 2));
    testParseToken(parser, JSON.stringify(-10, null, 2));
    testParseToken(parser, JSON.stringify(-10.1, null, 2));

    testParseToken(parser, JSON.stringify(10.1E123, null, 2));

    testParseToken(parser, JSON.stringify({}, null, 2));
    testParseToken(parser, '{  "a": true       }');
    testParseToken(parser, JSON.stringify({ a: false }, null, 2));

    testParseToken(parser, JSON.stringify({
      a: false, b: `asd
      asd `, list: [1, 2, 3, true]
    }, null, 2));


    testParseToken(parser, JSON.stringify([]));
    testParseToken(parser, JSON.stringify([{}], null, 2));
    testParseToken(parser, JSON.stringify([null, false], null, 2));
  });
});