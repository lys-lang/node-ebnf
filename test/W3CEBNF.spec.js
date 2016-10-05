"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var grammar = "\nGrammar ::= RULE_S* (Production RULE_S*)*\nProduction ::= NCName RULE_S* \"::=\" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* \"|\" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* RULE_EOL+ RULE_S*\nNCName ::= [a-zA-Z][a-zA-Z_0-9]*\nSequenceOrDifference ::= (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) RULE_Whitespace* (Minus (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) | (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?)* )?\nMinus ::= \"-\"\nPrimaryDecoration ::= \"?\" | \"*\" | \"+\"\nSubItem ::= \"(\" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* \"|\" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* \")\"\nStringLiteral ::= '\"' [^\"]* '\"' | \"'\" [^']* \"'\"\nCharCode ::= \"#x\" [0-9a-zA-Z]+\nCharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | RULE_Char)+  \"]\"\nRULE_Char ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]\nCharRange ::= RULE_Char \"-\" RULE_Char\nCharCodeRange ::= CharCode \"-\" CharCode /* comentarios */\nRULE_Whitespace ::= (#x09 | #x20)*  | Comment RULE_Whitespace*\nRULE_S ::= RULE_Whitespace RULE_S* | RULE_EOL RULE_S*\nComment ::= \"/*\" ([^*] | \"*\"+ [^/]*)*  \"*/\"\nRULE_EOL ::= #x0D #x0A | #x0A | #x0D\n  ";
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