
var interpreter = require("../interpreter");

describe("evaluation", function() {
    it("Should error on any expression", function (){
        var result = (new interpreter.Interpreter()).eval("( + 2 3)");
        expect(result).toBe("Invalid expression.");
    });
});
