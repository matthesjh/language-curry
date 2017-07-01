describe 'language-curry', ->
  grammar = null

  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage 'language-curry'

    runs ->
      grammar = atom.grammars.grammarForScopeName 'source.curry'

  it 'parses the grammar', ->
    expect(grammar).toBeTruthy()
    expect(grammar.scopeName).toBe 'source.curry'

  it 'tokenizes the empty list', ->
    {tokens} = grammar.tokenizeLine '[]'

    expect(tokens[0]).toEqual value: '[]', scopes: ['source.curry', 'constant.language.empty-list.curry']

  it 'tokenizes the unit constant', ->
    {tokens} = grammar.tokenizeLine '()'

    expect(tokens[0]).toEqual value: '()', scopes: ['source.curry', 'constant.language.unit.curry']

  it 'tokenizes the comma separator', ->
    {tokens} = grammar.tokenizeLine ','

    expect(tokens[0]).toEqual value: ',', scopes: ['source.curry', 'punctuation.separator.comma.curry']

  it 'tokenizes the pipe separator', ->
    {tokens} = grammar.tokenizeLine '|'

    expect(tokens[0]).toEqual value: '|', scopes: ['source.curry', 'punctuation.separator.pipe.curry']

  it 'tokenizes the variable wildcard', ->
    {tokens} = grammar.tokenizeLine '_'

    expect(tokens[0]).toEqual value: '_', scopes: ['source.curry', 'variable.other.wildcard.curry']

  it 'tokenizes the assignment keyword', ->
    {tokens} = grammar.tokenizeLine '='

    expect(tokens[0]).toEqual value: '=', scopes: ['source.curry', 'keyword.other.assignment.curry']

  it 'tokenizes quoted characters', ->
    gsChars = [[32..91]..., [93..126]...].map (x) -> String.fromCharCode x

    for char in gsChars
      {tokens} = grammar.tokenizeLine '\'' + char + '\''

      expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
      expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry']
      expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']

    charsByScope = {
      'constant.character.escape.curry': ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', 'SP', 'DEL', 'a', 'b', 'f', 'n', 'r', 't', 'v', '\\', '"', '\'']
      'constant.character.escape.control.curry': [64..95].map (x) -> '^' + String.fromCharCode x
      'constant.character.escape.decimal.curry': ['0', '7', '21', '42', '73', '5689']
      'constant.character.escape.hexadecimal.curry': ['x0', 'x7', 'x21aF', 'x42', 'x73Af', 'x5689']
      'constant.character.escape.octal.curry': ['o0', 'o7', 'o21', 'o42', 'o56', 'o73']
    }

    for scope, chars of charsByScope
      for char in chars
        char = '\\' + char
        {tokens} = grammar.tokenizeLine '\'' + char + '\''

        expect(tokens[0]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']
        expect(tokens[1]).toEqual value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]
        expect(tokens[2]).toEqual value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']

  it 'tokenizes single-line strings', ->
    {tokens} = grammar.tokenizeLine '"Hello, World!\\nCurry is a programming language.\\n\\EOT"'

    expect(tokens[0]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']
    expect(tokens[1]).toEqual value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[2]).toEqual value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[3]).toEqual value: 'Curry is a programming language.', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(tokens[4]).toEqual value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[5]).toEqual value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(tokens[6]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']

  it 'tokenizes multi-line strings', ->
    lines = grammar.tokenizeLines """
      "Hello, World!
      Curry is a programming language.
      \\EOT"
    """

    expect(lines[0][0]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']
    expect(lines[0][1]).toEqual value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(lines[1][0]).toEqual value: 'Curry is a programming language.', scopes: ['source.curry', 'string.quoted.double.curry']
    expect(lines[2][0]).toEqual value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']
    expect(lines[2][1]).toEqual value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']

  it 'tokenizes numeric literals', ->
    {tokens} = grammar.tokenizeLine '0b100 0B0101'
    
    expect(tokens[0]).toEqual value: '0b100', scopes: ['source.curry', 'constant.numeric.binary.curry']
    expect(tokens[2]).toEqual value: '0B0101', scopes: ['source.curry', 'constant.numeric.binary.curry']

    {tokens} = grammar.tokenizeLine '0 7 21 42 73 5689'

    expect(tokens[0]).toEqual value: '0', scopes: ['source.curry', 'constant.numeric.decimal.curry']
    expect(tokens[2]).toEqual value: '7', scopes: ['source.curry', 'constant.numeric.decimal.curry']
    expect(tokens[4]).toEqual value: '21', scopes: ['source.curry', 'constant.numeric.decimal.curry']
    expect(tokens[6]).toEqual value: '42', scopes: ['source.curry', 'constant.numeric.decimal.curry']
    expect(tokens[8]).toEqual value: '73', scopes: ['source.curry', 'constant.numeric.decimal.curry']
    expect(tokens[10]).toEqual value: '5689', scopes: ['source.curry', 'constant.numeric.decimal.curry']

    {tokens} = grammar.tokenizeLine '0x0 0x7 0x21aF 0x42 0x73Af 0x5689 0X0 0X7 0X21aF 0X42 0X73Af 0X5689'

    expect(tokens[0]).toEqual value: '0x0', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[2]).toEqual value: '0x7', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[4]).toEqual value: '0x21aF', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[6]).toEqual value: '0x42', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[8]).toEqual value: '0x73Af', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[10]).toEqual value: '0x5689', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[12]).toEqual value: '0X0', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[14]).toEqual value: '0X7', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[16]).toEqual value: '0X21aF', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[18]).toEqual value: '0X42', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[20]).toEqual value: '0X73Af', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']
    expect(tokens[22]).toEqual value: '0X5689', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']

    {tokens} = grammar.tokenizeLine '0o0 0o7 0o21 0o42 0o56 0o73 0O0 0O7 0O21 0O42 0O56 0O73'

    expect(tokens[0]).toEqual value: '0o0', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[2]).toEqual value: '0o7', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[4]).toEqual value: '0o21', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[6]).toEqual value: '0o42', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[8]).toEqual value: '0o56', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[10]).toEqual value: '0o73', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[12]).toEqual value: '0O0', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[14]).toEqual value: '0O7', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[16]).toEqual value: '0O21', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[18]).toEqual value: '0O42', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[20]).toEqual value: '0O56', scopes: ['source.curry', 'constant.numeric.octal.curry']
    expect(tokens[22]).toEqual value: '0O73', scopes: ['source.curry', 'constant.numeric.octal.curry']

    {tokens} = grammar.tokenizeLine '0.0 0.5 42.0 21e5 30e+5 0.3E+2 0E+2 73e-10 6E-9 80.275'

    expect(tokens[0]).toEqual value: '0.0', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[2]).toEqual value: '0.5', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[4]).toEqual value: '42.0', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[6]).toEqual value: '21e5', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[8]).toEqual value: '30e+5', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[10]).toEqual value: '0.3E+2', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[12]).toEqual value: '0E+2', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[14]).toEqual value: '73e-10', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[16]).toEqual value: '6E-9', scopes: ['source.curry', 'constant.numeric.float.curry']
    expect(tokens[18]).toEqual value: '80.275', scopes: ['source.curry', 'constant.numeric.float.curry']

  it 'tokenizes imports', ->
    {tokens} = grammar.tokenizeLine 'import Module'

    expect(tokens[0]).toEqual value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']
    expect(tokens[2]).toEqual value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']

    {tokens} = grammar.tokenizeLine 'import qualified Module as M'

    expect(tokens[0]).toEqual value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']
    expect(tokens[2]).toEqual value: 'qualified', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.qualified.curry']
    expect(tokens[4]).toEqual value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']
    expect(tokens[6]).toEqual value: 'as', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.as.curry']
    expect(tokens[8]).toEqual value: 'M', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']

    {tokens} = grammar.tokenizeLine 'import Prelude (Bool (..), Either (Left, Right), Maybe, map, (++))'

    expect(tokens[0]).toEqual value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']
    expect(tokens[2]).toEqual value: 'Prelude', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']
    expect(tokens[4]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']
    expect(tokens[5]).toEqual value: 'Bool', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']
    expect(tokens[7]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(tokens[8]).toEqual value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']
    expect(tokens[9]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(tokens[10]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[12]).toEqual value: 'Either', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Either.curry']
    expect(tokens[14]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(tokens[15]).toEqual value: 'Left', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Left.curry']
    expect(tokens[16]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(tokens[18]).toEqual value: 'Right', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Right.curry']
    expect(tokens[19]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(tokens[20]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[22]).toEqual value: 'Maybe', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Maybe.curry']
    expect(tokens[23]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[25]).toEqual value: 'map', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(tokens[26]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[28]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']
    expect(tokens[29]).toEqual value: '++', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']
    expect(tokens[30]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']
    expect(tokens[31]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']

    {tokens} = grammar.tokenizeLine 'import qualified Prelude as P hiding (Ordering (..), (?), concat, filter)'

    expect(tokens[0]).toEqual value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']
    expect(tokens[2]).toEqual value: 'qualified', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.qualified.curry']
    expect(tokens[4]).toEqual value: 'Prelude', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']
    expect(tokens[6]).toEqual value: 'as', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.as.curry']
    expect(tokens[8]).toEqual value: 'P', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']
    expect(tokens[10]).toEqual value: 'hiding', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.hiding.curry']
    expect(tokens[12]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']
    expect(tokens[13]).toEqual value: 'Ordering', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Ordering.curry']
    expect(tokens[15]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(tokens[16]).toEqual value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']
    expect(tokens[17]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(tokens[18]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[20]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']
    expect(tokens[21]).toEqual value: '?', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']
    expect(tokens[22]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']
    expect(tokens[23]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[25]).toEqual value: 'concat', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(tokens[26]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[28]).toEqual value: 'filter', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(tokens[29]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']

    lines = grammar.tokenizeLines """
      import Module
        ( Attr ((:=)), Color (..), Point (px, py), Tree (Leaf, Node), XML
        -- This is a comment!
        , showAttr, (:->) -- This is another comment!
        )
    """

    expect(lines[0][0]).toEqual value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']
    expect(lines[0][2]).toEqual value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']
    expect(lines[1][1]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']
    expect(lines[1][3]).toEqual value: 'Attr', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][5]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][6]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.begin.curry']
    expect(lines[1][7]).toEqual value: ':=', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.curry']
    expect(lines[1][8]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.end.curry']
    expect(lines[1][9]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][10]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][12]).toEqual value: 'Color', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][14]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][15]).toEqual value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']
    expect(lines[1][16]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][17]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][19]).toEqual value: 'Point', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][21]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][22]).toEqual value: 'px', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.other.attribute-name.curry']
    expect(lines[1][23]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][25]).toEqual value: 'py', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.other.attribute-name.curry']
    expect(lines[1][26]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][27]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][29]).toEqual value: 'Tree', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][31]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][32]).toEqual value: 'Leaf', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']
    expect(lines[1][33]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][35]).toEqual value: 'Node', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']
    expect(lines[1][36]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][37]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][39]).toEqual value: 'XML', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[2][0]).toEqual value: '  ', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.whitespace.comment.leading.curry']
    expect(lines[2][1]).toEqual value: '--', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']
    expect(lines[2][2]).toEqual value: ' This is a comment!', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']
    expect(lines[3][1]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[3][3]).toEqual value: 'showAttr', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(lines[3][4]).toEqual value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[3][6]).toEqual value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']
    expect(lines[3][7]).toEqual value: ':->', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']
    expect(lines[3][8]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']
    expect(lines[3][10]).toEqual value: '--', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']
    expect(lines[3][11]).toEqual value: ' This is another comment!', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']
    expect(lines[4][1]).toEqual value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']

  it 'tokenizes module declarations', ->
    {tokens} = grammar.tokenizeLine 'module Prelude where'

    expect(tokens[0]).toEqual value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']
    expect(tokens[2]).toEqual value: 'Prelude', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']
    expect(tokens[4]).toEqual value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']

    {tokens} = grammar.tokenizeLine 'module Prelude (Bool (..), Either (Left, Right), Maybe, map, (++)) where'

    expect(tokens[0]).toEqual value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']
    expect(tokens[2]).toEqual value: 'Prelude', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']
    expect(tokens[4]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']
    expect(tokens[5]).toEqual value: 'Bool', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']
    expect(tokens[7]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(tokens[8]).toEqual value: '..', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']
    expect(tokens[9]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(tokens[10]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[12]).toEqual value: 'Either', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Either.curry']
    expect(tokens[14]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(tokens[15]).toEqual value: 'Left', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Left.curry']
    expect(tokens[16]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(tokens[18]).toEqual value: 'Right', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Right.curry']
    expect(tokens[19]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(tokens[20]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[22]).toEqual value: 'Maybe', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Maybe.curry']
    expect(tokens[23]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[25]).toEqual value: 'map', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(tokens[26]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(tokens[28]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']
    expect(tokens[29]).toEqual value: '++', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']
    expect(tokens[30]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']
    expect(tokens[31]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']
    expect(tokens[33]).toEqual value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']

    lines = grammar.tokenizeLines """
      module Module
        ( Attr ((:=)), Color (..), Point (px, py), Tree (Leaf, Node), XML
        -- This is a comment!
        , showAttr, (:->) -- This is another comment!
        ) where
    """

    expect(lines[0][0]).toEqual value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']
    expect(lines[0][2]).toEqual value: 'Module', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']
    expect(lines[1][1]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']
    expect(lines[1][3]).toEqual value: 'Attr', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][5]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][6]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.begin.curry']
    expect(lines[1][7]).toEqual value: ':=', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.curry']
    expect(lines[1][8]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.end.curry']
    expect(lines[1][9]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][10]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][12]).toEqual value: 'Color', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][14]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][15]).toEqual value: '..', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']
    expect(lines[1][16]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][17]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][19]).toEqual value: 'Point', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][21]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][22]).toEqual value: 'px', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.other.attribute-name.curry']
    expect(lines[1][23]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][25]).toEqual value: 'py', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.other.attribute-name.curry']
    expect(lines[1][26]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][27]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][29]).toEqual value: 'Tree', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[1][31]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']
    expect(lines[1][32]).toEqual value: 'Leaf', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']
    expect(lines[1][33]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][35]).toEqual value: 'Node', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']
    expect(lines[1][36]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']
    expect(lines[1][37]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[1][39]).toEqual value: 'XML', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']
    expect(lines[2][0]).toEqual value: '  ', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.whitespace.comment.leading.curry']
    expect(lines[2][1]).toEqual value: '--', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']
    expect(lines[2][2]).toEqual value: ' This is a comment!', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']
    expect(lines[3][1]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[3][3]).toEqual value: 'showAttr', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']
    expect(lines[3][4]).toEqual value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']
    expect(lines[3][6]).toEqual value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']
    expect(lines[3][7]).toEqual value: ':->', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']
    expect(lines[3][8]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']
    expect(lines[3][10]).toEqual value: '--', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']
    expect(lines[3][11]).toEqual value: ' This is another comment!', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']
    expect(lines[4][1]).toEqual value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']
    expect(lines[4][3]).toEqual value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']