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
    gsChars = [[32..91]..., [93..126]...].map (x) -> "#{String.fromCharCode x}"
    
    for char in gsChars
      {tokens} = grammar.tokenizeLine '\'' + char + '\''
      expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
      expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry']
      expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']
    
    charsByScope = {
      'constant.character.escape.curry': ['\\NUL', '\\SP', '\\DEL', '\\a', '\\b', '\\f', '\\n', '\\r', '\\t', '\\v', '\\\\', '\\"', '\\\'']
      'constant.character.escape.control.curry': [64..95].map (x) -> "\\^#{String.fromCharCode x}"
      'constant.character.escape.decimal.curry': ['\\7', '\\21', '\\42', '\\73']
      'constant.character.escape.hexadecimal.curry': ['\\x7', '\\x21aF', '\\x42', '\\x73Af']
      'constant.character.escape.octal.curry': ['\\o7', '\\o21', '\\o42', '\\o73']
    }
    
    for scope, chars of charsByScope
      for char in chars
        {tokens} = grammar.tokenizeLine '\'' + char + '\''
        expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
        expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]
        expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']
  
  it "tokenizes unit", ->
    {tokens} = grammar.tokenizeLine '()'
    expect(tokens[0]).toEqual value: '()', scopes: ['source.curry', 'constant.language.unit.curry']