To see the interpreter in action, visit http://amfarrell.com/scheme/

or install and run it locally with:

    `sudo apt-get install nodejs`

    `node ./interpreter.js`

Note that this is a work in process and currently only has the folowing special forms:

* `let`

* `lambda`

* `if`

There is also a `print` special form, where `(print (+ 3 4)` prints the value of its argument to the console before returning it and `(print (a b) (+ a b)` prints the values of a and b before returning the value of `(+ a b)`.
