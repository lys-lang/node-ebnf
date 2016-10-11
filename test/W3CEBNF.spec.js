"use strict";
var dist_1 = require('../dist');
var TestHelpers_1 = require('./TestHelpers');
var inspect = require('util').inspect;
var grammar = "\nGrammar ::= RULE_S* (Production RULE_S*)*  EOF\nProduction ::= NCName RULE_S* \"::=\" RULE_WHITESPACE* Choice RULE_WHITESPACE* RULE_EOL+ RULE_S*\nNCName ::= [a-zA-Z][a-zA-Z_0-9]*\nChoice ::= SequenceOrDifference (RULE_WHITESPACE* \"|\" RULE_WHITESPACE* SequenceOrDifference)*\nSequenceOrDifference ::= Item RULE_WHITESPACE* (Minus Item | Item*)?\nMinus ::= \"-\"\nItem ::= RULE_WHITESPACE* (NCName | StringLiteral | CharCode | CharClass | SubItem) PrimaryDecoration?\nPrimaryDecoration ::= \"?\" | \"*\" | \"+\"\nDecorationName ::= \"ebnf://\" [^#x5D#]+\nSubItem ::= \"(\" RULE_WHITESPACE* Choice RULE_WHITESPACE* \")\"\nStringLiteral ::= '\"' [^\"]* '\"' | \"'\" [^']* \"'\"\nCharCode ::= \"#x\" [0-9a-zA-Z]+\nCharClass ::= '[' '^'? (CharCodeRange | CharRange | CharCode | RULE_Char)+  \"]\"\nRULE_Char ::= #x09 | #x0A | #x0D | [#x20-#x5c] | [#x5e-#xD7FF] | [#xE000-#xFFFD]\nCharRange ::= RULE_Char \"-\" RULE_Char\nCharCodeRange ::= CharCode \"-\" CharCode\nRULE_WHITESPACE ::= (#x09 | #x20)*  | Comment RULE_WHITESPACE*\nRULE_S ::= RULE_WHITESPACE RULE_S* | RULE_EOL RULE_S*\nComment ::= \"/*\" ( [^*])*  \"*/\"\nRULE_EOL ::= #x0D #x0A | #x0A | #x0D\nLink ::= '[' Url ']'\nUrl ::= [^#x5D:/?#] \"://\" [^#x5D#]+ (\"#\" NCName)?\n  ";
describe('Parse W3CEBNF', function () {
    var parser;
    it('create parser', function () {
        parser = new dist_1.Parser(dist_1.Grammars.W3C.RULES, {});
        TestHelpers_1.testParseToken(parser, grammar);
        console.log('W3C PARSER', dist_1.Grammars.W3C.emit(parser));
        TestHelpers_1.printBNF(parser);
    });
});
describe('Grammars.W3C parses itself', function () {
    var RULES = dist_1.Grammars.W3C.getRules(grammar);
    var parser = new dist_1.Parser(RULES, {});
    TestHelpers_1.testParseToken(parser, grammar);
});
//# sourceMappingURL=W3CEBNF.spec.js.map