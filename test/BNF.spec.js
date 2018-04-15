"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dist_1 = require("../dist");
var TestHelpers_1 = require("./TestHelpers");
var inspect = require('util').inspect;
var lexer = dist_1.Grammars.BNF.RULES;
var parser = new dist_1.Parser(dist_1.Grammars.BNF.RULES, {});
TestHelpers_1.printBNF(parser);
parser.debug = true;
describe('Parse BNF', function () {
    var lisp = "\n    <lisp-document>  ::= <s_expression> <lisp-document> | <RULE_WHITESPACE> | <s_expression> <EOF> | <EOF>\n    <s_expression>   ::= <atomic_symbol> | \"(\" <s_expression> \".\" <s_expression> \")\" | <list>\n    <list1>          ::= <RULE_WHITESPACE> <s_expression> <RULE_WHITESPACE> <list1> | <RULE_WHITESPACE> <s_expression>\n    <RULE_WHITESPACE>::= <RULE_WS> | \"\"\n    <RULE_WS>        ::= \" \" <RULE_WS> | <EOL> <RULE_WS>| \" \" | <EOL>\n    <list>           ::= \"(\" <s_expression> <list1> \")\"\n    <atomic_symbol>  ::= \"+\" | \"*\" | \"=\" | \"/\" | <RULE_LETTER> <RULE_ATOM_PART> | <RULE_LETTER>\n    <RULE_ATOM_PART> ::= <RULE_LETTER> <RULE_ATOM_PART> | <RULE_NUMBER> <RULE_ATOM_PART> | <RULE_LETTER> | <RULE_NUMBER>\n    <RULE_LETTER>    ::= \"a\" | \"b\" | \"c\" | \"d\" | \"e\" | \"f\" | \"g\" | \"h\" | \"i\" | \"j\" | \"k\" | \"l\" | \"m\" | \"n\" | \"o\" | \"p\" | \"q\" | \"r\" | \"s\" | \"t\" | \"u\" | \"v\" | \"w\" | \"x\" | \"y\" | \"z\"\n    <RULE_NUMBER>    ::= \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\" | \"0\"\n  ";
    var lispParser;
    it('creates a LISP parser', function () {
        lispParser = new dist_1.Grammars.BNF.Parser(lisp, {});
        TestHelpers_1.printBNF(lispParser);
    });
    lispParser = new dist_1.Grammars.BNF.Parser(lisp, {});
    TestHelpers_1.testParseToken(lispParser, 'test');
    TestHelpers_1.testParseToken(lispParser, '(test a)');
});
describe('Parse custom calculator', function () {
    var calc = "\n    <Document>         ::= <Equation> <EOF>\n    <Equation>         ::= <BinaryOperation> | <Term>\n    <Term>             ::= \"(\" <RULE_WHITESPACE> <Equation> <RULE_WHITESPACE> \")\" | \"(\" <RULE_WHITESPACE> <Number> <RULE_WHITESPACE> \")\" | <RULE_WHITESPACE> <Number> <RULE_WHITESPACE>\n    <BinaryOperation>  ::= <Term> <RULE_WHITESPACE> <Operator> <RULE_WHITESPACE> <Term>\n\n    <Number>           ::= <RULE_NEGATIVE> <RULE_NON_ZERO> <RULE_NUMBER_LIST> | <RULE_NON_ZERO> <RULE_NUMBER_LIST> | <RULE_DIGIT>\n    <Operator>         ::= \"+\" | \"-\" | \"*\" | \"/\" | \"^\"\n\n    <RULE_NUMBER_LIST> ::= <RULE_DIGIT> <RULE_NUMBER_LIST> | <RULE_DIGIT>\n    <RULE_NEGATIVE>    ::= \"-\"\n    <RULE_NON_ZERO>    ::= \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\"\n    <RULE_DIGIT>       ::= \"0\" | <RULE_NON_ZERO>\n    <RULE_WHITESPACE>  ::= <RULE_WS> | \"\"\n    <RULE_WS>          ::= \" \" <RULE_WHITESPACE> | <EOL> <RULE_WHITESPACE> | \" \" | <EOL>\n  ";
    var calcuParser;
    it('creates a calculator parser', function () {
        calcuParser = new dist_1.Grammars.BNF.Parser(calc, {});
        TestHelpers_1.printBNF(calcuParser);
    });
    calcuParser = new dist_1.Grammars.BNF.Parser(calc, {});
    TestHelpers_1.testParseToken(calcuParser, '1');
    TestHelpers_1.testParseToken(calcuParser, '0');
    TestHelpers_1.testParseToken(calcuParser, '(1)');
    TestHelpers_1.testParseToken(calcuParser, '-122 + 2');
    TestHelpers_1.testParseToken(calcuParser, '(2 + 212312)');
    TestHelpers_1.testParseToken(calcuParser, '(2123 + 23332) * 11312');
    TestHelpers_1.testParseToken(calcuParser, '(2 + 2) * (5)');
    TestHelpers_1.testParseToken(calcuParser, '(2 + (2 * -123)) * 5332');
});
//# sourceMappingURL=BNF.spec.js.map