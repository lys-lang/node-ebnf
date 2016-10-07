// https://www.ics.uci.edu/~pattis/ICS-33/lectures/ebnf.pdf

declare var global;

const UPPER_SNAKE_RE = /^[A-Z0-9_]+$/;
const decorationRE = /(\?|\+|\*)$/;
const preDecorationRE = /^(&|!)/;

import { TokenError } from './TokenError';

export type RulePrimary = string | RegExp;

export interface IRule {
  name: string;
  bnf: RulePrimary[][];
}

export interface IToken {
  type: string;
  text: string;
  start: number;
  end: number;
  children: IToken[];
  parent: IToken;
  fullText: string;
  errors: TokenError[];
  rest: string;
}

export function readToken(txt: string, expr: RegExp): IToken {
  let result = expr.exec(txt);

  if (result && result.index == 0) {
    if (result[0].length == 0 && expr.source.length > 0) return null;
    return {
      type: null,
      text: result[0],
      rest: txt.substr(result[0].length),
      start: 0,
      end: result[0].length - 1,
      fullText: result[0],
      errors: [],
      children: [],
      parent: null
    };
  }

  return null;
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function fixRest(token: IToken) {
  token.rest = '';
  token.children && token.children.forEach(c => fixRest(c));
}

function fixPositions(token: IToken, start: number) {
  token.start += start;
  token.end += start;
  token.children && token.children.forEach(c => fixPositions(c, token.start));
}


export function parseRuleName(name: string) {
  let postDecoration = decorationRE.exec(name);
  let preDecoration = preDecorationRE.exec(name);

  let out = {
    raw: name,
    name: name.replace(decorationRE, '').replace(preDecorationRE, ''),
    isOptional: postDecoration && (postDecoration[0] == '?' || postDecoration[0] == '*') || false,
    allowRepetition: postDecoration && (postDecoration[0] == '+' || postDecoration[0] == '*') || false,
    atLeastOne: postDecoration && (postDecoration[1] == '+') || !postDecoration,
    lookupPositive: preDecoration && preDecoration[0] == '&' || false,
    lookupNegative: preDecoration && preDecoration[0] == '!' || false,
    lookup: false
  };

  out.lookup = out.lookupNegative || out.lookupPositive;

  return out;
}


export function findRuleByName(name: string, parser: Parser): IRule {
  let parsed = parseRuleName(name);

  return parser.cachedRules[parsed.name] || null;
}

/// Removes all the nodes starting with 'RULE_'
function stripRules(token: IToken, re: RegExp) {
  if (token.children) {
    let localRules = token.children.filter(x => x.type && re.test(x.type));
    for (let i = 0; i < localRules.length; i++) {
      let indexOnChildren = token.children.indexOf(localRules[i]);
      if (indexOnChildren != -1) {
        token.children.splice(indexOnChildren, 1);
      }
    }

    token.children.forEach(c => stripRules(c, re));
  }
}

export interface IDictionary<T> {
  [s: string]: T;
}
export class Parser {
  debug = false;

  cachedRules: IDictionary<IRule> = {};
  constructor(public grammarRules: IRule[], public options) {
    let errors = [];

    grammarRules.forEach(rule => {
      let parsedName = parseRuleName(rule.name);

      if (parsedName.name in this.cachedRules) {
        errors.push('Duplicated rule ' + name);
        return;
      } else {
        this.cachedRules[parsedName.name] = rule;
      }

      rule.bnf.forEach(options => {
        if (typeof options[0] === 'string') {
          let parsed = parseRuleName(options[0] as string);
          if (parsed.name == rule.name) {
            let error = 'Left recursion is not allowed yet, rule: ' + rule.name;

            if (errors.indexOf(error) == -1)
              errors.push(error);
          }
        }
      });
    });

    if (errors.length)
      throw new Error(errors.join('\n'));
  }

  getAST(txt: string, target?: string) {
    if (!target) {
      target = this.grammarRules.filter(x => x.name.indexOf('%') != 0)[0].name;
    }

    let result = this.parse(txt, target);

    if (result) {
      fixPositions(result, 0);

      // REMOVE ALL THE TAGS MATCHING /^%/
      stripRules(result, /^%/);

      if (!this.options || !this.options.keepUpperRules)
        stripRules(result, UPPER_SNAKE_RE);

      let rest = result.rest;

      if (rest) {
        new TokenError('Unexpected end of input: ' + JSON.stringify(rest) + txt, result);
      }

      fixRest(result);

      result.rest = rest;
    }

    return result;
  }

  parse(txt: string, target: string, recursion = 0): IToken {
    let out = null;

    let type = parseRuleName(target);

    let expr: RegExp;

    let isLiteral = type.name.indexOf('"') == 0 || type.name.indexOf("'") == 0;

    let printable = this.debug && /*!isLiteral &*/ !UPPER_SNAKE_RE.test(type.name);

    printable && console.log(new Array(recursion).join('│  ') + 'Trying to get ' + target + ' from ' + JSON.stringify(txt.split('\n')[0]));

    let realType = type.name;

    if (txt === "") {
      return {
        type: 'EOF',
        text: '',
        rest: '',
        start: 0,
        end: 0,
        fullText: '',
        errors: [],
        children: [],
        parent: null
      };
    }

    let targetLex = findRuleByName(type.name, this);

    try {
      if (!targetLex && isLiteral) {
        let src = global.eval(type.name);

        if (src === "") {
          return {
            type: '%%EMPTY%%',
            text: '',
            rest: txt,
            start: 0,
            end: 0,
            fullText: '',
            errors: [],
            children: [],
            parent: null
          };
        }

        expr = new RegExp(escapeRegExp(src));
        realType = null;
      }
    } catch (e) {
      return null;
    }

    if (expr) {
      let result = readToken(txt, expr);

      if (result) {
        result.type = realType;
        return result;
      }
    } else {
      let options = targetLex.bnf;

      if (options instanceof Array) {
        options.forEach(phases => {
          if (out) return;

          let tmp: IToken = {
            type: type.name,
            text: '',
            children: [],
            end: 0,
            errors: [],
            fullText: '',
            parent: null,
            start: 0,
            rest: txt
          };

          let tmpTxt = txt;
          let position = 0;

          let allOptional = phases.length > 0;
          let foundSomething = false;

          for (let i = 0; i < phases.length; i++) {
            if (typeof phases[i] == "string") {

              let localTarget = parseRuleName(phases[i] as string);

              allOptional = allOptional && localTarget.isOptional;

              let got: IToken;

              let foundAtLeastOne = false;

              if (localTarget.lookupNegative) {
                if (!tmpTxt.length)
                  continue;
              }

              do {
                got = this.parse(tmpTxt, localTarget.name, recursion + 1);

                // rule ::= "true" ![a-zA-Z]
                // negative lookup, if it does not matches, we should continue
                if (localTarget.lookupNegative) {
                  if (got)
                    return;
                  break;
                }

                if (localTarget.lookupPositive) {
                  if (!got || got.type == 'EOF')
                    return;
                }

                if (got && got.type == 'EOF')
                  continue;

                if (!got && localTarget.isOptional)
                  break;

                if (!got) {
                  if (foundAtLeastOne && localTarget.atLeastOne ? tmp : null)
                    break;
                  return;
                }

                foundAtLeastOne = true;
                foundSomething = true;

                if (got.type == '%%EMPTY%%') {
                  break;
                }

                got.start += position;
                got.end += position;

                if (!localTarget.lookupPositive && got.type) {
                  if (got.type.indexOf('%') == 0) {
                    got.children && got.children.forEach(x => {
                      x.start += position;
                      x.end += position;
                      x.parent = tmp;
                      tmp.children.push(x);
                    });
                  } else {
                    got.parent = tmp;
                    tmp.children.push(got);
                  }
                }

                printable && console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' ' + JSON.stringify(got.text));

                // EAT it from the input stream, only if it is not a lookup
                if (!localTarget.lookupPositive) {
                  tmp.text = tmp.text + got.text;
                  tmp.end = tmp.text.length;

                  tmpTxt = tmpTxt.substr(got.text.length);
                  position += got.text.length;
                }

                tmp.rest = tmpTxt;
              } while (got && localTarget.allowRepetition && tmpTxt.length);
            } else /* IS A REGEXP */ {
              let got = readToken(tmpTxt, phases[i] as RegExp);

              if (!got) {
                return;
              }

              printable && console.log(new Array(recursion + 1).join('│  ') + '└> ' + JSON.stringify(got.text) + (phases[i] as RegExp).source);

              foundSomething = true;

              got.start += position;
              got.end += position;

              tmp.text = tmp.text + got.text;
              tmp.end = tmp.text.length;

              tmpTxt = tmpTxt.substr(got.text.length);
              position += got.text.length;

              tmp.rest = tmpTxt;
            }
          }

          if (foundSomething) {
            out = tmp;
            printable && console.log(new Array(recursion).join('│  ') + '├<─┴< PUSHING ' + out.type + " " + JSON.stringify(out.text));
          }
        });
      }
    }

    return out;
  }
}

export default Parser;