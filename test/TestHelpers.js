"use strict";
exports.printBNF = function (parser) { return console.log(parser.emitSource()); };
var inspect = require('util').inspect;
function testParseToken(parser, txt, target, customTest) {
    testParseTokenFailsafe(parser, txt, target, function (doc) {
        if (doc.errors.length)
            throw doc.errors[0];
        if (doc.rest.length != 0)
            throw new Error('Got rest: ' + doc.rest);
        customTest && customTest(doc);
    });
}
exports.testParseToken = testParseToken;
function testParseTokenFailsafe(parser, txt, target, customTest) {
    it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), function () {
        console.log('      ---------------------------------------------------');
        var result;
        try {
            result = parser.getAST(txt, target);
            if (!result)
                throw new Error('Did not resolve');
            if (target && result.type != target)
                throw new Error('Type doesn\'t match. Got: ' + result.type);
            if (result.text.length == 0)
                throw new Error('Empty text result');
            if (customTest)
                customTest(result);
        }
        catch (e) {
            ;
            parser.debug = true;
            try {
                result = parser.getAST(txt, target);
                console.log(txt + '\n' + inspect(result, false, 20, true));
            }
            catch (ee) {
                console.log(ee);
            }
            parser.debug = false;
            throw e;
        }
        describeTree(result);
    });
}
exports.testParseTokenFailsafe = testParseTokenFailsafe;
function printDescription(token, maxLength) {
    if (/\n/.test(token.text))
        return;
    console.log('         '
        + new Array(token.start + 1).join(' ')
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