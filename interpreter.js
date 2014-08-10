var tokenizer = require('sexp-tokenizer');

function ExpTree(expr) {
    this.expr = expr
    this.root = [];
    this.stack = [this.root];
    this.depth = 0;
    this._parse(expr)
}
ExpTree.prototype = {
    _open: function() {
        this._current().push([]);
        this.stack.push(this._current()[this._current().length -1]);
        this.depth += 1;
    },
    _close: function() {
        if (this.depth < 1) {
            throw Error("RecMatchError on " + this.expr);
            //TODO: come up with better error reporting here.
        }
        this.stack.pop()
        this.depth -= 1;
    },
    _add: function(elem) {
        if (this.depth < 1) {
            throw Error("RecMatchError on " + this.expr);
            //TODO: come up with better error reporting here.
        }
        this._current().push(elem);
    },
    _current: function() {
        return this.stack[this.stack.length -1];
    },
    as_array: function() {
        return this.root[0];
    },
    _parse: function(expr){
    // Inspiration drawn from https://github.com/jaz303/sexp-tokenizer
        var SPACE_REGEX = /^[ \r\n\t]+/
        var NUMBER_REGEX = /^-?\d+(?:\.\d+)?/
        var QUOTED_REGEX = /^("(?:\\[rnt\\'"]|[^\\"])*"|'(?:\\[rnt\\'"]|[^\\'])*')/
        var TOKEN_REGEX = /^[^\(\)'"\r\n\t ]+/
        var remaining = expr;
        var match;
        var len_subtract;
        while (remaining.length){
            if (remaining[0] === '(') {
                this._open();
                len_subtract = 1;
            } else if (remaining[0] === ')') {
                this._close();
                len_subtract = 1;
            } else if ((match = SPACE_REGEX.exec(remaining))) {
                len_subtract = match[0].length;
            } else if ((match = NUMBER_REGEX.exec(remaining)) ||
                       (match = QUOTED_REGEX.exec(remaining)) ||
                       (match = TOKEN_REGEX.exec(remaining))) {
                this._add(match[0])
                len_subtract = match[0].length
            }
            remaining = remaining.slice(len_subtract);
        }
        if (this.depth !== 0) {
            throw Error("RecMatchError on " + this.expr);
        }
    }
}

function Terp () {

};
Terp.prototype = {
    tokenize: function(expr) {
        var OPEN  = {}
            CLOSE = {}


    },
    eval: function(expr, env) {
        if (this._is_literal(expr)) {
            return this._eval_literal(expr);
        } else if (this._is_builtin(expr)){
            return this._builtins[expr];
        } else if (this._is_compound(expr)){
            if (this._is_lambda(expr)){
                return this._make_proc(this._lambda_params(expr), this._lambda_body(expr), env);
            } else {
                return this.apply(
                        //evaluate the function to be applied
                        this.eval(this.first(expr)),
                        // evaluate the arguments
                        this.rest(expr).map(function (elem){
                            return this.eval(elem, env)
                        })
                    );
            }
        } else {
            throw new Error("Invalid Expression.");
        }
    },
    _is_lambda: function(expr, env){
        return this._is_compound(expr) && this.first(expr) === 'lambda';
    },
    _lambda_params: function(expr){
        return this.first(this.rest(expr));
    },
    _lambda_body: function(expr){
        return this.rest(this.rest(expr));
    },
    _is_compound: function(expr, env){
        return expr[0] === '('
    },
    tokenize_list: function(expr){
        return (new ExpTree(expr)).as_array();
    },
    first: function(expr){
        if (expr instanceof Array){
            return expr[0];
        } else {
            return this.tokenize_list(expr)[0];
        }
    },
    rest: function(expr){
        if (expr instanceof Array){
            return expr.slice(1);
        } else {
            return this.tokenize_list(expr).slice(1);
        }
    },
    apply: function(fun, args){
        return fun.apply(undefined, args);
    },
    _builtins: {
        '+': function (operand1, operand2) {return operand1 + operand2},
        '-': function (operand1, operand2) {return operand1 - operand2},
        '*': function (operand1, operand2) {return operand1 * operand2},
        '/': function (operand1, operand2) {return operand1 / operand2},
        '%': function (operand1, operand2) {return operand1 % operand2},
    },
    _literals: {
    },
    _is_builtin: function(expr, env) {
        return (expr in this._builtins)
    },
    _is_literal: function _is_literal(expr, env) {
        //is expr a number?
        //Only handle numbers as litersl for now.
        return expr in this._literals || !Number.isNaN((new Number(expr)).valueOf())
    },
    _eval_literal: function _eval_literal(expr, env) {
        return this._literals[expr] || (new Number(expr)).valueOf();
    },
    /*
    _is_definition: function(expr, env) {
        return this._first(expr) === 'def';
    },
    _eval_definition: function(expr, env) {
        
    },
    _is_variable: function(expr, env) {

    },
    _eval_variable: function(expr, env) {

    },
    */
}
exports.Interpreter = Terp;
exports.ExpTree = ExpTree;
