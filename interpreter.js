function Terp () {

};
Terp.prototype = {
    eval: function(expr, env) {
        if (this._is_literal(expr)) {
            return this._eval_literal(expr);
        } else if (this._is_builtin(expr)){
            return this._builtins[expr];
        } else if (this._is_compound(expr)){
            return this.apply(
                    //evaluate the function to be applied
                    this.eval(this.first(expr)),
                    // evaluate the arguments
                    this.rest(expr).map(function (elem){
                        return this.eval(elem, env)
                    })
                );
        } else {
            throw new Error("Invalid Expression.");
        }
    },
    _is_compound: function(expr, env){
        return expr[0] === '('
    },
    strip_parens: function(expr){
        return expr.replace(RegExp('^\\('), '').replace(RegExp('\\)$'),'').replace(RegExp('\ *$'),'').replace(RegExp('^\ *'),'');
    },
    first: function(expr){
        return this.strip_parens(expr).split(' ')[0];
    },
    rest: function(expr){
        return this.strip_parens(expr).split(' ').slice(1);
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
    _is_literal: function(expr, env) {
        //is expr a number?
        //Only handle numbers as litersl for now.
        return expr in this._literals || !Number.isNaN((new Number(expr)).valueOf())
    },
    _eval_literal: function(expr, env) {
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
