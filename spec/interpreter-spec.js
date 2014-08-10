var tokenizer = require("sexp-tokenizer");
var interpreter = require("../interpreter");

xdescribe("parsing", function(){
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
        expect(function(){that.parse("(add 2 (minus 5 (3)) (+ 4 5)")}).toThrow();
    });
    it("Should handle strings where the parenthises do match", function(){
        expect(this.parse("(3)")).toEqual(["3"]);
        expect(this.parse("(2 3)")).toEqual(["2", "3"]);
        expect(this.parse("(add 2 3)")).toEqual(["add", "2", "3"]);
        expect(this.parse("(add 2 (minus 5 3))")).toEqual(["add", "2", ["minus", "5", "3"]]);
        expect(this.parse("(add 2 (minus 5 (3)) (+ 4 5))")).toEqual(["add", "2", ["minus", "5", ["3"]], ["+", "4", "5"]]);
    });
});

xdescribe("lambda levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
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
});
describe("conditional and boolean levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should recognise if expressions", function (){
        expect(this.terp._is_if('(+ 3 5)')).toBe(false);
        expect(this.terp._is_if('(3)')).toBe(false);
        expect(this.terp._is_if('(if (x) (+ x 3) (- x 4))')).toBe(true);
        expect(this.terp._is_if('(if (x) (+ x 3))')).toBe(false);
        expect(this.terp._is_if('(if (x b) (- b (+ x 3)))')).toBe(false);
    });
    it("Should correctly levaluate if expressions", function (){
        expect(this.terp._leval_if('(if true 5 7)')).toBe(5);
        expect(this.terp._leval_if('(if false 5 7)')).toBe(7);
    });
    it("Should recognise boolean literals", function (){
        expect(this.terp._is_literal("true")).toBe(true);
        expect(this.terp._is_literal("false")).toBe(true);
    });
    it("Should handle boolean literals", function (){
        expect(this.terp.leval("true")).toBe(true);
        expect(this.terp.leval("false")).toBe(false);
    });
    it("Should handle boolean expressions", function (){
        expect(this.terp.leval("(or true false)")).toBe(true);
        expect(this.terp.leval("(and true false)")).toBe(false);
        expect(this.terp.leval("(not true)")).toBe(false);
        expect(this.terp.leval("(not false)")).toBe(true);
        expect(this.terp.leval(["and", "true", "false"])).toBe(false);
        expect(this.terp.leval(["not", ["and", "true", "false"]])).toBe(true);
        expect(this.terp.leval("(not (and true false))")).toBe(true);
        expect(this.terp.leval("(or (not (and true false)) 5)")).toBe(true);
    });
});


xdescribe("simple arithmetic levaluation", function() {
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should handle literal integers", function (){
        expect(this.terp.leval("2")).toBe(2);
    });
    it("Should handle literal floats", function (){
        expect(this.terp.leval("2.3")).toBe(2.3);
    });
    it("Should handle literal floats in exponential/scientific notation", function (){
        expect(this.terp.leval("2.3e-3")).toBe(0.0023);
    });
    it("Should handle newly defined literals", function (){
        var otherterp = new interpreter.Interpreter();
        otherterp._literals = {'6': 8, "MoLtUaE": 42};
        expect(otherterp.leval('6')).toBe(8);
        expect(otherterp.leval('MoLtUaE')).toBe(42);
        expect(this.terp.leval('6')).toBe(6);
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
        expect(this.terp.leval("2.3e-3")).toBe(0.0023);
    });
    it("Should leval builtin arithmetic symbols to functions", function (){
        var plus = (this.terp).leval("+");
        expect(plus(2,3)).toBe(5);
        var mod = (this.terp).leval("%");
        expect(mod(8,3)).toBe(2);
    });
    it("Should handle expressions of builtin arithmetic", function(){
        var result = (this.terp).leval("( + 2 3)");
        expect(result).toBe(5);
    });
    it("Should error on any other expression", function (){
        var that = this
        expect(function (){that.terp.leval("(def a 3)")}).toThrow("Invalid Expression.");
    });
});

xdescribe("simple list levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should recognise list expressions", function(){
        expect(this.terp._is_compound(["add", "3", "4"])).toBe(true);
        expect(this.terp._is_compound(["add"])).toBe(true);
        expect(this.terp._is_compound([])).toBe(true);
    });
    xit("Should recognise simple compound expressions", function(){
        expect(this.terp._is_compound('4')).toBe(false);
        expect(this.terp._is_compound('5.6e2')).toBe(false);
        expect(this.terp._is_compound('%')).toBe(false);
        expect(this.terp._is_compound('/ 4')).toBe(false);
        expect(this.terp._is_compound('(+ 3 5)')).toBe(true);
        expect(this.terp._is_compound('(3)')).toBe(true);
    });
    xit("Should split expressions into lists properly", function (){
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
});
