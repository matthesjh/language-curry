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
  
  it "tokenizes quoted characters", ->
    chars = ['a', 'z', 'A', 'Z', '0', '9', ' ', '"', '\'', '\\']
    
    for char in chars
      {tokens} = grammar.tokenizeLine '\'' + char + '\''
      expect(tokens).toEqual [
        {value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']}
        {value: char, scopes: ['source.curry', 'string.quoted.single.curry']}
        {value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']}
      ]
    
    escapedCharsByScope = {
      'constant.character.escape.curry': ['\\NUL', '\\DEL', '\\n', '\\t', '\\&', '\\\'']
      'constant.character.escape.decimal.curry': ['\\7', '\\42']
      'constant.character.escape.octal.curry': ['\\o7', '\\o42']
      'constant.character.escape.hexadecimal.curry': ['\\x7', '\\x42', '\\x73Af']
      'constant.character.escape.control.curry': ['\\^A', '\\^Z', '\\^@', '\\^[', '\\^]', '\\^^', '\\^_']
    }
    
    for scope, chars of escapedCharsByScope
      for char in chars
        {tokens} = grammar.tokenizeLine '\'' + char + '\''
        expect(tokens).toEqual [
          {value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']}
          {value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]}
          {value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']}
        ]