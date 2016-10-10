"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var expect = require('expect');
var grammar = "\n/* https://www.ietf.org/rfc/rfc4627.txt */\nvalue                ::= false | null | true | object | number | string | array\nBEGIN_ARRAY          ::= WS* #x5B WS*  /* [ left square bracket */\nBEGIN_OBJECT         ::= WS* #x7B WS*  /* { left curly bracket */\nEND_ARRAY            ::= WS* #x5D WS*  /* ] right square bracket */\nEND_OBJECT           ::= WS* #x7D WS*  /* } right curly bracket */\nNAME_SEPARATOR       ::= WS* #x3A WS*  /* : colon */\nVALUE_SEPARATOR      ::= WS* #x2C WS*  /* , comma */\nWS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */\nfalse                ::= \"false\"\nnull                 ::= \"null\"\ntrue                 ::= \"true\"\nobject               ::= BEGIN_OBJECT object_content? END_OBJECT\nobject_content       ::= (member (VALUE_SEPARATOR member)*) { recoverUntil=END_OBJECT }\nKey                  ::= string { recoverUntil = NAME_SEPARATOR }\nOBJECT_RECOVERY      ::= END_OBJECT | VALUE_SEPARATOR\nARRAY_RECOVERY       ::= END_ARRAY | VALUE_SEPARATOR\nmember               ::= Key NAME_SEPARATOR value { recoverUntil=OBJECT_RECOVERY }\narray                ::= BEGIN_ARRAY array_content? END_ARRAY\narray_content        ::= array_value (VALUE_SEPARATOR array_value)* { recoverUntil=ARRAY_RECOVERY,fragment=true }\narray_value          ::= value { recoverUntil=ARRAY_RECOVERY, fragment=true }\n\nnumber               ::= \"-\"? (\"0\" | [1-9] [0-9]*) (\".\" [0-9]+)? ((\"e\" | \"E\") ( \"-\" | \"+\" )? (\"0\" | [1-9] [0-9]*))?\n\n/* STRINGS */\n\nstring                ::= '\"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '\"'\nHEXDIG                ::= [a-fA-F0-9]\n  ";
describe('JSON 2', function () {
    describe('Parse JSON', function () {
        var parser;
        it('create parser', function () {
            TestHelpers_1.printBNF(dist_1.Grammars.Custom.parser);
            // console.dir(Grammars.Custom.parser.getAST(grammar));
        });
    });
    describe('Grammars.Custom parses JSON grammar', function () {
        var parser = new dist_1.Grammars.Custom.Parser(grammar, {});
        TestHelpers_1.printBNF(parser);
        TestHelpers_1.testParseTokenFailsafe(parser, '{"b": ZZZZ}', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '[ZZZZ]', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '[1, ZZZZ]', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '[1, ZZZZ, 1]', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
        });
        TestHelpers_1.testParseTokenFailsafe(parser, '[ZZZZ, 1]', null, function (doc) {
            expect(doc.errors.length).toEqual(1);
            expect(doc.errors[0].token.type).toEqual('SyntaxError');
            expect(doc.errors[0].token.text).toEqual('ZZZZ');
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