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
describe("printing", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("not interfere with return value", function(){
        expect(this.terp.leval("(print (+ 3 4))")).toEqual(7)
        expect(this.terp.leval("(print (- 3 4))")).toEqual(-1)
        expect(this.terp.leval("(let ((a 3)(b 5)) (+ a b))")).toEqual(8)
        expect(this.terp.leval("(let ((a 3)(b 5)) (print (a b) (+ a b)))")).toEqual(8)
    });
});
describe("recursive definitions of lambdas", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should work fine defining fibonacci", function(){
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 1))")).toBe(1)
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 2))")).toBe(1)
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 3))")).toBe(2)
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 4))")).toBe(3)
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 5))")).toBe(5)
        expect(this.terp.leval("(let ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))) )) (fib 6))")).toBe(8)
    });
    it("Should be able to use a recursive function we've manually put into the environment", function(){
        expect(this.terp.leval("(print 1)")).toBe(1)
        var evaluated_fact = this.terp._leval_lambda("(lambda (n) \
                                                                (if (<= n 1)\
                                                                     1 \
                                                                    (* (fact (- n 1)) n) \
                                                                ) \
                                                        )", this.terp._builtins)
        this.terp._builtins.assign('fact', evaluated_fact);
        expect(this.terp.apply(evaluated_fact, [5])).toBe(120)
        expect(this.terp.apply(evaluated_fact, [1])).toBe(1)
        //These all use the evaluated definition of fact
        expect(this.terp.leval("(let ((fact (lambda (n) (if (<= n 1) 1 (* (fact (- n 1)) n) )))) \
                                                                                            (fact 4))")).toBe(24)
        expect(this.terp.leval("(let ((fact (lambda (n) (if (<= n 1) 1 (* (fact (- n 1)) n) ))) (a 2)) \
                                                                                            (fact 2))")).toBe(2)
        expect(this.terp.leval("(let ((fact (lambda (n) (if (<= n 1) 1 (* (fact (- n 1)) n) ))) (a 2)) \
                                                                                            (fact a))")).toBe(2)
        expect(this.terp.leval("(let ((fact (lambda (n) (if (<= n 1) 1 (* (fact (- n 1)) n) ))) (a 5)) \
                                                                                            (fact a))")).toBe(120)
    });
    it("Should be able to put itself into its own environment", function() {

    });
});
describe("lambda levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    xit("Should recognise lambda expressions", function (){
        expect(this.terp._is_lambda('4')).toBe(false);
        expect(this.terp._is_lambda('5.6e2')).toBe(false);
        expect(this.terp._is_lambda('%')).toBe(false);
        expect(this.terp._is_lambda('/ 4')).toBe(false);
        expect(this.terp._is_lambda('(+ 3 5)')).toBe(false);
        expect(this.terp._is_lambda('(3)')).toBe(false);
        expect(this.terp._is_lambda('(lambda (x) (+ x 3))')).toBe(true);
        expect(this.terp._is_lambda('(lambda (x b) (- b (+ x 3)))')).toBe(true);
    });
    xit("Should extract lambda parameters", function (){
        expect(this.terp._lambda_params('(lambda (x) (+ x 3))')).toEqual(['x']);
        expect(this.terp._lambda_params('(lambda (x b) (- b (+ x 3)))')).toEqual(['x', 'b']);
    });
    xit("Should extract lambda body", function (){
        expect(this.terp._lambda_body('(lambda (x) (+ x 3))')).toEqual(['+', 'x', '3']);
        expect(this.terp._lambda_body('(lambda (x b) (- b (+ x 3)))')).toEqual(['-', 'b', ['+', 'x', '3']]);
    });
    xit("Should create lambda correctly", function(){
        var global = this.terp._builtins;
        var fun = this.terp._leval_lambda('(lambda (x) (+ x 3))', global)
        expect(fun.body).toEqual(['+', 'x', '3']);
        expect(fun.params).toEqual(['x']);
        expect(fun.env).not.toBe(global);
        expect(fun.env._predecessor).toBe(global);
    });
    it("Should fill in params correctly", function(){
        var global = this.terp._builtins;
        var fun = this.terp._leval_lambda('(lambda (x) (+ x 3))', global)
        var new_env = fun.fill_environment(["3"]);
        expect(new_env.lookup('sentenel')).toBe("sentenel")
        expect(new_env.lookup('x')).toBe("3")

    });
    it("Should be looked up correctly", function(){
        var global = this.terp._builtins;
        var fun = this.terp._leval_lambda('(lambda (x) (+ x 3))', global)
        this.terp._builtins.assign('addthree', fun);
        expect(fun.env.lookup('addthree').params).toEqual(["x"])
    });
    it("Should evaluate its body correctly", function(){
        var global = this.terp._builtins;
        var fun = this.terp._leval_lambda('(lambda (x) (+ x 3))', global)
        var new_env = fun.fill_environment([3]);
        expect(this.terp.leval(['+', '3', '3'], new_env)).toBe(6);
        expect(this.terp.leval(fun.body, new_env)).toBe(6);
    });
    it("Should be called correctly", function(){
        var global = this.terp._builtins;
        var fun = this.terp._leval_lambda('(lambda (x) (+ x 3))', global)
        this.terp._builtins.assign('addthree', fun);
        expect(this.terp.leval(['addthree', '3'])).toBe(6);
        expect(this.terp.leval('(addthree 3)')).toBe(6);
    });
    it("Should return a new function from a function correctly", function(){
        expect(this.terp.leval('(((lambda (x) (lambda (y) (+ x y))) 3) 4)')).toBe(7);
    });
});
describe("assigment levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should assign and lookup in global scope correctly", function(){
        expect(this.terp._leval_let("(let ((x 3) (y 5)) (+ 2 2))", this.terp._builtins)).toBe(4);
        expect(this.terp._leval_let("(let ((x 3) (y 5)) (+ x y))", this.terp._builtins)).toBe(8);
    });
    it("Should assign in scope looked up by lambda correctly", function(){
        expect(this.terp.leval("((let ((x 3)) (lambda (y) (+ x y))) 17)")).toBe(20);
    });
});

describe("environment operations", function(){
    it("Global environment assignment and lookup should work", function (){
        var global = new interpreter.GlobeEnv();
        global.assign("a", 4);
        expect(global.lookup("a")).toBe(4);
        global.assign("b", [3, 4]);
        expect(global.lookup("b")).toEqual([3, 4]);
    });
    it("Global environment chained assignment and lookup should work", function (){
        var global = new interpreter.GlobeEnv();
        global.assign("a", 4).assign("b", [3, 4]);
        expect(global._variables["a"]).toBe(4);
        expect(global.lookup("a")).toBe(4);
        expect(global.lookup("b")).toEqual([3, 4]);
    });
    it("Global environment should be able to spawn local environment", function (){
        var global = new interpreter.GlobeEnv();
        global.assign("a", 4).assign("b", [3, 4]);
        var local = global.extend();
        expect(local._predecessor).toBe(global);
        expect(local.lookup("a")).toBe(4);
    });
    it("assigning immutables in local environment should not affect global environment", function (){
        var global = new interpreter.GlobeEnv();
        global.assign("a", 4).assign("b", [3, 4]);
        var local = global.extend();
        local.assign("a", 6);
    });
    it("Modifying mutables from local environment should affect global environment; assigning them should not", function (){
        var global = new interpreter.GlobeEnv();
        var local = global.extend();
        global.assign("a", 4).assign("b", [3, 4]);
        expect(local.lookup("b")).toEqual([3,4]);
        local.lookup("b")[0] = 2;
        expect(local.lookup("b")).toEqual([2,4]);
        expect(global.lookup("b")).toEqual([2,4]);
        local.assign("b", [7,8]);
        expect(local.lookup("b")).toEqual([7,8]);
        expect(global.lookup("b")).toEqual([2,4]);
    });
    it("Lookups should work across multiple local environments", function (){
        var global = new interpreter.GlobeEnv();
        var local1 = global.extend();
        var local2 = local1.extend();
        var local3 = local2.extend();
        local1.assign("b", [7,8]);
        expect(local3.lookup("b")).toEqual([7,8]);
        expect(function(){global.lookup("b")}).toThrow();
        var local1_2 = global.extend();
        expect(function(){local1_2.lookup("b")}).toThrow();
        local1_2.assign("b", 4);
        expect(local3.lookup("b")).toEqual([7,8]);
        expect(local1_2.lookup("b")).toEqual(4);
    });
});

describe("conditional and boolean levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    xit("Should recognise if expressions", function (){
        expect(this.terp._is_if('(+ 3 5)')).toBe(false);
        expect(this.terp._is_if('(3)')).toBe(false);
        expect(this.terp._is_if('(if (x) (+ x 3) (- x 4))')).toBe(true);
        expect(this.terp._is_if('(if (x) (+ x 3))')).toBe(false);
        expect(this.terp._is_if('(if (x b) (- b (+ x 3)))')).toBe(false);
    });
    xit("Should correctly levaluate if expressions", function (){
        expect(this.terp._leval_if('(if true 5 7)')).toBe(5);
        expect(this.terp._leval_if('(if false 5 7)')).toBe(7);
    });
    it("Should not evaluate the inactive parts of an if expression", function (){
        expect(this.terp._leval_if('(if true 5 (/ 5 x))')).toBe(5);
        expect(this.terp._leval_if('(if false 5 (/ 5 0))')).toBe(Infinity);
    });
    xit("Should recognise boolean literals", function (){
        expect(this.terp._is_literal("true")).toBe(true);
        expect(this.terp._is_literal("false")).toBe(true);
    });
    xit("Should handle boolean literals", function (){
        expect(this.terp.leval("true")).toBe(true);
        expect(this.terp.leval("false")).toBe(false);
    });
    xit("Should handle boolean expressions", function (){
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


describe("simple arithmetic levaluation", function() {
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
        expect(this.terp._is_variable('+')).toBe(true);
        expect(this.terp._is_variable('-')).toBe(true);
        expect(this.terp._is_variable('*')).toBe(true);
        expect(this.terp._is_variable('/')).toBe(true);
        expect(this.terp._is_variable('%')).toBe(true);
        expect(this.terp._is_variable('5')).toBe(false);
        expect(this.terp._is_variable('(+ 3 5)')).toBe(false);
    });
    it("Should recognise literals", function(){
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
        var that = this;
        expect(function (){that.terp.leval("(def a 3)")}).toThrow();
    });
});

describe("simple list levaluation", function(){
    beforeEach(function(){
        this.terp = new interpreter.Interpreter();
    });
    it("Should recognise list expressions", function(){
        expect(this.terp._is_compound(["add", "3", "4"])).toBe(true);
        expect(this.terp._is_compound(["add"])).toBe(true);
        expect(this.terp._is_compound([])).toBe(true);
    });
    it("Should recognise simple compound expressions", function(){
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
});

describe("", function(){

});
