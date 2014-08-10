var tokenizer = require("sexp-tokenizer");
var interpreter = require("../interpreter");

describe("parsing", function(){
    beforeEach(function() {
        this.parse =  function(expr){return (new interpreter.ExpTree(expr)).as_array()}
    });
    it("Should not handle literals", function(){
        that = this
        expect(function(){that.parse("3")}).toThrow();
        expect(function(){that.parse("3 2")}).toThrow();
    });
    it("Should not handle strings where the parenthates don't match", function(){
        that = this
        expect(function(){that.parse("(3")}).toThrow();
        expect(function(){that.parse(") 2")}).toThrow();
        expect(function(){that.parse("() 2")}).toThrow();
        expect(function(){that.parse("()) 2")}).toThrow();
    });
    it("Should handle strings where the parenthises do match", function(){
        expect(this.parse("(3)")).toEqual(["3"]);
        expect(this.parse("(2 3)")).toEqual(["2", "3"]);
        expect(this.parse("(add 2 3)")).toEqual(["add", "2", "3"]);
        expect(this.parse("(add 2 (minus 5 3))")).toEqual(["add", "2", ["minus", "5", "3"]]);
        expect(this.parse("(add 2 (minus 5 (3)) (+ 4 5))")).toEqual(["add", "2", ["minus", "5", ["3"]], ["+", "4", "5"]]);
    });
});

describe("evaluation", function() {
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should handle literal integers", function (){
        expect(this.terp.eval("2")).toBe(2);
    });
    it("Should handle literal floats", function (){
        expect(this.terp.eval("2.3")).toBe(2.3);
    });
    it("Should handle literal floats in exponential/scientific notation", function (){
        expect(this.terp.eval("2.3e-3")).toBe(0.0023);
    });
    it("Should handle newly defined literals", function (){
        var otherterp = new interpreter.Interpreter();
        otherterp._literals = {'6': 8};
        expect(otherterp.eval('6')).toBe(8);
        expect(this.terp.eval('6')).toBe(6);
    });
    it("Should recognise builtin functions", function(){
        expect(this.terp._is_builtin('+')).toBe(true);
        expect(this.terp._is_builtin('-')).toBe(true);
        expect(this.terp._is_builtin('*')).toBe(true);
        expect(this.terp._is_builtin('/')).toBe(true);
        expect(this.terp._is_builtin('%')).toBe(true);
        expect(this.terp._is_builtin('5')).toBe(false);
        expect(this.terp._is_builtin('(+ 3 5)')).toBe(false);
    });
    it("Should recognise builtin functions", function(){
        expect(this.terp._is_literal('4')).toBe(true);
        expect(this.terp._is_literal('3.0')).toBe(true);
        expect(this.terp._is_literal('5.6e2')).toBe(true);
        expect(this.terp._is_literal('%')).toBe(false);
        expect(this.terp._is_literal('/ 4')).toBe(false);
        expect(this.terp._is_literal('(+ 3 5)')).toBe(false);
    });
    it("Should handle literal functions ", function (){
        expect(this.terp.eval("2.3e-3")).toBe(0.0023);
    });
    it("Should recognise compound expressions", function(){
        expect(this.terp._is_compound('4')).toBe(false);
        expect(this.terp._is_compound('5.6e2')).toBe(false);
        expect(this.terp._is_compound('%')).toBe(false);
        expect(this.terp._is_compound('/ 4')).toBe(false);
        expect(this.terp._is_compound('(+ 3 5)')).toBe(true);
        expect(this.terp._is_compound('(3)')).toBe(true);
    });
    it("Should split expressions into lists properly", function (){
        expect(this.terp.rest("(undefined (5 6) 3 )")).toEqual([['5', '6'], '3']);
        expect(this.terp.first("(+ 2 3)")).toBe('+');
        expect(this.terp.first("(4 2 3)")).toBe('4');
        expect(this.terp.first("(undefined 2 3)")).toBe("undefined");
        expect(this.terp.first("( + 2 3)")).toBe("+");
        expect(this.terp.rest("(+ 2 3)")).toEqual(['2', '3']);
        expect(this.terp.rest("(4 2 3)")).toEqual(['2', '3']);
        expect(this.terp.rest("(undefined 2 3)")).toEqual(['2', '3']);
        expect(this.terp.rest("(undefined 2 3 )")).toEqual(['2', '3']);
    });
    it("Should eval builtin arithmetic symbols to functions", function (){
        var plus = (this.terp).eval("+");
        expect(plus(2,3)).toBe(5);
        var mod = (this.terp).eval("%");
        expect(mod(8,3)).toBe(2);
    });
    it("Should handle expressions of builtin arithmetic", function(){
        var result = (this.terp).eval("( + 2 3)");
        expect(result).toBe(5);
    });
    it("Should recognise lambda expressions", function (){
        expect(this.terp._is_lambda('4')).toBe(false);
        expect(this.terp._is_lambda('5.6e2')).toBe(false);
        expect(this.terp._is_lambda('%')).toBe(false);
        expect(this.terp._is_lambda('/ 4')).toBe(false);
        expect(this.terp._is_lambda('(+ 3 5)')).toBe(false);
        expect(this.terp._is_lambda('(3)')).toBe(false);
        expect(this.terp._is_lambda('(lambda (x) (+ x 3))')).toBe(true);
        expect(this.terp._is_lambda('(lambda (x b) (- b (+ x 3)))')).toBe(true);
    });
    it("Should extract lambda parameters", function (){
        expect(this.terp._lambda_params('(lambda (x) (+ x 3))')).toEqual(['x']);
        expect(this.terp._lambda_params('(lambda (x b) (- b (+ x 3)))')).toEqual(['x', 'b']);
    });
    it("Should error on any other expression", function (){
        var that = this
        expect(function (){that.terp.eval("(def a 3)")}).toThrow("Invalid Expression.");
    });
});
