"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var expect = require('expect');
describe('EOF', function () {
    var parser = new dist_1.Grammars.Custom.Parser("\nRule ::= Item* EOF\nItem ::= Space? Rules {recoverUntil=Space, fragment=true}\nRules ::= \"true\" | \"false\"\nSpace ::= \" \"+ | EOF\n", {});
    TestHelpers_1.testParseTokenFailsafe(parser, 'true', null, function (doc) {
        expect(doc.errors.length).toEqual(0);
    });
    TestHelpers_1.testParseTokenFailsafe(parser, 'true false true', null, function (doc) {
        expect(doc.errors.length).toEqual(0);
    });
});
describe('EOF1', function () {
    var parser = new dist_1.Grammars.Custom.Parser("\nRule ::= Rules EOF {pin=1}\nRules ::= \"true\" | \"false\"\n", {});
    TestHelpers_1.testParseTokenFailsafe(parser, 'true', null, function (doc) {
        expect(doc.errors.length).toEqual(0);
    });
    TestHelpers_1.testParseTokenFailsafe(parser, 'true false true', null, function (doc) {
        expect(doc.errors.length).toEqual(1);
    });
});
//# sourceMappingURL=EOF.spec.js.map