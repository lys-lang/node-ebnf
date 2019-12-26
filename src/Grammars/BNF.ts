// https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form

/*
syntax ::= RULE_EOL* rule+
rule ::= " "* "<" rule-name ">" " "* "::=" firstExpression otherExpression* " "* RULE_EOL+ " "*
firstExpression ::= " "* list
otherExpression ::= " "* "|" " "* list
RULE_EOL ::= "\r" | "\n"
list ::= term " "* list | term
term ::= literal | "<" rule-name ">"
literal ::= '"' RULE_CHARACTER1* '"' | "'" RULE_CHARACTER2* "'"
RULE_CHARACTER ::= " " | RULE_LETTER | RULE_DIGIT | RULE_SYMBOL
RULE_LETTER ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
RULE_DIGIT ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
RULE_SYMBOL ::= "-" | "_" | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | "<" | "=" | ">" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "`" | "{" | "|" | "}" | "~"
RULE_CHARACTER1 ::= RULE_CHARACTER | "'"
RULE_CHARACTER2 ::= RULE_CHARACTER | '"'
rule-name ::= RULE_LETTER RULE_CHAR*
RULE_CHAR ::= RULE_LETTER | RULE_DIGIT | "_" | "-"
*/

import { findChildrenByType } from '../SemanticHelpers';

import { IRule, Parser as _Parser, IToken } from '../Parser';
import { IGrammarParserOptions } from './types';

namespace BNF {
  export const RULES: IRule[] = [
    {
      name: 'syntax',
      bnf: [['RULE_EOL*', 'rule+']]
    },
    {
      name: 'rule',
      bnf: [
        [
          '" "*',
          '"<"',
          'rule-name',
          '">"',
          '" "*',
          '"::="',
          'firstExpression',
          'otherExpression*',
          '" "*',
          'RULE_EOL+',
          '" "*'
        ]
      ]
    },
    {
      name: 'firstExpression',
      bnf: [['" "*', 'list']]
    },
    {
      name: 'otherExpression',
      bnf: [['" "*', '"|"', '" "*', 'list']]
    },
    {
      name: 'RULE_EOL',
      bnf: [['"\\r"'], ['"\\n"']]
    },
    {
      name: 'list',
      bnf: [['term', '" "*', 'list'], ['term']]
    },
    {
      name: 'term',
      bnf: [['literal'], ['"<"', 'rule-name', '">"']]
    },
    {
      name: 'literal',
      bnf: [[`'"'`, 'RULE_CHARACTER1*', `'"'`], [`"'"`, 'RULE_CHARACTER2*', `"'"`]]
    },
    {
      name: 'RULE_CHARACTER',
      bnf: [['" "'], ['RULE_LETTER'], ['RULE_DIGIT'], ['RULE_SYMBOL']]
    },
    {
      name: 'RULE_LETTER',
      bnf: [
        ['"A"'],
        ['"B"'],
        ['"C"'],
        ['"D"'],
        ['"E"'],
        ['"F"'],
        ['"G"'],
        ['"H"'],
        ['"I"'],
        ['"J"'],
        ['"K"'],
        ['"L"'],
        ['"M"'],
        ['"N"'],
        ['"O"'],
        ['"P"'],
        ['"Q"'],
        ['"R"'],
        ['"S"'],
        ['"T"'],
        ['"U"'],
        ['"V"'],
        ['"W"'],
        ['"X"'],
        ['"Y"'],
        ['"Z"'],
        ['"a"'],
        ['"b"'],
        ['"c"'],
        ['"d"'],
        ['"e"'],
        ['"f"'],
        ['"g"'],
        ['"h"'],
        ['"i"'],
        ['"j"'],
        ['"k"'],
        ['"l"'],
        ['"m"'],
        ['"n"'],
        ['"o"'],
        ['"p"'],
        ['"q"'],
        ['"r"'],
        ['"s"'],
        ['"t"'],
        ['"u"'],
        ['"v"'],
        ['"w"'],
        ['"x"'],
        ['"y"'],
        ['"z"']
      ]
    },
    {
      name: 'RULE_DIGIT',
      bnf: [['"0"'], ['"1"'], ['"2"'], ['"3"'], ['"4"'], ['"5"'], ['"6"'], ['"7"'], ['"8"'], ['"9"']]
    },
    {
      name: 'RULE_SYMBOL',
      bnf: [
        ['"-"'],
        ['"_"'],
        ['"!"'],
        ['"#"'],
        ['"$"'],
        ['"%"'],
        ['"&"'],
        ['"("'],
        ['")"'],
        ['"*"'],
        ['"+"'],
        ['","'],
        ['"-"'],
        ['"."'],
        ['"/"'],
        ['":"'],
        ['";"'],
        ['"<"'],
        ['"="'],
        ['">"'],
        ['"?"'],
        ['"@"'],
        ['"["'],
        ['"\\"'],
        ['"]"'],
        ['"^"'],
        ['"_"'],
        ['"`"'],
        ['"{"'],
        ['"|"'],
        ['"}"'],
        ['"~"']
      ]
    },
    {
      name: 'RULE_CHARACTER1',
      bnf: [['RULE_CHARACTER'], [`"'"`]]
    },
    {
      name: 'RULE_CHARACTER2',
      bnf: [['RULE_CHARACTER'], [`'"'`]]
    },
    {
      name: 'rule-name',
      bnf: [['RULE_LETTER', 'RULE_CHAR*']]
    },
    {
      name: 'RULE_CHAR',
      bnf: [['RULE_LETTER'], ['RULE_DIGIT'], ['"_"'], ['"-"']]
    }
  ];

  export const defaultParser = new _Parser(RULES, { debug: false });

  function getAllTerms(expr: IToken): string[] {
    let terms = findChildrenByType(expr, 'term').map(term => {
      return findChildrenByType(term, 'literal').concat(findChildrenByType(term, 'rule-name'))[0].text;
    });

    findChildrenByType(expr, 'list').forEach(expr => {
      terms = terms.concat(getAllTerms(expr));
    });

    return terms;
  }

  export function getRules(source: string, parser: _Parser = defaultParser): IRule[] {
    let ast = parser.getAST(source);

    if (!ast) throw new Error('Could not parse ' + source);

    if (ast.errors && ast.errors.length) {
      throw ast.errors[0];
    }

    let rules = findChildrenByType(ast, 'rule');

    let ret = rules.map(rule => {
      let name = findChildrenByType(rule, 'rule-name')[0].text;

      let expressions = findChildrenByType(rule, 'firstExpression').concat(findChildrenByType(rule, 'otherExpression'));

      let bnf = [];

      expressions.forEach(expr => {
        bnf.push(getAllTerms(expr));
      });

      return {
        name: name,
        bnf
      };
    });

    if (!ret.some(x => x.name == 'EOL')) {
      ret.push({
        name: 'EOL',
        bnf: [['"\\r\\n"', '"\\r"', '"\\n"']]
      });
    }

    return ret;
  }

  export function Transform(source: TemplateStringsArray, subParser: _Parser = defaultParser): IRule[] {
    return getRules(source.join(''), subParser);
  }

  export class Parser extends _Parser {
    private readonly source: string;
    constructor(source: string, options?: Partial<IGrammarParserOptions>) {
      const subParser = options && options.debugRulesParser === true ? new _Parser(BNF.RULES, { debug: true }) : defaultParser;
      super(getRules(source, subParser), options);
      this.source = source;
    }

    emitSource(): string {
      return this.source;
    }
  }
}

export default BNF;
