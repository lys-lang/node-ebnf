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
    console.log(inspect(ruleset, false, 20, true));
    var RULES = [];
    var subitems = 0;
    function restar(total, resta) {
        console.log('reberia restar ' + inspect(resta) + ' a ' + inspect(total));
    }
    function convertRegex(txt) {
        return new RegExp(txt
            .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
            .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
            .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
            .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1'));
    }
    function getSubItems(RULES, seq, parent, parentName) {
        var anterior = null;
        var bnfSeq = [];
        seq.children.forEach(function (x, i) {
            if (x.type == 'Minus') {
                restar(anterior, x);
            }
            else {
            }
            var decoration = seq.children[i + 1];
            decoration = decoration && decoration.type == 'PrimaryDecoration' && decoration.text || '';
            switch (x.type) {
                case 'SubItem':
                    var name_1 = '%' + (parentName + (subitems++));
                    createRule(RULES, x, name_1);
                    bnfSeq.push(name_1 + decoration);
                    break;
                case 'NCName':
                case 'StringLiteral':
                    bnfSeq.push(x.text + decoration);
                    break;
                case 'CharCode':
                case 'CharClass':
                    bnfSeq.push(convertRegex(x.text + decoration));
                    break;
                case 'PrimaryDecoration':
                    break;
                default:
                    console.log('  ' + inspect(x, false, 2, true));
            }
            anterior = x;
        });
        return bnfSeq;
    }
    function createRule(RULES, token, name) {
        console.log(name);
        var bnf = token.children.filter(function (x) { return x.type == 'SequenceOrDifference'; }).map(function (s) { return getSubItems(RULES, s, token, name); });
        var rule = {
            name: name,
            bnf: bnf
        };
        RULES.push(rule);
    }
    var rules = ruleset.children
        .filter(function (x) { return x.type == 'Production'; })
        .map(function (x) {
        var name = x.children.filter(function (x) { return x.type == 'NCName'; })[0].text;
        createRule(RULES, x, name);
    });
    console.log(inspect(RULES, false, 20, true));
    lispParser = new dist_1.Parser(RULES, {});
    lispParser.debug = true;
    TestHelpers_1.testParseToken(lispParser, grammar);
});
