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
  
  it "tokenizes unit", ->
    {tokens} = grammar.tokenizeLine '()'
    expect(tokens[0]).toEqual value: '()', scopes: ['source.curry', 'constant.language.unit.curry']
  
  it "tokenizes quoted characters", ->
    gsChars = [[32..91]..., [93..126]...].map (x) -> String.fromCharCode x
    
    for char in gsChars
      {tokens} = grammar.tokenizeLine '\'' + char + '\''
      expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
      expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry']
      expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']
    
    charsByScope = {
      'constant.character.escape.curry': ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', 'SP', 'DEL', 'a', 'b', 'f', 'n', 'r', 't', 'v', '\\', '"', '\'']
      'constant.character.escape.control.curry': [64..95].map (x) -> '^' + String.fromCharCode x
      'constant.character.escape.decimal.curry': ['7', '21', '42', '73']
      'constant.character.escape.hexadecimal.curry': ['x7', 'x21aF', 'x42', 'x73Af']
      'constant.character.escape.octal.curry': ['o7', 'o21', 'o42', 'o73']
    }
    
    for scope, chars of charsByScope
      for char in chars
        char = '\\' + char
        {tokens} = grammar.tokenizeLine '\'' + char + '\''
        expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
        expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]
        expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']
  
  it "tokenizes single-line strings", ->
    {tokens} = grammar.tokenizeLine '"Hello, World!\\nCurry is a programming language!\\n\\EOT"'
    expect(tokens[0]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']
    expect(tokens[1]).toEqual value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[2]).toEqual value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[3]).toEqual value: 'Curry is a programming language!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[4]).toEqual value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[5]).toEqual value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[6]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']
  
  it "tokenizes multi-line strings", ->
    tokens = grammar.tokenizeLines """
      "Hello, World!
      Curry is a programming language!
      \\EOT"
    """
    expect(tokens[0][0]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']
    expect(tokens[0][1]).toEqual value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[1][0]).toEqual value: 'Curry is a programming language!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[2][0]).toEqual value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[2][1]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']