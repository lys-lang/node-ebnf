"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var expect = require('expect');
var grammar = "\n/* https://www.ietf.org/rfc/rfc4627.txt */\nvalue                ::= false | null | true | object | array | number | string\nBEGIN_ARRAY          ::= WS* #x5B WS*  /* [ left square bracket */\nBEGIN_OBJECT         ::= WS* #x7B WS*  /* { left curly bracket */\nEND_ARRAY            ::= WS* #x5D WS*  /* ] right square bracket */\nEND_OBJECT           ::= WS* #x7D WS*  /* } right curly bracket */\nNAME_SEPARATOR       ::= WS* #x3A WS*  /* : colon */\nVALUE_SEPARATOR      ::= WS* #x2C WS*  /* , comma */\nWS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */\nfalse                ::= \"false\"\nnull                 ::= \"null\"\ntrue                 ::= \"true\"\nobject               ::= BEGIN_OBJECT ([recover://OBJECT_RECOVERY] ([recover://OBJECT_RECOVERY] member (VALUE_SEPARATOR member)*)?) END_OBJECT\nOBJECT_RECOVERY      ::= \"}\" | COMMA_RECOVERY\nARRAY_RECOVERY       ::= \"]\" | COMMA_RECOVERY\nCOMMA_RECOVERY       ::= \",\"\nMEMBER_RECOVERY      ::= \":\"\nmember               ::= [recover://MEMBER_RECOVERY] string NAME_SEPARATOR ([recover://OBJECT_RECOVERY] value)\narray                ::= BEGIN_ARRAY ([recover://ARRAY_RECOVERY] value ([recover://ARRAY_RECOVERY] VALUE_SEPARATOR value)*)? END_ARRAY\n\nnumber                ::= \"-\"? (\"0\" | [1-9] [0-9]*) (\".\" [0-9]+)? ((\"e\" | \"E\") ( \"-\" | \"+\" )? (\"0\" | [1-9] [0-9]*))?\n\n/* STRINGS */\n\nstring                ::= '\"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '\"'\nHEXDIG                ::= [a-fA-F0-9]\n  ";
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
        parser.debug = true;
        TestHelpers_1.testParseTokenFailsafe(parser, '{"b": ZZZZ}', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '{"b": true ZZZZ }', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            // expect(doc.errors[0].token.type).toEqual('SyntaxError');
            // expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '{"b": ZZZZ, "c": true}', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '{"a":false,"b": ZZZZ,"list":[1,2,3,true]}', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
    });
});
//# sourceMappingURL=JSONRecovery.spec.js.map