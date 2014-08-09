function Terp () {

};
Terp.prototype = {
    eval: function(expr, env) {
        if (this._is_literal(expr)) {
            return this._eval_literal(expr);
        } else if (this._is_builtin(expr)){
            return this._builtins[expr];
        } else {
            return "Invalid expression.";
        }
    },
    _builtins: {
        '+': function (operand1, operand2) {return operand1 + operand2},
        '-': function (operand1, operand2) {return operand1 - operand2},
        '*': function (operand1, operand2) {return operand1 * operand2},
        '/': function (operand1, operand2) {return operand1 / operand2},
        '%': function (operand1, operand2) {return operand1 % operand2},
    },
    _is_builtin: function(expr, env) {
        return (expr in this._builtins)
    },
    _is_literal: function(expr, env) {
        //is expr a number?
        //Only handle numbers as litersl for now.
        return !Number.isNaN((new Number(expr)).valueOf())
    },
    _eval_literal: function(expr, env) {
        return (new Number(expr)).valueOf();
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
