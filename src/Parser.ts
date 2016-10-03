// https://www.ics.uci.edu/~pattis/ICS-33/lectures/ebnf.pdf

declare var global;

import { TokenError } from './TokenError';

export interface IRule {
  name: string;
  expr?: RegExp;
  bnf: string[][];
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

/// Removes all the nodes starting with 'RULE_'
function stripRules(token: IToken) {
  if (token.children) {
    let localRules = token.children.filter(x => x.type && x.type.indexOf('RULE_') == 0);
    for (let i = 0; i < localRules.length; i++) {
      let indexOnChildren = token.children.indexOf(localRules[i]);
      if (indexOnChildren != -1) {
        token.children.splice(indexOnChildren, 1);
      }
    }

    token.children.forEach(c => stripRules(c));
  }
}
export class Parser {
  debug = false;

  constructor(public grammarRules: IRule[], public options) {

  }

  getAST(txt: string, target?: string) {
    if (!target) {
      target = this.grammarRules[0].name;
    }

    let result = this.parse(txt, target);

    if (result) {
      fixPositions(result, 0);
      stripRules(result);

      let rest = result.rest;

      if (rest) {
        new TokenError('Unexpected end of input: ' + rest, result);
      }

      fixRest(result);

      result.rest = rest;
    }

    return result;
  }

  parse(txt: string, target: string, recursion = 0): IToken {
    let out = null;

    let type = target.replace(/[\*\?\+]$/, '');
    // let isOptional = /\?$/.test(target);

    let targetLex = this.findRule(type);

    let expr: RegExp;

    let printable = this.debug && type.indexOf('"') != 0 && type.indexOf('RULE_') != 0 && type.indexOf("'") != 0;

    printable && console.log(new Array(recursion).join('│  ') + 'Trying to get ' + target + ' from ' + JSON.stringify(txt.split('\n')[0]));

    let realType = type;

    if (txt === "") {
      return {
        type: 'RULE_EOF',
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

    try {
      if (!targetLex && (type.indexOf('"') == 0 || type.indexOf("'") == 0)) {
        let src = global.eval(type);

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
      } else {

        expr = targetLex.expr;
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
            type: type,
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
            let localTarget = phases[i];
            let isOptional = /(\*|\?)$/.test(localTarget);
            let allowRepetition = /(\*|\+)$/.test(localTarget);
            let atLeastOne = /\+$/.test(localTarget);

            allOptional = allOptional && isOptional;

            let got: IToken;

            let foundAtLeastOne = false;

            do {
              got = this.parse(tmpTxt, localTarget, recursion + 1);

              if (!got && isOptional) continue;

              if (!got) {
                if (foundAtLeastOne && atLeastOne ? tmp : null)
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

              if (got.type) {
                got.parent = tmp;
                tmp.children.push(got);
                printable && console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.text);
              }

              tmp.text = tmp.text + got.text;
              tmp.end = tmp.text.length;

              tmpTxt = tmpTxt.substr(got.text.length);
              position += got.text.length;

              tmp.rest = tmpTxt;
            } while (got && allowRepetition && tmpTxt.length);
          }

          if (foundSomething) {
            out = tmp;
          }
        });
      }
    }

    return out;
  }

  findRule(name: string) {
    return this.grammarRules.filter(x => x.name == name)[0] as IRule || null;
  }
}

export default Parser;