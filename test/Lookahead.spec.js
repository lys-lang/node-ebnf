"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var expect = require('expect');
describe('Lookahead Negative', function () {
    var parser = new dist_1.Grammars.W3C.Parser("\n    Document ::= ((Boolean | IdentifieR) \" \"*)+\n    IdentifieR ::= [a-zA-Z]+\n    Boolean ::= (\"true\" | \"false\") [ebnf://not]IdentifieR\n  ", {});
    TestHelpers_1.printBNF(parser);
    TestHelpers_1.testParseToken(parser, 'keyword', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'true', 'Boolean', function (doc) {
        expect(doc.type).toEqual('Boolean');
    });
    TestHelpers_1.testParseToken(parser, 'false', 'Boolean', function (doc) {
        expect(doc.type).toEqual('Boolean');
    });
    TestHelpers_1.testParseToken(parser, 'true', null, function (doc) {
        expect(doc.children[0].type).toEqual('Boolean');
    });
    TestHelpers_1.testParseToken(parser, 'false', null, function (doc) {
        expect(doc.children[0].type).toEqual('Boolean');
    });
    TestHelpers_1.testParseToken(parser, 'trueAAA', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'falseaAAA', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'keyword a', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'true a', null, function (doc) {
        expect(doc.children[0].type).toEqual('Boolean');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'false a', null, function (doc) {
        expect(doc.children[0].type).toEqual('Boolean');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'trueAAA a', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'falseaAAA a', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
    TestHelpers_1.testParseToken(parser, 'falseaAAA a', null, function (doc) {
        expect(doc.children[0].type).toEqual('IdentifieR');
        expect(doc.children[1].type).toEqual('IdentifieR');
    });
});
describe('Lookahead Positive', function () {
    var parser = new dist_1.Grammars.W3C.Parser("\n    Document ::= ((FunctionName | Identifier | Parenthesis) \" \"*)+\n    Identifier ::= [a-zA-Z_]+\n    FunctionName ::= Identifier [ebnf://expect]\"(\"\n    Parenthesis ::= \"(\" ( [ebnf://not]\")\" [.])* \")\"\n  ", {});
    TestHelpers_1.testParseToken(parser, '()', null, function (doc) {
        expect(doc.children[0].type).toEqual('Parenthesis');
    });
    TestHelpers_1.testParseToken(parser, 'hola', null, function (doc) {
        expect(doc.children[0].type).toEqual('Identifier');
    });
    TestHelpers_1.testParseToken(parser, 'hola()', null, function (doc) {
        expect(doc.children[0].type).toEqual('FunctionName');
        expect(doc.children[1].type).toEqual('Parenthesis');
    });
});
// describe('Empty', () => {
//   let parser = new Grammars.W3C.Parser(`
//     TextAndEmpty ::= "hi" ""
//   `, {});
//   console.log('TextAndEmpty:\n' + inspect(parser.grammarRules, false, 20, true));
//   printBNF(parser);
//   parser.debug = true;
//   testParseToken(parser, 'hi');
// }); 
//# sourceMappingURL=Lookahead.spec.js.map