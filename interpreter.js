function Terp () {

};
Terp.prototype = {
    eval: function(expr, env) {
        return "Invalid expression.";
    }
}
exports.Interpreter = Terp;
