
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
    it("Should handle newly defined literals", function (){
        var terp = new interpreter.Interpreter();
        terp._literals = {'6': 8};
        expect(terp.eval('6')).toBe(8);
        var otherterp = new interpreter.Interpreter();
        expect(otherterp.eval('6')).toBe(6);
    });
    it("Should recognise builtin functions", function(){
        var terp = new interpreter.Interpreter();
        expect(terp._is_builtin('+')).toBe(true);
        expect(terp._is_builtin('-')).toBe(true);
        expect(terp._is_builtin('*')).toBe(true);
        expect(terp._is_builtin('/')).toBe(true);
        expect(terp._is_builtin('%')).toBe(true);
        expect(terp._is_builtin('5')).toBe(false);
        expect(terp._is_builtin('(+ 3 5)')).toBe(false);
    });
    it("Should recognise builtin functions", function(){
        var terp = new interpreter.Interpreter();
        expect(terp._is_literal('4')).toBe(true);
        expect(terp._is_literal('3.0')).toBe(true);
        expect(terp._is_literal('5.6e2')).toBe(true);
        expect(terp._is_literal('%')).toBe(false);
        expect(terp._is_literal('/ 4')).toBe(false);
        expect(terp._is_literal('(+ 3 5)')).toBe(false);
    });
    it("Should handle literal functions ", function (){
        var result = (new interpreter.Interpreter()).eval("2.3e-3");
        expect(result).toBe(0.0023);
    });
    it("Should recognise compound expressions", function(){
        var terp = new interpreter.Interpreter();
        expect(terp._is_compound('4')).toBe(false);
        expect(terp._is_compound('5.6e2')).toBe(false);
        expect(terp._is_compound('%')).toBe(false);
        expect(terp._is_compound('/ 4')).toBe(false);
        expect(terp._is_compound('(+ 3 5)')).toBe(true);
        expect(terp._is_compound('(3)')).toBe(true);
    });
    it("Should split expressions into lists properly", function (){
        var terp = new interpreter.Interpreter();
        expect(terp.first("(+ 2 3)")).toBe('+');
        expect(terp.first("(4 2 3)")).toBe('4');
        expect(terp.first("(undefined 2 3)")).toBe("undefined");
        expect(terp.first("( + 2 3)")).toBe("+");
        expect(terp.rest("(+ 2 3)")).toEqual(['2', '3']);
        expect(terp.rest("(4 2 3)")).toEqual(['2', '3']);
        expect(terp.rest("(undefined 2 3)")).toEqual(['2', '3']);
        expect(terp.rest("(undefined 2 3 )")).toEqual(['2', '3']);
    });
    it("Should eval builtin arithmetic symbols to functions", function (){
        var plus = (new interpreter.Interpreter()).eval("+");
        expect(plus(2,3)).toBe(5);
        var mod = (new interpreter.Interpreter()).eval("%");
        expect(mod(8,3)).toBe(2);
    });
    it("Should handle expressions of builtin arithmetic", function(){
        var result = (new interpreter.Interpreter()).eval("( + 2 3)");
        expect(result).toBe(5);
    });
    it("Should error on any other expression", function (){
        var terp = new interpreter.Interpreter();
        expect(function (){terp.eval("(def a 3)")}).toThrow("Invalid Expression.");
    });
});
