declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseTokenFailsafe, describeTree, printBNF, testParseToken } from './TestHelpers';

let inspect = require('util').inspect;
let expect = require('expect');

describe('EOF', function () {
  let parser = new Grammars.Custom.Parser(`
Rule ::= Item* EOF
Item ::= Space? Rules {recoverUntil=Space, fragment=true}
Rules ::= "true" | "false"
Space ::= " "+ | EOF
`, {});

  testParseTokenFailsafe(parser, 'true', null, (doc) => {
    expect(doc.errors.length).toEqual(0);
  });

  testParseTokenFailsafe(parser, 'true false true', null, (doc) => {
    expect(doc.errors.length).toEqual(0);
  });
});

describe('EOF1', function () {
  let parser = new Grammars.Custom.Parser(`
Rule ::= Rules EOF {pin=1}
Rules ::= "true" | "false"
`, {});

  testParseTokenFailsafe(parser, 'true', null, (doc) => {
    expect(doc.errors.length).toEqual(0);
  });

  testParseTokenFailsafe(parser, 'true false true', null, (doc) => {
    expect(doc.errors.length).toEqual(1);
  });
});