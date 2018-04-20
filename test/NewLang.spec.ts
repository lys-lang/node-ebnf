declare var describe, it, require;

import { Grammars, Parser, IToken } from '../dist';
import { testParseToken, describeTree, printBNF, testParseTokenFailsafe } from './TestHelpers';

let inspect = require('util').inspect;
let expect = require('expect');

let grammar = `


{ws=explicit}

Document          ::= Directives EOF? {ws=implicit}
Directives        ::= Directive Directives? {pin=1,ws=implicit,recoverUntil=DIRECTIVE_RECOVERY,fragment=true}
Directive         ::= FunctionDirective | ValDirective | VarDirective | StructDirective {fragment=true}

FunctionDirective ::= EXPORT_KEYWORD? FUN_KEYWORD NameIdentifier FunctionparamList OfType? WS* AssignExpression {pin=2}
ValDirective      ::= EXPORT_KEYWORD? VAL_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=2}
VarDirective      ::= EXPORT_KEYWORD? VAR_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=2}
StructDirective   ::= EXPORT_KEYWORD? STRUCT_KEYWORD NameIdentifier {pin=2}

AssignExpression  ::= '=' WS* Expression {pin=2,fragment=true}
OfType            ::= COLON WS* Type WS* {pin=2,recoverUntil=NEXT_ARG_RECOVERY}

FunctionparamList ::= OPEN_PAREN WS* ParameterList? WS* CLOSE_PAREN {pin=1,recoverUntil=CLOSE_PAREN}
ParameterList     ::= Parameter NthParameter* {fragment=true}
NthParameter      ::= ',' WS* Parameter WS* {pin=1,recoverUntil=NEXT_ARG_RECOVERY}
Parameter         ::= NameIdentifier WS* OfType {pin=1,recoverUntil=NEXT_ARG_RECOVERY}

Type              ::= WS* NameIdentifier IsPointer* IsArray?
IsPointer         ::= '*'
IsArray           ::= '[]'

Expression        ::= OrExpression WS* (MatchExpression | BinaryExpression)* {simplifyWhenOneChildren=true}

MatchExpression   ::= MATCH_KEYWORD WS* MatchBody WS* {pin=1}
BinaryExpression  ::= NameIdentifier WS* OrExpression WS* {pin=1}

OrExpression      ::= AndExpression (WS+ 'or' WS+ AndExpression)? {simplifyWhenOneChildren=true}
AndExpression     ::= EqExpression (WS+ 'and' WS+ EqExpression)? {simplifyWhenOneChildren=true}
EqExpression      ::= RelExpression (WS* ('==' | '!=') WS* RelExpression)? {simplifyWhenOneChildren=true}
RelExpression     ::= ShiftExpression (WS* ('>=' | '<=' | '>' | '<') WS* ShiftExpression)? {simplifyWhenOneChildren=true}
ShiftExpression   ::= AddExpression (WS* ('>>' | '<<' | '>>>') WS* AddExpression)? {simplifyWhenOneChildren=true}
AddExpression     ::= MulExpression (WS* ('+' | '-') WS* MulExpression)? {simplifyWhenOneChildren=true}
MulExpression     ::= UnaryExpression (WS* ('*' | '/' | '%') WS* UnaryExpression)? {simplifyWhenOneChildren=true}
UnaryExpression   ::= NegExpression | UnaryMinus | IfExpression | FunctionCallExpression  {simplifyWhenOneChildren=true}

NegExpression     ::= '!' OrExpression {pin=1}
UnaryMinus        ::= !NumberLiteral '-' OrExpression {pin=2}

RefPointerOperator::= '*' | '&'
RefExpression     ::= RefPointerOperator VariableReference

FunctionCallExpression
                  ::= Value WS* (&'(' CallArguments)? {simplifyWhenOneChildren=true}

Value             ::= Literal | RefExpression | VariableReference | ParenExpression {fragment=true}
ParenExpression   ::= '(' WS* Expression WS* ')' {pin=3,recoverUntil=CLOSE_PAREN}

IfExpression      ::= 'if'

/* Pattern matching */
MatchBody         ::= '{' WS* MatchElements* '}' {pin=1,recoverUntil=MATCH_RECOVERY}

MatchElements     ::= (CaseCondition | CaseLiteral | CaseElse) WS*  {fragment=true}

CaseCondition     ::= CASE_KEYWORD WS+ NameIdentifier WS+ IF_KEYWORD WS* Expression '->' WS* Expression {pin=5}
CaseLiteral       ::= CASE_KEYWORD WS+ Literal WS* '->' WS* Expression {pin=3}
CaseElse          ::= ELSE_KEYWORD WS* '->' WS* Expression {pin=3}

/* Function call */
CallArguments     ::= OPEN_PAREN Arguments? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
Arguments         ::= WS* Expression WS* NthArgument* {fragment=true}
NthArgument       ::= ',' WS* Expression WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}


VariableReference ::= NameIdentifier

BooleanLiteral    ::= TRUE_KEYWORD | FALSE_KEYWORD
NullLiteral       ::= NULL_KEYWORD
NumberLiteral     ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=2}
StringLiteral     ::= '"' (!'"' [#x20-#xFFFF])* '"'
Literal           ::= ( StringLiteral
                      | NumberLiteral
                      | BooleanLiteral
                      | NullLiteral
                      ) {fragment=true}

NameIdentifier    ::= !KEYWORD [A-Za-z_]([A-Za-z0-9_])*

/* Keywords */

KEYWORD           ::= TRUE_KEYWORD | FALSE_KEYWORD | NULL_KEYWORD | IF_KEYWORD | ELSE_KEYWORD | CASE_KEYWORD | VAR_KEYWORD | VAL_KEYWORD | FUN_KEYWORD | STRUCT_KEYWORD | EXPORT_KEYWORD | MATCH_KEYWORD | RESERVED_WORDS

FUN_KEYWORD       ::= 'fun'    WS+
VAL_KEYWORD       ::= 'val'    WS+
VAR_KEYWORD       ::= 'var'    WS+
STRUCT_KEYWORD    ::= 'struct' WS+
EXPORT_KEYWORD    ::= 'export' WS+

RESERVED_WORDS    ::= ( 'async' | 'await' | 'defer'
                      | 'package' | 'declare'
                      | 'using'
                      | 'delete'
                      | 'break' | 'continue'
                      | 'let' | 'const' | 'void'
                      | 'class' | 'private' | 'public' | 'protected' | 'extends'
                      | 'import' | 'from' | 'abstract'
                      | 'finally' | 'new' | 'native' | 'enum' | 'type'
                      | 'yield' | 'for' | 'do' | 'while' | 'try'
                      ) WS+

TRUE_KEYWORD      ::= 'true'   ![A-Za-z0-9_]
FALSE_KEYWORD     ::= 'false'  ![A-Za-z0-9_]
NULL_KEYWORD      ::= 'null'   ![A-Za-z0-9_]
IF_KEYWORD        ::= 'if'     ![A-Za-z0-9_]
ELSE_KEYWORD      ::= 'else'   ![A-Za-z0-9_]
CASE_KEYWORD      ::= 'case'   ![A-Za-z0-9_]
MATCH_KEYWORD     ::= 'match'  ![A-Za-z0-9_]



/* Tokens */

DIRECTIVE_RECOVERY::= &(FUN_KEYWORD | VAL_KEYWORD | VAR_KEYWORD | STRUCT_KEYWORD | EXPORT_KEYWORD | RESERVED_WORDS)
NEXT_ARG_RECOVERY ::= &(',' | ')')
PAREN_RECOVERY    ::= &(')')
MATCH_RECOVERY    ::= &('}' | 'case' | 'else')
OPEN_PAREN        ::= '('
CLOSE_PAREN       ::= ')'
COLON             ::= ':'
OPEN_DOC_COMMENT  ::= '/*'
CLOSE_DOC_COMMENT ::= '*/'
DOC_COMMENT       ::= !CLOSE_DOC_COMMENT [#x00-#xFFFF]

Comment           ::= '//' (![#x0A#x0D] [#x00-#xFFFF])* EOL
MultiLineComment  ::= OPEN_DOC_COMMENT DOC_COMMENT* CLOSE_DOC_COMMENT {pin=1}
WS                ::= Comment | MultiLineComment | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL               ::= [#x0A#x0D]+|EOF

`;

describe('New lang', () => {
  describe('Parse JSON', () => {
    let parser: Parser;

    it('create parser', () => {
      parser = new Parser(Grammars.Custom.RULES, {});
      testParseToken(parser, grammar);
    });
  });

  describe('Grammars.Custom parses JSON grammar', function() {
    let RULES = Grammars.Custom.getRules(grammar);
    console.log('JSON:\n' + inspect(RULES, false, 20, true));
    let parser = new Parser(RULES, {});

    printBNF(parser);

    function test(literals, ...placeholders) {
      let result = '';

      // interleave the literals with the placeholders
      for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
      }

      // add the last literal
      result += literals[literals.length - 1];
      testParseToken(parser, result);
    }

    test`fun test() = 1`;

    test`fun test(  a: MBER,      b   : NumBer) = 1`;

    test`export fun test() = 2`;

    test`var test: Double = 1`;
    test`var test = 1`;
    test`export var test = 1`;

    test`val test: Number = 1`;
    test`val test = 1`;

    test`val test = 1 * 1 - 2 / 4 and 1 == 3 or 4 <= 4`;

    test`val test = 1`;

    test`val test = 1 mul 4`;

    test`val floatingNumber: Number = 1.0`;
    test`val floatingNumber: Number = 0.0`;

    test`export val test = 1`;
    test`val test = true`;
    test`val test = false`;
    test`val test = null`;

    test`fun test(): Number = 1`;

    test`fun test(): Number = /*asd*/ 1`;
    test`fun test(): Number = /**/ 1`;

    test`export fun test(a: Number) = 2`;
    test`export fun test(a: Number, b: Type) = 2`;

    test`val test = 1 + (4 + 1)`;
    test`val test = (1 + 4) + 1`;

    test`
      export var test = 1
      var test2 = 1
      val test2 = 1
    `;

    test`
    var test = 1
    fun getTest() = test
    `;

    test`var test = 1    fun pointerOfTest() = &test    `;

    test`var test: Entity* = 1 fun valueOfTest() = *test`;

    test`var test: Struct* = 1`;
    test`var test: Struct**** = 1`;

    test`var test: Struct[] = 1`;
    test`var test: Struct*[] = 1`;
    test`var test: Int64**[] = 1`;

    // test`
    // export struct Entity {
    //   a: Number,
    //   b: Entity*,
    //   c: Number*[]
    // }
    // export var entities: Entity* = 1
    // export fun getTest() = test
    // `;

    test`val test = 1 match {}`;
    test`val test = 1 match { else -> 1 }`;
    test`
      val test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`val test = 1 match { case 2 -> true else -> false }`;

    test`
      val test = 1 match {
        case 2->true
        else->false
      }
    `;

    test`
      val test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`
      val test = 1 match {
        case x if true -> true
        case x if x < 1 and x < 10 -> true
        case 2 -> true
        else -> false
      }
    `;

    test`val test = 1 match { case x if x < 1 and x < 10 -> true }`;
    test`var a = x match { else -> 1 } map 1 * 2`;

    test`var a = !x()`;
    test`var a = x()`;

    testParseTokenFailsafe(parser, `export fun test(a: ) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(') = 2');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd val x = 1`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd`, null, doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });
    testParseTokenFailsafe(parser, `struct Entity asd val x = 1`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `struct Entity asd`, null, doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });

    testParseTokenFailsafe(parser, `export fun test(a: ,b: AType) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(',b: AType) = 2');
    });

    testParseTokenFailsafe(parser, `export fun test() = 2 /*`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('');
    });

    testParseTokenFailsafe(parser, `export fun test(a: 1) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].message).toEqual('Unexpected input: "1" Expecting: OfType');
      expect(doc.errors[0].token.text).toEqual('1');
    });

    testParseTokenFailsafe(parser, 'export fun () = 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('() = 1');
    });

    testParseTokenFailsafe(parser, 'var a = .0', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('.0');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else } map 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('else } map 1');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else -> } map 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('} map 1');
    });

    testParseTokenFailsafe(parser, 'var a = match', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('match');
    });

    test`val test = 1 map 1 map 2 map 3`;
    test`val test = x(1)`;
    test`val test = x(1,2)`;
    test`val test = (x)(1,2)`;
    test`val test = (x())(1,2)`;
    test`val test = x( 1 , 2 /* sdgf */)`;
  });
});
