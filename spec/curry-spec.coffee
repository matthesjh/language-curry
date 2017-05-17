describe "language-curry", ->
  grammar = null
  
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage 'language-curry'
    
    runs ->
      grammar = atom.grammars.grammarForScopeName 'source.curry'
  
  it "parses the grammar", ->
    expect(grammar).toBeTruthy()
    expect(grammar.scopeName).toBe 'source.curry'
  
  it "tokenizes empty list", ->
    {tokens} = grammar.tokenizeLine '[]'
    expect(tokens[0]).toEqual value: '[]', scopes: ['source.curry', 'constant.language.empty-list.curry']
  
  it "tokenizes quoted characters", ->
    chars = ['a', 'z', 'A', 'Z', '0', '9', ' ', '"', '\'', '\\']
    
    for char in chars
      {tokens} = grammar.tokenizeLine '\'' + char + '\''
      expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
      expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry']
      expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']
    
    charsByScope = {
      'constant.character.escape.curry': ['\\NUL', '\\DEL', '\\n', '\\t', '\\&', '\\\'']
      'constant.character.escape.control.curry': ['\\^A', '\\^Z', '\\^@', '\\^[', '\\^]', '\\^^', '\\^_']
      'constant.character.escape.decimal.curry': ['\\7', '\\42']
      'constant.character.escape.hexadecimal.curry': ['\\x7', '\\x42', '\\x73Af']
      'constant.character.escape.octal.curry': ['\\o7', '\\o42']
    }
    
    for scope, chars of charsByScope
      for char in chars
        {tokens} = grammar.tokenizeLine '\'' + char + '\''
        expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
        expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]
        expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']