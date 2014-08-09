function Terp () {

};
Terp.prototype = {
    eval: function(expr, env) {
        if (this._is_literal(expr)) {
            return this._eval_literal(expr);
        } else {
            return "Invalid expression.";
        }
    },
    _is_literal: function(expr, env) {
        //is expr a number?
        //Only handle numbers as litersl for now.
        return !Number.isNaN((new Number(expr)).valueOf())
    },
    _eval_literal: function(expr, env) {
        return (new Number(expr)).valueOf();
    },
}
exports.Interpreter = Terp;
