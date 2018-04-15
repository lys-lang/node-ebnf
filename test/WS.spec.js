"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dist_1 = require("../dist");
var TestHelpers_1 = require("./TestHelpers");
var inspect = require('util').inspect;
var grammar = "\n{ ws=implicit }\n/* https://www.ietf.org/rfc/rfc4627.txt */\nvalue                ::= false | null | true | object | array | number | string\nBEGIN_ARRAY          ::= #x5B  /* [ left square bracket */\nBEGIN_OBJECT         ::= #x7B  /* { left curly bracket */\nEND_ARRAY            ::= #x5D  /* ] right square bracket */\nEND_OBJECT           ::= #x7D  /* } right curly bracket */\nNAME_SEPARATOR       ::= #x3A  /* : colon */\nVALUE_SEPARATOR      ::= #x2C  /* , comma */\nWS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */\nfalse                ::= \"false\"\nnull                 ::= \"null\"\ntrue                 ::= \"true\"\nobject               ::= BEGIN_OBJECT (member (VALUE_SEPARATOR member)*)? END_OBJECT\nmember               ::= string NAME_SEPARATOR value\narray                ::= BEGIN_ARRAY (value (VALUE_SEPARATOR value)*)? END_ARRAY\n\nnumber                ::= \"-\"? (\"0\" | [1-9] [0-9]*) (\".\" [0-9]+)? ((\"e\" | \"E\") ( \"-\" | \"+\" )? (\"0\" | [1-9] [0-9]*))? {ws=explicit}\n\n/* STRINGS */\n\nstring                ::= '\"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '\"' {ws=explicit}\nHEXDIG                ::= [a-fA-F0-9] {ws=explicit}\n  ";
describe('WS', function () {
    describe('Parse JSON', function () {
        var parser;
        it('create parser', function () {
            parser = new dist_1.Parser(dist_1.Grammars.Custom.RULES, {});
            TestHelpers_1.testParseToken(parser, grammar);
        });
    });
    describe('Grammars.W3C parses JSON grammar', function () {
        var RULES = dist_1.Grammars.Custom.getRules(grammar);
        console.log('JSON:\n' + inspect(RULES, false, 20, true));
        var parser = new dist_1.Parser(RULES, {});
        TestHelpers_1.printBNF(parser);
        TestHelpers_1.testParseToken(parser, JSON.stringify(true, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(false, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(null, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify("", null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify("\"", null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify("\"{}", null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(10, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(-10, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(-10.1, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify(10.1E123, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify({}, null, 2));
        TestHelpers_1.testParseToken(parser, '{  "a": true       }');
        TestHelpers_1.testParseToken(parser, JSON.stringify({ a: false }, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify({
            a: false, b: "asd\n      asd ", list: [1, 2, 3, true]
        }, null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify([]));
        TestHelpers_1.testParseToken(parser, JSON.stringify([{}], null, 2));
        TestHelpers_1.testParseToken(parser, JSON.stringify([null, false], null, 2));
    });
});
//# sourceMappingURL=WS.spec.js.map