// https://www.w3.org/TR/REC-xml/#NT-Name
// http://www.bottlecaps.de/rr/ui

// Grammar	::=	Production*
// Production	::=	NCName '::=' Choice
// NCName	::=	[http://www.w3.org/TR/xml-names/#NT-NCName]
// Choice	::=	SequenceOrDifference ( '|' SequenceOrDifference )*
// SequenceOrDifference	::=	(Item ( '-' Item | Item* ))?
// Item	::=	Primary ( '?' | '*' | '+' )?
// Primary	::=	NCName | StringLiteral | CharCode | CharClass | '(' Choice ')'
// StringLiteral	::=	'"' [^"]* '"' | "'" [^']* "'"
// CharCode	::=	'#x' [0-9a-fA-F]+
// CharClass	::=	'[' '^'? ( RULE_Char | CharCode | CharRange | CharCodeRange )+ ']'
// RULE_Char	::=	[http://www.w3.org/TR/xml#NT-RULE_Char]
// CharRange	::=	RULE_Char '-' ( RULE_Char - ']' )
// CharCodeRange	::=	CharCode '-' CharCode
// RULE_Whitespace	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'

import { findChildrenByType } from '../SemanticHelpers';

import { IRule, Parser as _Parser, IToken } from '..';

namespace BNF {
  export const RULES: IRule[] = [
    {
      name: 'Grammar',
      bnf: [
        ['RULE_S*', '%Atomic*']
      ]
    }, {
      name: '%Atomic',
      bnf: [['Production', 'RULE_S*']]
    }, {
      name: 'Production',
      bnf: [['NCName', 'RULE_S*', '"::="', 'RULE_Whitespace*', '%Choice', 'RULE_Whitespace*', 'RULE_EOL+', 'RULE_S*']]
    }, {
      name: 'NCName',
      bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
    }, {
      name: '%Choice',
      bnf: [['SequenceOrDifference', '%_Choice_1*']]
    }, {
      name: '%_Choice_1',
      bnf: [['RULE_Whitespace*', '"|"', 'RULE_Whitespace*', 'SequenceOrDifference']]
    }, {
      name: 'SequenceOrDifference',
      bnf: [['%Item', 'RULE_Whitespace*', '%_Item_1?']]
    }, {
      name: '%_Item_1',
      bnf: [['Minus', '%Item'], ['%Item*']]
    }, {
      name: 'Minus',
      bnf: [['"-"']]
    }, {
      name: '%Item',
      bnf: [['RULE_Whitespace*', '%Primary', 'PrimaryDecoration?']]
    }, {
      name: 'PrimaryDecoration',
      bnf: [['"?"'], ['"*"'], ['"+"']]
    }, {
      name: '%Primary',
      bnf: [
        ['NCName'],
        ['StringLiteral'],
        ['CharCode'],
        ['CharClass'],
        ['SubItem']
      ]
    }, {
      name: 'SubItem',
      bnf: [['"("', 'RULE_Whitespace*', '%Choice', 'RULE_Whitespace*', '")"']]
    }, {
      name: 'StringLiteral',
      bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]]
    }, {
      name: 'CharCode',
      bnf: [['"#x"', /[0-9a-zA-Z]+/]]
    }, {
      name: 'CharClass',
      bnf: [
        ["'['", "'^'?", '%RULE_CharClass_1+', '"]"']
      ]
    }, {
      name: '%RULE_CharClass_1',
      bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']]
    }, {
      name: 'RULE_Char',
      bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
    }, {
      name: 'CharRange',
      bnf: [['RULE_Char', '"-"', 'RULE_Char']]
    }, {
      name: 'CharCodeRange',
      bnf: [['CharCode', '"-"', 'CharCode']]
    }, {
      name: 'RULE_Whitespace',
      bnf: [['%RULE_Whitespace_Char*'], ['Comment', 'RULE_Whitespace*']]
    }, {
      name: 'RULE_S',
      bnf: [['RULE_Whitespace', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
    }, {
      name: '%RULE_Whitespace_Char',
      bnf: [[/\x09/], [/\x20/]]
    }, {
      name: 'Comment',
      bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
    }, {
      name: '%RULE_Comment_Body',
      bnf: [[/[^*]/], ['"*"+', /[^/]*/]]
    }, {
      name: 'RULE_EOL',
      bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
    }
  ];

  export const parser = new _Parser(RULES, {});

  function getAllTerms(expr: IToken): string[] {
    let terms = findChildrenByType(expr, 'term').map(term => {
      return findChildrenByType(term, 'literal').concat(findChildrenByType(term, 'rule-name'))[0].text;
    });

    findChildrenByType(expr, 'list').forEach(expr => {
      terms = terms.concat(getAllTerms(expr));
    });

    return terms;
  }


  export function getRules(source: string): IRule[] {
    let ast = parser.getAST(source);

    if (!ast) throw new Error('Could not parse ' + source);

    if (ast.errors && ast.errors.length) {
      throw ast.errors[0];
    }

    let rules = findChildrenByType(ast, 'Production');

    let ret = rules.map(rule => {
      let name = findChildrenByType(rule, 'NCName')[0].text;

      let expressions =
        findChildrenByType(rule, 'firstExpression')
          .concat(findChildrenByType(rule, 'otherExpression'));

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

  export function Transform(source: TemplateStringsArray): IRule[] {
    return getRules(source.join(''));
  }

  export class Parser extends _Parser {
    constructor(source: string, options) {
      super(getRules(source), options);
    }
  }
}

export default BNF;