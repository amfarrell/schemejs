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
function Environment(predecessor){
    this._predecessor = predecessor;
    this._variables = {};
}
function GlobalEnvironment(assignments){
    this._predecessor = undefined;
    this._variables = {};
    for (var key in assignments){
        this._variables[key] = assignments[key];
    }
}
GlobalEnvironment.prototype = Environment.prototype = {
    assign: function(key, value, global){
        var env;
        if (global && (env = this._find_env_with_variable(key))) {
            env[key] = value;
        } else {
            this._variables[key] = value;
        }
        var that = this
        return {assign: function(key, value, global){that.assign(key, value, global)}}
    },
    _find_env_with_variable: function(key){
        if (this._variables.hasOwnProperty(key)){ //don't return undefined
            return this;
        } else if (this._predecessor){
            return this._predecessor._find_env_with_variable(key)
        } else {
            return undefined
        }
    },
    extend: function(){
        return new Environment(this);
    },
    lookup: function(key){
        var env
        if (env = this._find_env_with_variable(key)){
            return env._variables[key];
        } else {
            throw Error("Global " + key + " not defined");
        }
    },
}

function Terp () {
    this._builtins = new GlobalEnvironment({
        '+': function (operand1, operand2) {return operand1 + operand2},
        '-': function (operand1, operand2) {return operand1 - operand2},
        '*': function (operand1, operand2) {return operand1 * operand2},
        '/': function (operand1, operand2) {return operand1 / operand2},
        '%': function (operand1, operand2) {return operand1 % operand2},
        'not': function (operand1) {return ! operand1},
        'and': function (operand1, operand2) {return operand1 && operand2},
        'or': function (operand1, operand2) {return operand1 || operand2},
        'eq': function (operand1, operand2) {return operand1 === operand2},
    });
};
Terp.prototype = {
    tokenize: function(expr) {
        var OPEN  = {}
            CLOSE = {}
    },
    leval: function(expr, env) {
        env = env || this._builtins;
        if (this._is_literal(expr)) {
            return this._leval_literal(expr);
        } else if (this._is_variable(expr)){
            return this._leval_variable(expr, env);
        } else if (this._is_compound(expr)){
            if (this._is_lambda(expr)){
                return this._make_proc(this._lambda_params(expr), this._lambda_body(expr), env);
            } else {
                var that = this
                return this.apply(
                    //levaluate the function to be applied
                    this.leval(this.first(expr)),
                    // levaluate the arguments
                    this.rest(expr).map(function (elem){
                        return that.leval(elem, env)
                    })
                );
            }
        } else {
            throw new Error("Invalid Expression.");
        }
    },
    apply: function(fun, args){
        return fun.apply(undefined, args);
    },
    _is_builtin: function(expr) {
        return (expr in this._builtins)
    },
    _is_variable: function(expr){
        debugger;
        return !this._is_literal(expr) && (typeof expr == "string" || expr instanceof String) && expr[0] !== '('
    },
    _leval_variable: function(expr, env){
        return env.lookup(expr);
    },
    _literals: {
        'true': true,
        'false': false,
    },
    _is_literal: function (expr) {
        //is expr a number?
        //Only handle numbers as litersl for now.
        return expr in this._literals || !Number.isNaN((new Number(expr)).valueOf())
    },
    _leval_literal: function (expr) {
        if (expr==="false"){
            return false; //special cased because (false || foo) equals foo.
        }
        return this._literals[expr] || (new Number(expr)).valueOf();
    },
    _is_compound: function(expr, env){
        return (expr instanceof Array) || expr[0] === '('
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
    len: function(expr){
        if (expr instanceof Array){
            return expr.length;
        } else {
            return this.len(this.tokenize_list(expr));
        }
    },
    _is_if: function (expr){
        return this.first(expr) === 'if' && this.len(expr) == 4; //Don't allow ifs without alternates.
    },
    _leval_if: function (expr, env){
        if (this.leval(this.first(this.rest(expr)), env)){ //implicitly uses js's own model for truthyness
            return this.leval(this.first(this.rest(this.rest(expr))), env) //caddr
        } else {
            return this.leval(this.first(this.rest(this.rest(this.rest(expr)))), env) //cadddr
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
    /*
    _is_definition: function(expr, env) {
        return this._first(expr) === 'def';
    },
    _leval_definition: function(expr, env) {

    },
    _is_variable: function(expr, env) {

    },
    _leval_variable: function(expr, env) {

    },
    */
}
exports.Interpreter = Terp;
exports.ExpTree = ExpTree;
exports.Env = Environment;
exports.GlobeEnv = GlobalEnvironment;
