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
// RULE_WHITESPACE	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'

import { TokenError } from '../TokenError';
import { IRule, Parser as _Parser, IToken, escapeRegExp, findRuleByName } from '../Parser';
import { IGrammarParserOptions } from './types';

namespace BNF {
  export const RULES: IRule[] = [
    {
      name: 'Grammar',
      bnf: [['RULE_S*', 'Attributes?', 'RULE_S*', '%Atomic*', 'EOF']]
    },
    {
      name: '%Atomic',
      bnf: [['Production', 'RULE_S*']],
      fragment: true
    },
    {
      name: 'Production',
      bnf: [
        [
          'NCName',
          'RULE_S*',
          '"::="',
          'RULE_WHITESPACE*',
          '%Choice',
          'RULE_WHITESPACE*',
          'Attributes?',
          'RULE_EOL+',
          'RULE_S*'
        ]
      ]
    },
    {
      name: 'NCName',
      bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
    },
    {
      name: 'Attributes',
      bnf: [['"{"', 'Attribute', '%Attributes*', 'RULE_S*', '"}"']]
    },
    {
      name: '%Attributes',
      bnf: [['RULE_S*', '","', 'Attribute']],
      fragment: true
    },
    {
      name: 'Attribute',
      bnf: [['RULE_S*', 'NCName', 'RULE_WHITESPACE*', '"="', 'RULE_WHITESPACE*', 'AttributeValue']]
    },
    {
      name: 'AttributeValue',
      bnf: [['NCName'], [/[1-9][0-9]*/]]
    },
    {
      name: '%Choice',
      bnf: [['SequenceOrDifference', '%_Choice_1*']],
      fragment: true
    },
    {
      name: '%_Choice_1',
      bnf: [['RULE_S*', '"|"', 'RULE_S*', 'SequenceOrDifference']],
      fragment: true
    },
    {
      name: 'SequenceOrDifference',
      bnf: [['%Item', 'RULE_WHITESPACE*', '%_Item_1?']]
    },
    {
      name: '%_Item_1',
      bnf: [['Minus', '%Item'], ['%Item*']],
      fragment: true
    },
    {
      name: 'Minus',
      bnf: [['"-"']]
    },
    {
      name: '%Item',
      bnf: [['RULE_WHITESPACE*', 'PrimaryPreDecoration?', '%Primary', 'PrimaryDecoration?']],
      fragment: true
    },
    {
      name: 'PrimaryDecoration',
      bnf: [['"?"'], ['"*"'], ['"+"']]
    },
    {
      name: 'PrimaryPreDecoration',
      bnf: [['"&"'], ['"!"'], ['"~"']]
    },
    {
      name: '%Primary',
      bnf: [['NCName'], ['StringLiteral'], ['CharCode'], ['CharClass'], ['SubItem']],
      fragment: true
    },
    {
      name: 'SubItem',
      bnf: [['"("', 'RULE_S*', '%Choice', 'RULE_S*', '")"']]
    },
    {
      name: 'StringLiteral',
      bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]]
    },
    {
      name: 'CharCode',
      bnf: [['"#x"', /[0-9a-zA-Z]+/]]
    },
    {
      name: 'CharClass',
      bnf: [["'['", "'^'?", '%RULE_CharClass_1+', '"]"']]
    },
    {
      name: '%RULE_CharClass_1',
      bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']],
      fragment: true
    },
    {
      name: 'RULE_Char',
      bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
    },
    {
      name: 'CharRange',
      bnf: [['RULE_Char', '"-"', 'RULE_Char']]
    },
    {
      name: 'CharCodeRange',
      bnf: [['CharCode', '"-"', 'CharCode']]
    },
    {
      name: 'RULE_WHITESPACE',
      bnf: [['%RULE_WHITESPACE_CHAR*'], ['Comment', 'RULE_WHITESPACE*']]
    },
    {
      name: 'RULE_S',
      bnf: [['RULE_WHITESPACE', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
    },
    {
      name: '%RULE_WHITESPACE_CHAR',
      bnf: [[/\x09/], [/\x20/]],
      fragment: true
    },
    {
      name: 'Comment',
      bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
    },
    {
      name: '%RULE_Comment_Body',
      bnf: [[/[^*]/], ['"*"+', /[^/]*/]],
      fragment: true
    },
    {
      name: 'RULE_EOL',
      bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
    },
    {
      name: 'Link',
      bnf: [["'['", 'Url', "']'"]]
    },
    {
      name: 'Url',
      bnf: [[/[^\x5D:/?#]/, '"://"', /[^\x5D#]+/, '%Url1?']]
    },
    {
      name: '%Url1',
      bnf: [['"#"', 'NCName']],
      fragment: true
    }
  ];

  export const defaultParser = new _Parser(RULES, { debug: false });

  const preDecorationRE = /^(!|&)/;
  const decorationRE = /(\?|\+|\*)$/;
  const subExpressionRE = /^%/;

  function getBNFRule(name: string | RegExp, parser: Parser): string {
    if (typeof name == 'string') {
      let decoration = decorationRE.exec(name);
      let preDecoration = preDecorationRE.exec(name);

      let preDecorationText = preDecoration ? preDecoration[0] : '';
      let decorationText = decoration ? decoration[0] + ' ' : '';

      let subexpression = subExpressionRE.test(name);

      if (subexpression) {
        let lonely = isLonelyRule(name, parser);

        if (lonely) return preDecorationText + getBNFBody(name, parser) + decorationText;

        return preDecorationText + '(' + getBNFBody(name, parser) + ')' + decorationText;
      }

      return name.replace(preDecorationRE, preDecorationText);
    } else {
      return name.source
        .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
        .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
    }
  }

  /// Returns true if the rule is a string literal or regular expression without a descendant tree
  function isLonelyRule(name: string, parser: Parser) {
    let rule = findRuleByName(name, parser);
    return (
      rule &&
      rule.bnf.length == 1 &&
      rule.bnf[0].length == 1 &&
      (rule.bnf[0][0] instanceof RegExp || rule.bnf[0][0][0] == '"' || rule.bnf[0][0][0] == "'")
    );
  }

  function getBNFChoice(rules, parser: Parser) {
    return rules.map(x => getBNFRule(x, parser)).join(' ');
  }

  function getBNFBody(name: string, parser: Parser): string {
    let rule = findRuleByName(name, parser);

    if (rule) return rule.bnf.map(x => getBNFChoice(x, parser)).join(' | ');

    return 'RULE_NOT_FOUND {' + name + '}';
  }

  export function emit(parser: Parser): string {
    let acumulator: string[] = [];

    parser.grammarRules.forEach(l => {
      if (!/^%/.test(l.name)) {
        let recover = l.recover ? ' { recoverUntil=' + l.recover + ' }' : '';

        acumulator.push(l.name + ' ::= ' + getBNFBody(l.name, parser) + recover);
      }
    });

    return acumulator.join('\n');
  }

  let subitems = 0;

  function restar(total, resta) {
    console.log('reberia restar ' + resta + ' a ' + total);
    throw new Error('Difference not supported yet');
  }

  function convertRegex(txt: string): RegExp {
    return new RegExp(
      txt
        .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
        .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
        .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
        .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1')
    );
  }

  function getSubItems(tmpRules: IRule[], seq: IToken, parentName: string, parentAttributes: any) {
    let anterior = null;
    let bnfSeq = [];

    seq.children.forEach((x, i) => {
      if (x.type == 'Minus') {
        restar(anterior, x);
      } else {
      }

      let decoration: any = seq.children[i + 1];
      decoration = (decoration && decoration.type == 'PrimaryDecoration' && decoration.text) || '';

      let preDecoration = '';

      if (anterior && anterior.type == 'PrimaryPreDecoration') {
        preDecoration = anterior.text;
      }

      let pinned = preDecoration == '~' ? 1 : undefined;

      if (pinned) {
        preDecoration = '';
      }

      switch (x.type) {
        case 'SubItem':
          let name = '%' + (parentName + subitems++);

          createRule(tmpRules, x, name, parentAttributes);

          bnfSeq.push(preDecoration + name + decoration);
          break;
        case 'NCName':
          bnfSeq.push(preDecoration + x.text + decoration);
          break;
        case 'StringLiteral':
          if (decoration || preDecoration || !/^['"/()a-zA-Z0-9&_.:=,+*\-\^\\]+$/.test(x.text)) {
             bnfSeq.push(preDecoration + x.text + decoration);
          } else {
             for (const c of x.text.slice(1, -1)) {
                if (parentAttributes && parentAttributes["ignoreCase"] == "true" && /[a-zA-Z]/.test(c)) {
                   bnfSeq.push(new RegExp("[" + c.toUpperCase() + c.toLowerCase() + "]"));
                }
                else {
                   bnfSeq.push(new RegExp(escapeRegExp(c)));
                }
             }
          }
          break;
        case 'CharCode':
        case 'CharClass':
          if (decoration || preDecoration) {
            let newRule: IRule = {
              name: '%' + (parentName + subitems++),
              bnf: [[convertRegex(x.text)]],
              pinned
            };

            tmpRules.push(newRule);

            bnfSeq.push(preDecoration + newRule.name + decoration);
          } else {
            bnfSeq.push(convertRegex(x.text));
          }
          break;
        case 'PrimaryPreDecoration':
        case 'PrimaryDecoration':
          break;
        default:
          throw new Error(' HOW SHOULD I PARSE THIS? ' + x.type + ' -> ' + JSON.stringify(x.text));
      }

      anterior = x;
    });

    return bnfSeq;
  }

  function createRule(tmpRules: IRule[], token: IToken, name: string, parentAttributes: any = undefined) {
    let attrNode = token.children.filter(x => x.type == 'Attributes')[0];

    let attributes: any = {};

    if (attrNode) {
      attrNode.children.forEach(x => {
        let name = x.children.filter(x => x.type == 'NCName')[0].text;
        if (name in attributes) {
          throw new TokenError('Duplicated attribute ' + name, x);
        } else {
          attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
        }
      });
    }

    let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(tmpRules, s, name, parentAttributes ? parentAttributes : attributes));

    let rule: IRule = {
      name,
      bnf
    };

    if (name.indexOf('%') == 0) rule.fragment = true;

    if (attributes['recoverUntil']) {
      rule.recover = attributes['recoverUntil'];
      if (rule.bnf.length > 1)
        throw new TokenError('only one-option productions are suitable for error recovering', token);
    }

    if ('pin' in attributes) {
      let num = parseInt(attributes['pin']);
      if (!isNaN(num)) {
        rule.pinned = num;
      }
      if (rule.bnf.length > 1) throw new TokenError('only one-option productions are suitable for pinning', token);
    }

    if ('ws' in attributes) {
      rule.implicitWs = attributes['ws'] != 'explicit';
    } else {
      rule.implicitWs = null;
    }

    rule.fragment = rule.fragment || attributes['fragment'] == 'true';

    rule.simplifyWhenOneChildren = attributes['simplifyWhenOneChildren'] == 'true';

    tmpRules.push(rule);
  }

  export function getRules(source: string, parser: _Parser = defaultParser): IRule[] {
    let ast = parser.getAST(source);

    if (!ast) throw new Error('Could not parse ' + source);

    if (ast.errors && ast.errors.length) {
      throw ast.errors[0];
    }

    let implicitWs = null;

    let attrNode = ast.children.filter(x => x.type == 'Attributes')[0];

    let attributes: any = {};

    if (attrNode) {
      attrNode.children.forEach(x => {
        let name = x.children.filter(x => x.type == 'NCName')[0].text;
        if (name in attributes) {
          throw new TokenError('Duplicated attribute ' + name, x);
        } else {
          attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
        }
      });
    }

    implicitWs = attributes['ws'] == 'implicit';

    let tmpRules: IRule[] = [];

    ast.children.filter(x => x.type == 'Production').map((x: any) => {
      let name = x.children.filter(x => x.type == 'NCName')[0].text;
      createRule(tmpRules, x, name);
    });

    tmpRules.forEach(rule => {
      if (rule.implicitWs === null) rule.implicitWs = implicitWs;
    });

    return tmpRules;
  }

  export function Transform(source: TemplateStringsArray, subParser: _Parser = defaultParser): IRule[] {
    return getRules(source.join(''), subParser);
  }

  export class Parser extends _Parser {
    constructor(source: string, options?: Partial<IGrammarParserOptions>) {
      const subParser = options && options.debugRulesParser === true ? new _Parser(BNF.RULES, { debug: true }) : defaultParser;
      super(getRules(source, subParser), options);
    }
    emitSource(): string {
      return emit(this);
    }
  }
}

export default BNF;
