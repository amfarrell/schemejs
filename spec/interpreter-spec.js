
var interpreter = require("../interpreter");

describe("evaluation", function() {
    it("Should handle literal integers", function (){
        var result = (new interpreter.Interpreter()).eval("2");
        expect(result).toBe(2);
    });
    it("Should handle literal floats", function (){
        var result = (new interpreter.Interpreter()).eval("2.3");
        expect(result).toBe(2.3);
    });
    it("Should handle literal floats in exponential/scientific notation", function (){
        var result = (new interpreter.Interpreter()).eval("2.3e-3");
        expect(result).toBe(0.0023);
    });
    it("Should handle literal functions ", function (){
        var result = (new interpreter.Interpreter()).eval("2.3e-3");
        expect(result).toBe(0.0023);
    });
    it("Should handle builtin arithmetic", function (){
        var plus = (new interpreter.Interpreter()).eval("+");
        expect(plus(2,3)).toBe(5);
        var mod = (new interpreter.Interpreter()).eval("%");
        expect(mod(8,3)).toBe(2);
    });
    it("Should error on any other expression", function (){
        var result = (new interpreter.Interpreter()).eval("( + 2 3)");
        expect(result).toBe("Invalid expression.");
    });
});
