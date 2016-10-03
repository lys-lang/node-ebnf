"use strict";
var inspect = require('util').inspect;
function printBNF(parser) {
    console.log('BNF:');
    parser.grammarRules.forEach(function (l) {
        console.log(l.name + ' ::= ' + l.bnf.map(function (options) {
            if (!options)
                return inspect('ERROR, MISSING OPTIONS', false, 1, true);
            return options.join(' ');
        }).join(' | '));
    });
    console.log('Expr:');
    parser.grammarRules.forEach(function (l) {
        l.expr && console.log('  ' + l.name + ': ' + inspect(l.expr, false, 2, true));
    });
}
exports.printBNF = printBNF;
function testParseToken(parser, txt, target) {
    it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), function () {
        var result = parser.getAST(txt, target);
        try {
            if (!result)
                throw new Error('Did not resolve');
            if (target && result.type != target)
                throw new Error('Type doesn\'t match. Got: ' + result.type);
            if (result.text.length == 0)
                throw new Error('Empty text result');
        }
        catch (e) {
            console.log(txt + '\n' + inspect(result, false, 20, true));
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
