declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseTokenFailsafe, describeTree, printBNF, testParseToken } from './TestHelpers';

let inspect = require('util').inspect;
let expect = require('expect');


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
object               ::= BEGIN_OBJECT ([recover://OBJECT_RECOVERY] ([recover://OBJECT_RECOVERY] member (VALUE_SEPARATOR member)*)?) END_OBJECT
OBJECT_RECOVERY      ::= "}" | COMMA_RECOVERY
ARRAY_RECOVERY       ::= "]" | COMMA_RECOVERY
COMMA_RECOVERY       ::= ","
MEMBER_RECOVERY      ::= ":"
member               ::= [recover://MEMBER_RECOVERY] string NAME_SEPARATOR ([recover://OBJECT_RECOVERY] value)
array                ::= BEGIN_ARRAY ([recover://ARRAY_RECOVERY] value ([recover://ARRAY_RECOVERY] VALUE_SEPARATOR value)*)? END_ARRAY

number                ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))?

/* STRINGS */

string                ::= '"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '"'
HEXDIG                ::= [a-fA-F0-9]
  `;

describe('JSON 2', () => {
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

    testParseTokenFailsafe(parser, '{"b": ZZZZ}', null, (doc) => {
      expect(doc.errors.length).toEqual(1);
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('ZZZZ');
    });

    testParseTokenFailsafe(parser, '{"b": ZZZZ, "c": true}', null, (doc) => {
      expect(doc.errors.length).toEqual(1);
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('ZZZZ');
    });

    testParseTokenFailsafe(parser, '{"a":false,"b": ZZZZ,"list":[1,2,3,true]}', null, (doc) => {
      expect(doc.errors.length).toEqual(1);
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('ZZZZ');
    });
  });
});