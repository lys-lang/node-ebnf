"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var grammar = "\n/* https://www.ietf.org/rfc/rfc4627.txt */\nvalue                 ::= boolean | null | object | array | number | string\nRULE_beginArray       ::= RULE_ws* #x5B RULE_ws*  /* [ left square bracket */\nRULE_beginObject      ::= RULE_ws* #x7B RULE_ws*  /* { left curly bracket */\nRULE_endArray         ::= RULE_ws* #x5D RULE_ws*  /* ] right square bracket */\nRULE_endObject        ::= RULE_ws* #x7D RULE_ws*  /* } right curly bracket */\nRULE_nameSeparator    ::= RULE_ws* #x3A RULE_ws*  /* : colon */\nRULE_valueSeparator   ::= RULE_ws* #x2C RULE_ws*  /* , comma */\nRULE_ws               ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */\nboolean               ::= \"false\" | \"true\"\nnull                  ::= \"null\"\nobject                ::= RULE_beginObject (member (RULE_valueSeparator member)*)? RULE_endObject\nmember                ::= string RULE_nameSeparator value\narray                 ::= RULE_beginArray (value (RULE_valueSeparator value)*)? RULE_endArray\n\nnumber                ::= \"-\"? (\"0\" | [1-9] [0-9]*) (\".\" [0-9]+)? ((\"e\" | \"E\") ( \"-\" | \"+\" )? (\"0\" | [1-9] [0-9]*))?\n\n/* STRINGS */\n\nstring                ::= '\"' RULE_char* '\"'\nHEXDIG                ::= [a-fA-F0-9]\nRULE_char             ::= ([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG)\n  ";
describe('JSON 2', function () {
    describe('Parse JSON', function () {
        var parser;
        it('create parser', function () {
            parser = new dist_1.Parser(dist_1.Grammars.W3C.RULES, {});
            TestHelpers_1.testParseToken(parser, grammar);
        });
    });
    describe('Grammars.W3C parses JSON grammar', function () {
        var RULES = dist_1.Grammars.W3C.getRules(grammar);
        console.log('JSON:\n' + inspect(RULES, false, 20, true));
        var parser = new dist_1.Parser(RULES, {});
        TestHelpers_1.printBNF(parser);
        TestHelpers_1.testParseToken(parser, JSON.stringify(true));
        TestHelpers_1.testParseToken(parser, JSON.stringify(false));
        TestHelpers_1.testParseToken(parser, JSON.stringify(null));
        TestHelpers_1.testParseToken(parser, JSON.stringify(""));
        TestHelpers_1.testParseToken(parser, JSON.stringify("\""));
        TestHelpers_1.testParseToken(parser, JSON.stringify("\"{}"));
        TestHelpers_1.testParseToken(parser, JSON.stringify(10));
        TestHelpers_1.testParseToken(parser, JSON.stringify(-10));
        TestHelpers_1.testParseToken(parser, JSON.stringify(-10.1));
        TestHelpers_1.testParseToken(parser, JSON.stringify(10.1E123));
        TestHelpers_1.testParseToken(parser, JSON.stringify({}));
        TestHelpers_1.testParseToken(parser, JSON.stringify({ a: true }));
        TestHelpers_1.testParseToken(parser, JSON.stringify({ a: false }));
        TestHelpers_1.testParseToken(parser, JSON.stringify({
            a: false, b: "asd\n      asd ", list: [1, 2, 3, true]
        }));
        TestHelpers_1.testParseToken(parser, JSON.stringify([]));
        TestHelpers_1.testParseToken(parser, JSON.stringify([{}]));
        TestHelpers_1.testParseToken(parser, JSON.stringify([null, false]));
    });
});
//# sourceMappingURL=JSON2.spec.js.map