declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;

describe('Lookahead Negative', () => {
  let parser = new Grammars.W3C.Parser(`
    Document ::= ((Boolean | IdentifieR) " "*)+
    IdentifieR ::= [a-zA-Z]+
    Boolean ::= ("true" | "false") !IdentifieR
  `, {});

  testParseToken(parser, 'keyword');
  testParseToken(parser, 'true');
  testParseToken(parser, 'false');
  testParseToken(parser, 'trueAAA');
  testParseToken(parser, 'falseaAAA');

  testParseToken(parser, 'keyword a');
  testParseToken(parser, 'true a');
  testParseToken(parser, 'false a');
  testParseToken(parser, 'trueAAA a');
  testParseToken(parser, 'falseaAAA a');
  testParseToken(parser, 'falseaAAA a');
});

describe('Lookahead Positive', () => {
  let parser = new Grammars.W3C.Parser(`
    Document ::= ((FunctionName | Identifier | Parenthesis) " "*)+
    Identifier ::= [a-zA-Z_]+
    FunctionName ::= Identifier &"("
    Parenthesis ::= "(" (!")" [.])* ")"
  `, {});

  testParseToken(parser, '()');
  testParseToken(parser, 'hola');
  testParseToken(parser, 'hola()');
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