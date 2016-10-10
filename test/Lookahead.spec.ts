declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF } from './TestHelpers';

let inspect = require('util').inspect;
let expect = require('expect');

describe('Lookahead Negative', () => {
  let parser = new Grammars.Custom.Parser(`
    Document ::= ((Boolean | IdentifieR) " "*)+
    IdentifieR ::= [a-zA-Z]+
    Boolean ::= ("true" | "false") !IdentifieR
  `, {});

  printBNF(parser);

  testParseToken(parser, 'keyword', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'true', 'Boolean', (doc) => {
    expect(doc.type).toEqual('Boolean');
  });
  testParseToken(parser, 'false', 'Boolean', (doc) => {
    expect(doc.type).toEqual('Boolean');
  });
  testParseToken(parser, 'true', null, (doc) => {
    expect(doc.children[0].type).toEqual('Boolean');
  });
  testParseToken(parser, 'false', null, (doc) => {
    expect(doc.children[0].type).toEqual('Boolean');
  });
  testParseToken(parser, 'trueAAA', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'falseaAAA', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
  });

  testParseToken(parser, 'keyword a', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'true a', null, (doc) => {
    expect(doc.children[0].type).toEqual('Boolean');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'false a', null, (doc) => {
    expect(doc.children[0].type).toEqual('Boolean');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'trueAAA a', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'falseaAAA a', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
  testParseToken(parser, 'falseaAAA a', null, (doc) => {
    expect(doc.children[0].type).toEqual('IdentifieR');
    expect(doc.children[1].type).toEqual('IdentifieR');
  });
});

describe('Lookahead Positive', () => {
  let parser = new Grammars.Custom.Parser(`
    Document ::= ((FunctionName | Identifier | Parenthesis) " "*)+
    Identifier ::= [a-zA-Z_]+
    FunctionName ::= Identifier &"("
    Parenthesis ::= "(" ( !")" [.])* ")"
  `, {});

  testParseToken(parser, '()', null, (doc) => {
    expect(doc.children[0].type).toEqual('Parenthesis');
  });
  testParseToken(parser, 'hola', null, (doc) => {
    expect(doc.children[0].type).toEqual('Identifier');
  });
  testParseToken(parser, 'hola()', null, (doc) => {
    expect(doc.children[0].type).toEqual('FunctionName');
    expect(doc.children[1].type).toEqual('Parenthesis');
  });
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