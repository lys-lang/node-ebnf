"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var lexer = dist_1.Grammars.W3C.RULES;
var parser = new dist_1.Parser(dist_1.Grammars.W3C.RULES, {});
TestHelpers_1.printBNF(parser);
parser.debug = true;
describe('Parse W3CEBNF', function () {
    var grammar = "\nGrammar ::= RULE_S* (Production RULE_S*)*\nProduction ::= NCName RULE_S* \"::=\" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* \"|\" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* RULE_EOL+ RULE_S*\nNCName ::= [a-zA-Z][a-zA-Z_0-9]*\nSequenceOrDifference ::= (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) RULE_Whitespace* (Minus (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?) | (RULE_Whitespace* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?)* )?\nMinus ::= \"-\"\nPrimaryDecoration ::= \"?\" | \"*\" | \"+\"\nSubItem ::= \"(\" RULE_Whitespace* (SequenceOrDifference (RULE_Whitespace* \"|\" RULE_Whitespace* SequenceOrDifference)* ) RULE_Whitespace* \")\"\nStringLiteral ::= '\"' [^\"]* '\"' | \"'\" [^']* \"'\"\nCharCode ::= \"#x\" [0-9a-zA-Z]+\nCharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | RULE_Char)+  \"]\"\nRULE_Char ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]\nCharRange ::= RULE_Char \"-\" RULE_Char\nCharCodeRange ::= CharCode \"-\" CharCode\nRULE_Whitespace ::= (#x09 | #x20)*  | Comment RULE_Whitespace*\nRULE_S ::= RULE_Whitespace RULE_S* | RULE_EOL RULE_S*\nComment ::= \"/*\" ([^*] | \"*\"+ [^/]*)*  \"*/\"\nRULE_EOL ::= #x0D #x0A | #x0A | #x0D\n  ";
    var lispParser;
    it('create parser', function () {
        lispParser = new dist_1.Parser(lexer, {});
        TestHelpers_1.printBNF(lispParser);
        TestHelpers_1.testParseToken(lispParser, grammar);
    });
    lispParser = new dist_1.Parser(lexer, {});
    // lispParser.debug = true;
    TestHelpers_1.testParseToken(lispParser, grammar);
    var ruleset = lispParser.getAST(grammar);
    var RULES = dist_1.Grammars.W3C.getRules(grammar);
    lispParser = new dist_1.Parser(RULES, {});
    lispParser.debug = true;
    TestHelpers_1.testParseToken(lispParser, grammar);
});
