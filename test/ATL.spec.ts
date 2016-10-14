declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;


let grammar = `
{ ws=explicit }
Expression ::= FunctionCall | Literal | Selector | Interpolation {ws=implicit}
Literal ::= Boolean | Null | String | Number | Integer | Date | Regex {ws=implicit}
FunctionCall ::= Identifier FunctionArguments {ws=implicit}
FunctionArguments ::= "(" ( Expression (WS* "," WS* Expression)* )? ")" { pin=1, ws=implicit }
Selector ::= Identifier

Identifier ::= RULE_UNQUOTED_STRING

STRING_CONTENT ::= "\\\\$" | [^$"#x0000-#x001F]
JSON_STRING ::= '\\"' | [^#x0000-#x001F"]
RULE_UNQUOTED_STRING ::= [A-Za-z_][A-Za-z0-9_]*
RULE_ANY_REGEX ::= "/" ( '\\/' | [^/] )* "/"
NOT_PIPE ::= !"|" STRING_CONTENT

Date ::= '|' NOT_PIPE+ '|' {pin=1}

Regex ::= RULE_ANY_REGEX [gim]*

WS ::= [#x20#x09#x0A#x0D]+

Interpolation ::= '"' InterpolationPart* '"'
InterpolationPart ::= InterpolationExpression | InterpolationVariable | InterpolationLiteral {fragment=true}
InterpolationLiteral ::= STRING_CONTENT*
InterpolationVariable ::= "$" Identifier {pin=1,fragment=true}
InterpolationExpression ::= "$(" Expression ")" {pin=1,fragment=true}

Boolean ::= ("true" | "false") !RULE_UNQUOTED_STRING
Null ::= "null" !RULE_UNQUOTED_STRING
Number ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))?
Integer ::= "0" | [1-9] [0-9]*

String          ::= '"' CHAR* '"'
ESCAPE          ::= #x5C /* \\ */
HEXDIG          ::= [a-fA-F0-9]
ESCAPABLE       ::= #x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG
CHAR            ::= !"$" UNESCAPED | ESCAPE ESCAPABLE
UNESCAPED       ::= [#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]
  `;

describe('ATL', () => {
  describe('Grammars.Custom parses ATL Expressions', function () {
    let RULES = Grammars.Custom.getRules(grammar);
    console.log('JSON:\n' + inspect(RULES, false, 20, true));
    let parser = new Parser(RULES, {});

    printBNF(parser);

    testParseToken(parser, JSON.stringify(true, null, 2));



  testParseToken(parser, '"$(var)"', 'Interpolation');
  testParseToken(parser, '"$var"', 'Interpolation');
  testParseToken(parser, '"asd"', 'Interpolation');
  testParseToken(parser, '"asd$var"', 'Interpolation');
  testParseToken(parser, '"asd$(true)"', 'Interpolation');

  testParseToken(parser, 'true', 'Literal');
  testParseToken(parser, '123', 'Literal');
  testParseToken(parser, '"asd"', 'Literal');
  testParseToken(parser, 'null', 'Literal');
  testParseToken(parser, '|2016-01-01|', 'Literal');


  testParseToken(parser, 'true', 'Expression');
  testParseToken(parser, '123', 'Expression');
  testParseToken(parser, '"asd"', 'Expression');
  testParseToken(parser, 'null', 'Expression');
  testParseToken(parser, '|2016-01-01|', 'Expression');


  testParseToken(parser, 'teta()', 'FunctionCall');
  testParseToken(parser, 'teta(a)', 'FunctionCall');
  testParseToken(parser, 'teta(a, b)', 'FunctionCall');
  testParseToken(parser, 'teta(a, b)', 'Expression');
  testParseToken(parser, 'teta( a , b, "text", |2016-10-01|, null, false, "agus$interpolation", "string", "str\\$ing")', 'Expression');
  testParseToken(parser, 'teta(a(b()))', 'Expression');
  testParseToken(parser, 'teta(a(b()))', 'FunctionCall');
  testParseToken(parser, '"agus"', 'Expression');
  testParseToken(parser, '"agus$interpolation"', 'Expression');
  testParseToken(parser, '"$interpolation"', 'Expression');
  testParseToken(parser, '"agus$interpolation"', 'Interpolation');
  testParseToken(parser, '"$interpolation"', 'Interpolation');
  testParseToken(parser, '"agus\\$interpolation"', 'Expression');
  testParseToken(parser, '"\\$interpolation"', 'Expression');

  testParseToken(parser, '"$(var)"');
  testParseToken(parser, '"$var"');
  testParseToken(parser, '"asd"');
  testParseToken(parser, '"asd$var"');
  testParseToken(parser, '"asd$(true)"');

  testParseToken(parser, 'true');
  testParseToken(parser, '123');
  testParseToken(parser, '"asd"');
  testParseToken(parser, 'null');
  testParseToken(parser, '|2016-01-01|');


  testParseToken(parser, 'true');
  testParseToken(parser, '123');
  testParseToken(parser, '"asd"');
  testParseToken(parser, 'null');
  testParseToken(parser, '|2016-01-01|');


  testParseToken(parser, 'teta()');
  testParseToken(parser, 'teta(a)');
  testParseToken(parser, 'teta(a, b)');
  testParseToken(parser, 'teta(a, b)');
  testParseToken(parser, 'teta( a , b, "text", |2016-10-01|, null, false, "agus$interpolation", "string", "str\\$ing")');
  testParseToken(parser, 'teta(a(b()))');
  testParseToken(parser, 'teta(a(b()))');
  testParseToken(parser, '"agus"');
  testParseToken(parser, '"agus$interpolation"');
  testParseToken(parser, '"$interpolation"');
  testParseToken(parser, '"agus$interpolation"');
  testParseToken(parser, '"$interpolation"');
  testParseToken(parser, '"agus\\$interpolation"');
  testParseToken(parser, 'teta("hola $(false) $dia $(a(a))", a , b, "t$ext", |2016-10-01|, null, false, "agus$interpolation", "string", "str\$ing")');
  });
});