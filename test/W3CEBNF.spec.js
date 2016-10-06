"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var grammar = "\nGrammar ::= S* (Production S*)*\nProduction ::= NCName S* \"::=\" WS* (SequenceOrDifference (WS* \"|\" WS* SequenceOrDifference)* ) WS* EOL+ S*\nNCName ::= [a-zA-Z][a-zA-Z_0-9]*\nSequenceOrDifference ::= (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) WS* (Minus (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) | (WS* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?)* )?\nMinus ::= \"-\"\nPrimaryDecoration ::= \"?\" | \"*\" | \"+\"\nSubItem ::= \"(\" WS* (SequenceOrDifference (WS* \"|\" WS* SequenceOrDifference)* ) WS* \")\"\nStringLiteral ::= '\"' [^\"]* '\"' | \"'\" [^']* \"'\"\nCharCode ::= \"#x\" [0-9a-zA-Z]+\nCharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | CHAR)+  \"]\"\nCHAR ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]\nCharRange ::= CHAR \"-\" CHAR\nCharCodeRange ::= CharCode \"-\" CharCode /* comentarios */\nWS ::= (#x09 | #x20)*  | Comment WS*\nS ::= WS S* | EOL S*\nComment ::= \"/*\" ([^*] | \"*\"+ [^/]*)*  \"*/\"\nEOL ::= #x0D #x0A | #x0A | #x0D\n  ";
describe('Parse W3CEBNF', function () {
    var parser;
    it('create parser', function () {
        parser = new dist_1.Parser(dist_1.Grammars.W3C.RULES, {});
        TestHelpers_1.testParseToken(parser, grammar);
    });
});
describe('Grammars.W3C parses itself', function () {
    var parser = new dist_1.Parser(dist_1.Grammars.W3C.RULES, {});
    var RULES = dist_1.Grammars.W3C.getRules(grammar);
    parser = new dist_1.Parser(RULES, {});
    TestHelpers_1.testParseToken(parser, grammar);
});
//# sourceMappingURL=W3CEBNF.spec.js.map