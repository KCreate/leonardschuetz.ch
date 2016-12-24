# The Charly programming language
## 20. November 2016

I've recently been working on my own programming language.

I call it Charly.

Charly is a interpreted, dynamically-typed and object-oriented programming language.
It borrows some concepts from Ruby, such as operator overloading or treating the primitive types as objects.
The syntax is inspired by JavaScript.

Check out the official language and syntax guide at [leonardschuetz.ch/charly](https://leonardschuetz.ch/charly/)

# Hello World
This is the simplest way to print "Hello World" in Charly.

> Note: All syntax samples are highlighted using the JavaScript highlighter. Since both languages share a lot of their syntax and grammar, this works out most of the time.

```javascript
print("Hello World")
```

You can also do it via callbacks

```javascript
"Hello World".each(->(char) {
  write(char)
})
```

Or via an object

```javascript
class Greeter {
  property name

  func constructor(name) {
    @name = name
  }

  func greet() {
    print("Hello " + @name)
  }
}

let myGreeter = Greeter("World")
myGreeter.greet() # Hello World
```

You also have the ability to extend the primitive types

```javascript
String.methods.greet = ->{
  print("Hello " + self)
}

"World".greet() # Hello World
```

# Primitives

Currently there are 9 primitives in the language.

- String
- Numeric
- Boolean
- Null
- Array
- Object
- Class
- PrimitiveClass
- Function

You can extend each of these primitives with your own methods.

# Native extensions

Charly currently has rudimentary support for native extensions written in crystal. The way this works is via crystal files that are compiled directly into the interpreter.

You can create your own extensions by adding a new file to __src/charly/interpreter/internals__. This is inside the github repo of the charly interpreter.

```crystal
require "../**"

module Charly::Internals

  charly_api "mymethod", myarg : TString do
    return TString.new("You said: " + myarg.value)
  end

end
```

After you've recompiled and reinstalled the interpreter, you are able to link against the method inside your charly program like this:

```javascript
const mymethod = __internal__method("mymethod")

print(mymethod("Hello World")) # You said: Hello World
```

You can check out the source code on the [GitHub repo](https://github.com/KCreate/charly-lang). Charly is also featured inside [awesome-crystal](http://awesome-crystal.com/#awesome-crystal-implementationscompilers) under the section `Implementations/Compilers`
