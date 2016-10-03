declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;

let lexer = Grammars.BNF.RULES;
let parser = new Parser(Grammars.BNF.RULES, {});

printBNF(parser);

parser.debug = true;

describe('Parse BNF', () => {
  let lisp = `
    <lisp-document>  ::= <s_expression> <lisp-document> | <RULE_WHITESPACE> <lisp-document> | <s_expression>
    <s_expression>   ::= <atomic_symbol> | "(" <s_expression> "." <s_expression> ")" | <list>
    <list1>          ::= <RULE_WHITESPACE> <s_expression> <RULE_WHITESPACE> <list1> | <RULE_WHITESPACE> <s_expression>
    <RULE_WHITESPACE>::= <RULE_WS> | ""
    <RULE_WS>        ::= " " <RULE_WS> | <EOL> <RULE_WS>| " " | <EOL>
    <list>           ::= "(" <s_expression> <list1> ")"
    <atomic_symbol>  ::= "+" | "*" | "=" | "/" | <RULE_LETTER> <RULE_ATOM_PART> | <RULE_LETTER>
    <RULE_ATOM_PART> ::= <RULE_LETTER> <RULE_ATOM_PART> | <RULE_NUMBER> <RULE_ATOM_PART> | <RULE_LETTER> | <RULE_NUMBER>
    <RULE_LETTER>    ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
    <RULE_NUMBER>    ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
  `;

  let lispParser: Parser;

  it('creates a LISP parser', () => {
    lispParser = new Grammars.BNF.Parser(lisp, {});

    printBNF(lispParser);
  });

  lispParser = new Grammars.BNF.Parser(lisp, {});

  testParseToken(lispParser, 'test');
  testParseToken(lispParser, '(test a)');
});



describe('Parse custom calculator', () => {
  let calc = `
    <Equation>         ::= <BinaryOperation> | <Term>
    <Term>             ::= "(" <RULE_WHITESPACE> <BinaryOperation> <RULE_WHITESPACE> ")" | "(" <RULE_WHITESPACE> <Number> <RULE_WHITESPACE> ")" | <RULE_WHITESPACE> <Number> <RULE_WHITESPACE>
    <BinaryOperation>  ::= <Term> <RULE_WHITESPACE> <Operator> <RULE_WHITESPACE> <Term>

    <Number>           ::= <RULE_NEGATIVE> <RULE_NON_ZERO> <RULE_NUMBER_LIST> | <RULE_NON_ZERO> <RULE_NUMBER_LIST> | <RULE_DIGIT>
    <Operator>         ::= "+" | "-" | "*" | "/" | "^"

    <RULE_NUMBER_LIST> ::= <RULE_DIGIT> <RULE_NUMBER_LIST> | <RULE_DIGIT>
    <RULE_NEGATIVE>    ::= "-"
    <RULE_NON_ZERO>    ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    <RULE_DIGIT>       ::= "0" | <RULE_NON_ZERO>
    <RULE_WHITESPACE>  ::= <RULE_WS> | ""
    <RULE_WS>          ::= " " <RULE_WHITESPACE> | <EOL> <RULE_WHITESPACE> | " " | <EOL>
  `;

  let calcuParser: Parser;

  it('creates a calculator parser', () => {
    calcuParser = new Grammars.BNF.Parser(calc, {});

    printBNF(calcuParser);
  });

  calcuParser = new Grammars.BNF.Parser(calc, {});

  testParseToken(calcuParser, '1');
  testParseToken(calcuParser, '0');
  testParseToken(calcuParser, '(1)');
  testParseToken(calcuParser, '-122 + 2');
  testParseToken(calcuParser, '(2 + 212312)');
  testParseToken(calcuParser, '(2123 + 23332) * 11312');
  testParseToken(calcuParser, '(2 + 2) * (5)');
  testParseToken(calcuParser, '(2 + (2 * -123)) * 5332');
});