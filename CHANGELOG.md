## 1.4.0 (2018-10-19)

* Added support for C preprocessor statements
* Improved highlighting of type classes in a `deriving` clause
* Updated the list of `Prelude` functions, operators, types and type classes

## 1.3.0 (2018-04-29)

* Added support for type classes

## 1.2.6 (2017-10-22)

* Converted CoffeeScript files to JavaScript
* Converted CSON files to JSON

## 1.2.5 (2017-07-28)

* Added new `modulex` snippet for module declarations with export list
* Removed export list parentheses from existing `module` snippet

## 1.2.4 (2017-07-09)

* Added `begin` and `end` scope selectors to parentheses of prefix operators

## 1.2.3 (2017-06-18)

* Added scope selectors for brackets
* Improved recognition of keywords in the `increaseIndentPattern`
* Removed `keyword.other` scope from the `\~` operator

## 1.2.2 (2017-05-31)

* Improved recognition of type annotations without surrounding parentheses
* Removed `keyword.operator` scope from operator module qualifier

## 1.2.1 (2017-05-28)

* Added support for infix type constructors in data declarations
* Fixed a bug where only a part of an operator was highlighted

## 1.2.0 (2017-05-25)

* Added support for type annotations
* Added support for prefix operators in data declarations
* Added support for qualified operators
* Added highlighting for preprocessor keywords
* Changed highlighting of several keywords
* Changed highlighting of operators from the `Prelude`
* Fixed incorrect highlighting of numeric literals
* Fixed recognition of qualified prefix operators

## 1.1.0 (2017-05-22)

* Added highlighting for wildcards in expressions (`_`) and export list (`..`)
* Added highlighting for infix type constructors
* Added support for highlighting of integrated code with language tag `html`, `xml` or `sql`
* Changed highlighting of the `infix[lr]` keywords
* Changed recognition of quoted characters to match specification

## 1.0.1 (2017-05-16)

* Fixed a bug where an escaped single quote was not recognized as a character

## 1.0.0 (2017-04-02)

* First release