"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
describe('Lookahead Negative', function () {
    var parser = new dist_1.Grammars.W3C.Parser("\n    Document ::= ((Boolean | IdentifieR) \" \"*)+\n    IdentifieR ::= [a-zA-Z]+\n    Boolean ::= (\"true\" | \"false\") !IdentifieR\n  ", {});
    TestHelpers_1.testParseToken(parser, 'keyword');
    TestHelpers_1.testParseToken(parser, 'true');
    TestHelpers_1.testParseToken(parser, 'false');
    TestHelpers_1.testParseToken(parser, 'trueAAA');
    TestHelpers_1.testParseToken(parser, 'falseaAAA');
    TestHelpers_1.testParseToken(parser, 'keyword a');
    TestHelpers_1.testParseToken(parser, 'true a');
    TestHelpers_1.testParseToken(parser, 'false a');
    TestHelpers_1.testParseToken(parser, 'trueAAA a');
    TestHelpers_1.testParseToken(parser, 'falseaAAA a');
    TestHelpers_1.testParseToken(parser, 'falseaAAA a');
});
describe('Lookahead Positive', function () {
    var parser = new dist_1.Grammars.W3C.Parser("\n    Document ::= ((FunctionName | Identifier | Parenthesis) \" \"*)+\n    Identifier ::= [a-zA-Z_]+\n    FunctionName ::= Identifier &\"(\"\n    Parenthesis ::= \"(\" (!\")\" [.])* \")\"\n  ", {});
    TestHelpers_1.testParseToken(parser, '()');
    TestHelpers_1.testParseToken(parser, 'hola');
    TestHelpers_1.testParseToken(parser, 'hola()');
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