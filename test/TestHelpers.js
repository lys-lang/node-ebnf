"use strict";
var inspect = require('util').inspect;
var decorationRE = /(\?|\+|\*)$/;
var subExpressionRE = /^%/;
function getBNFRule(name, parser) {
    if (typeof name == 'string') {
        var decoration = decorationRE.exec(name);
        var decorationText = decoration ? decoration[0] + ' ' : '';
        var subexpression = subExpressionRE.test(name);
        var cleanName = name.replace(decorationRE, '');
        if (subexpression) {
            return '(' + getBNFBody(name, parser) + ')' + decorationText;
        }
        return name;
    }
    else {
        return name.source
            .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
            .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
    }
}
function grtBNFChoice(rules, parser) {
    return rules.map(function (x) { return getBNFRule(x, parser); }).join(' ');
}
function getBNFBody(name, parser) {
    for (var i = 0; i < parser.grammarRules.length; i++) {
        var rule = parser.grammarRules[i];
        name = name.replace(decorationRE, '');
        if (rule && rule.name == name) {
            return rule.bnf.map(function (x) { return grtBNFChoice(x, parser); }).join(' | ');
        }
    }
    return 'RULE_NOT_FOUND{' + name + '}';
}
function printBNF(parser) {
    console.log('BNF:');
    parser.grammarRules.forEach(function (l) {
        if (!(/^%/.test(l.name))) {
            console.log(l.name + ' ::= ' + getBNFBody(l.name, parser));
        }
    });
}
exports.printBNF = printBNF;
function testParseToken(parser, txt, target) {
    it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), function () {
        var result = parser.getAST(txt, target);
        parser.debug && console.log(txt + '\n' + inspect(result, false, 20, true));
        try {
            if (!result)
                throw new Error('Did not resolve');
            if (target && result.type != target)
                throw new Error('Type doesn\'t match. Got: ' + result.type);
            if (result.text.length == 0)
                throw new Error('Empty text result');
            if (result.rest.length != 0)
                throw new Error('Got rest: ' + result.rest);
        }
        catch (e) {
            parser.debug || console.log(txt + '\n' + inspect(result, false, 20, true));
            throw e;
        }
        describeTree(result);
    });
}
exports.testParseToken = testParseToken;
function printDescription(token, maxLength) {
    console.log(new Array(token.start + 1).join(' ')
        + token.text // new Array(token.text.length + 1).join('^')
        + new Array(maxLength - token.end + 2).join(' ')
        + token.type);
    token.children && token.children.forEach(function (c) {
        printDescription(c, maxLength);
    });
}
function describeTree(token) {
    printDescription(token, token.text.length);
}
exports.describeTree = describeTree;
//# sourceMappingURL=TestHelpers.js.map