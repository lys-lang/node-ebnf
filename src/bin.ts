#!/usr/bin/env node

console.log(`/* AUTO GENERATED CODE USING ebnf NPM MODULE ${new Date().toISOString()}`);

function printUsage() {
  console.error(`Usage:
  ebnf Grammar.ebnf >> myFile.js
       ^^^^^^^^^^^^ Source file`);
}

declare var process, require;

const path = require('path');
const fs = require('fs');
const util = require('util');

import { Grammars } from '.';

let source: string = process.argv[2];

if (!source || source.length == 0) {
  printUsage();
  throw new Error('You must provide a source file');
}

source = path.resolve(process.cwd(), source);

let sourceCode = fs.readFileSync(source).toString() + '\n';

let RULES = Grammars.Custom.getRules(sourceCode);

console.log(`*/

module.exports = ${util.inspect(RULES, false, 20, false)};`);
