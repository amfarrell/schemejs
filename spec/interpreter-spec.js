
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
    it("Should error on any other expression", function (){
        var result = (new interpreter.Interpreter()).eval("( + 2 3)");
        expect(result).toBe("Invalid expression.");
    });
});
