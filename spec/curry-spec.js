describe('language-curry', () => {
  let grammar = null;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('language-curry'));

    runs(() => {
      grammar = atom.grammars.grammarForScopeName('source.curry');
    });
  });

  it('parses the grammar', () => {
    expect(grammar).toBeTruthy();
    expect(grammar.scopeName).toBe('source.curry');
  });

  it('tokenizes the empty list', () => {
    const {tokens} = grammar.tokenizeLine('[]');

    expect(tokens[0]).toEqual({value: '[]', scopes: ['source.curry', 'constant.language.empty-list.curry']});
  });

  it('tokenizes the unit constant', () => {
    const {tokens} = grammar.tokenizeLine('()');

    expect(tokens[0]).toEqual({value: '()', scopes: ['source.curry', 'constant.language.unit.curry']});
  });

  it('tokenizes the comma separator', () => {
    const {tokens} = grammar.tokenizeLine(',');

    expect(tokens[0]).toEqual({value: ',', scopes: ['source.curry', 'punctuation.separator.comma.curry']});
  });

  it('tokenizes the pipe separator', () => {
    const {tokens} = grammar.tokenizeLine('|');

    expect(tokens[0]).toEqual({value: '|', scopes: ['source.curry', 'punctuation.separator.pipe.curry']});
  });

  it('tokenizes the variable wildcard', () => {
    const {tokens} = grammar.tokenizeLine('_');

    expect(tokens[0]).toEqual({value: '_', scopes: ['source.curry', 'variable.other.wildcard.curry']});
  });

  it('tokenizes the assignment keyword', () => {
    const {tokens} = grammar.tokenizeLine('=');

    expect(tokens[0]).toEqual({value: '=', scopes: ['source.curry', 'keyword.other.assignment.curry']});
  });

  it('tokenizes quoted characters', () => {
    const gsChars = [...range(32, 91, true), ...range(93, 126, true)].map(x => String.fromCharCode(x));

    for (const char of gsChars) {
      const {tokens} = grammar.tokenizeLine(`'${char}'`);

      expect(tokens[0]).toEqual({value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']});
      expect(tokens[1]).toEqual({value: char, scopes: ['source.curry', 'string.quoted.single.curry']});
      expect(tokens[2]).toEqual({value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']});
    }

    const charsByScope = {
      'constant.character.escape.curry': ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', 'SP', 'DEL', 'a', 'b', 'f', 'n', 'r', 't', 'v', '\\', '"', '\''],
      'constant.character.escape.control.curry': range(64, 95, true).map(x => `^${String.fromCharCode(x)}`),
      'constant.character.escape.decimal.curry': ['0', '7', '21', '42', '73', '5689'],
      'constant.character.escape.hexadecimal.curry': ['x0', 'x7', 'x21aF', 'x42', 'x73Af', 'x5689'],
      'constant.character.escape.octal.curry': ['o0', 'o7', 'o21', 'o42', 'o56', 'o73']
    };

    for (const scope in charsByScope) {
      for (let char of charsByScope[scope]) {
        char = `\\${char}`;
        const {tokens} = grammar.tokenizeLine(`'${char}'`);

        expect(tokens[0]).toEqual({value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.begin.curry']});
        expect(tokens[1]).toEqual({value: char, scopes: ['source.curry', 'string.quoted.single.curry', scope]});
        expect(tokens[2]).toEqual({value: '\'', scopes: ['source.curry', 'string.quoted.single.curry', 'punctuation.definition.string.end.curry']});
      }
    }
  });

  it('tokenizes single-line strings', () => {
    const {tokens} = grammar.tokenizeLine('"Hello, World!\\nCurry is a programming language.\\n\\EOT"');

    expect(tokens[0]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']});
    expect(tokens[1]).toEqual({value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']});
    expect(tokens[2]).toEqual({value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']});
    expect(tokens[3]).toEqual({value: 'Curry is a programming language.', scopes: ['source.curry', 'string.quoted.double.curry']});
    expect(tokens[4]).toEqual({value: '\\n', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']});
    expect(tokens[5]).toEqual({value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']});
    expect(tokens[6]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']});
  });

  it('tokenizes multi-line strings', () => {
    const lines = grammar.tokenizeLines('"Hello, World!\nCurry is a programming language.\n\\EOT"');

    expect(lines[0][0]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']});
    expect(lines[0][1]).toEqual({value: 'Hello, World!', scopes: ['source.curry', 'string.quoted.double.curry']});
    expect(lines[1][0]).toEqual({value: 'Curry is a programming language.', scopes: ['source.curry', 'string.quoted.double.curry']});
    expect(lines[2][0]).toEqual({value: '\\EOT', scopes: ['source.curry', 'string.quoted.double.curry', 'constant.character.escape.curry']});
    expect(lines[2][1]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']});
  });

  it('tokenizes numeric literals', () => {
    let {tokens} = grammar.tokenizeLine('0b100 0B0101');

    expect(tokens[0]).toEqual({value: '0b100', scopes: ['source.curry', 'constant.numeric.binary.curry']});
    expect(tokens[2]).toEqual({value: '0B0101', scopes: ['source.curry', 'constant.numeric.binary.curry']});

    ({tokens} = grammar.tokenizeLine('0 7 21 42 73 5689'));

    expect(tokens[0]).toEqual({value: '0', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[2]).toEqual({value: '7', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '21', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[6]).toEqual({value: '42', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[8]).toEqual({value: '73', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[10]).toEqual({value: '5689', scopes: ['source.curry', 'constant.numeric.decimal.curry']});

    ({tokens} = grammar.tokenizeLine('0x0 0x7 0x21aF 0x42 0x73Af 0x5689 0X0 0X7 0X21aF 0X42 0X73Af 0X5689'));

    expect(tokens[0]).toEqual({value: '0x0', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[2]).toEqual({value: '0x7', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[4]).toEqual({value: '0x21aF', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[6]).toEqual({value: '0x42', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[8]).toEqual({value: '0x73Af', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[10]).toEqual({value: '0x5689', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[12]).toEqual({value: '0X0', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[14]).toEqual({value: '0X7', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[16]).toEqual({value: '0X21aF', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[18]).toEqual({value: '0X42', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[20]).toEqual({value: '0X73Af', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});
    expect(tokens[22]).toEqual({value: '0X5689', scopes: ['source.curry', 'constant.numeric.hexadecimal.curry']});

    ({tokens} = grammar.tokenizeLine('0o0 0o7 0o21 0o42 0o56 0o73 0O0 0O7 0O21 0O42 0O56 0O73'));

    expect(tokens[0]).toEqual({value: '0o0', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[2]).toEqual({value: '0o7', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[4]).toEqual({value: '0o21', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[6]).toEqual({value: '0o42', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[8]).toEqual({value: '0o56', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[10]).toEqual({value: '0o73', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[12]).toEqual({value: '0O0', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[14]).toEqual({value: '0O7', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[16]).toEqual({value: '0O21', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[18]).toEqual({value: '0O42', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[20]).toEqual({value: '0O56', scopes: ['source.curry', 'constant.numeric.octal.curry']});
    expect(tokens[22]).toEqual({value: '0O73', scopes: ['source.curry', 'constant.numeric.octal.curry']});

    ({tokens} = grammar.tokenizeLine('0.0 0.5 42.0 21e5 30e+5 0.3E+2 0E+2 73e-10 6E-9 80.275'));

    expect(tokens[0]).toEqual({value: '0.0', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[2]).toEqual({value: '0.5', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[4]).toEqual({value: '42.0', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[6]).toEqual({value: '21e5', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[8]).toEqual({value: '30e+5', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[10]).toEqual({value: '0.3E+2', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[12]).toEqual({value: '0E+2', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[14]).toEqual({value: '73e-10', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[16]).toEqual({value: '6E-9', scopes: ['source.curry', 'constant.numeric.float.curry']});
    expect(tokens[18]).toEqual({value: '80.275', scopes: ['source.curry', 'constant.numeric.float.curry']});
  });

  it('tokenizes pragmas', () => {
    let {tokens} = grammar.tokenizeLine('{-# NoImplicitPrelude,FunctionalPatterns #-}');

    expect(tokens[0]).toEqual({value: '{-#', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.begin.curry']});
    expect(tokens[2]).toEqual({value: 'NoImplicitPrelude', scopes: ['source.curry', 'meta.preprocessor.curry', 'keyword.other.preprocessor.curry']});
    expect(tokens[4]).toEqual({value: 'FunctionalPatterns', scopes: ['source.curry', 'meta.preprocessor.curry', 'keyword.other.preprocessor.curry']});
    expect(tokens[6]).toEqual({value: '#-}', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.end.curry']});

    ({tokens} = grammar.tokenizeLine('{-# OPTIONS_CYMAKE -Wno-incomplete-patterns -Wno-overlapping #-}'));

    expect(tokens[0]).toEqual({value: '{-#', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.begin.curry']});
    expect(tokens[2]).toEqual({value: 'OPTIONS_CYMAKE', scopes: ['source.curry', 'meta.preprocessor.curry', 'keyword.other.preprocessor.curry']});
    expect(tokens[3]).toEqual({value: ' -Wno-incomplete-patterns -Wno-overlapping ', scopes: ['source.curry', 'meta.preprocessor.curry']});
    expect(tokens[4]).toEqual({value: '#-}', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.end.curry']});

    const lines = grammar.tokenizeLines('{-#\n  OPTIONS_CYMAKE -Wno-missing-signatures\n#-}');

    expect(lines[0][0]).toEqual({value: '{-#', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.begin.curry']});
    expect(lines[1][1]).toEqual({value: 'OPTIONS_CYMAKE', scopes: ['source.curry', 'meta.preprocessor.curry', 'keyword.other.preprocessor.curry']});
    expect(lines[1][2]).toEqual({value: ' -Wno-missing-signatures', scopes: ['source.curry', 'meta.preprocessor.curry']});
    expect(lines[2][0]).toEqual({value: '#-}', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.end.curry']});

    ({tokens} = grammar.tokenizeLine('{-# OPTIONS_CYMAKE -F --pgmF=currypp --optF=foreigncode #-}'));

    expect(tokens[0]).toEqual({value: '{-#', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.begin.curry']});
    expect(tokens[2]).toEqual({value: 'OPTIONS_CYMAKE', scopes: ['source.curry', 'meta.preprocessor.curry', 'keyword.other.preprocessor.curry']});
    expect(tokens[3]).toEqual({value: ' -F --pgmF=currypp --optF=foreigncode ', scopes: ['source.curry', 'meta.preprocessor.curry']});
    expect(tokens[4]).toEqual({value: '#-}', scopes: ['source.curry', 'meta.preprocessor.curry', 'punctuation.definition.preprocessor.end.curry']});
  });

  it('tokenizes imports', () => {
    let {tokens} = grammar.tokenizeLine('import Module');

    expect(tokens[0]).toEqual({value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']});
    expect(tokens[2]).toEqual({value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});

    ({tokens} = grammar.tokenizeLine('import qualified Module as M'));

    expect(tokens[0]).toEqual({value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']});
    expect(tokens[2]).toEqual({value: 'qualified', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.qualified.curry']});
    expect(tokens[4]).toEqual({value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});
    expect(tokens[6]).toEqual({value: 'as', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.as.curry']});
    expect(tokens[8]).toEqual({value: 'M', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});

    ({tokens} = grammar.tokenizeLine('import Prelude (Bool (..), Either (Left, Right), Maybe, map, (++))'));

    expect(tokens[0]).toEqual({value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']});
    expect(tokens[2]).toEqual({value: 'Prelude', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']});
    expect(tokens[5]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});
    expect(tokens[7]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(tokens[8]).toEqual({value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']});
    expect(tokens[9]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(tokens[10]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[12]).toEqual({value: 'Either', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Either.curry']});
    expect(tokens[14]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(tokens[15]).toEqual({value: 'Left', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Left.curry']});
    expect(tokens[16]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[18]).toEqual({value: 'Right', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Right.curry']});
    expect(tokens[19]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(tokens[20]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[22]).toEqual({value: 'Maybe', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Maybe.curry']});
    expect(tokens[23]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[25]).toEqual({value: 'map', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(tokens[26]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[28]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[29]).toEqual({value: '++', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[30]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[31]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']});

    ({tokens} = grammar.tokenizeLine('import qualified Prelude as P hiding (Ordering (..), (?), concat, filter)'));

    expect(tokens[0]).toEqual({value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']});
    expect(tokens[2]).toEqual({value: 'qualified', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.qualified.curry']});
    expect(tokens[4]).toEqual({value: 'Prelude', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});
    expect(tokens[6]).toEqual({value: 'as', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.as.curry']});
    expect(tokens[8]).toEqual({value: 'P', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});
    expect(tokens[10]).toEqual({value: 'hiding', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.hiding.curry']});
    expect(tokens[12]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']});
    expect(tokens[13]).toEqual({value: 'Ordering', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Ordering.curry']});
    expect(tokens[15]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(tokens[16]).toEqual({value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']});
    expect(tokens[17]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(tokens[18]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[20]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[21]).toEqual({value: '?', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[22]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[23]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[25]).toEqual({value: 'concat', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(tokens[26]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[28]).toEqual({value: 'filter', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(tokens[29]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']});

    const lines = grammar.tokenizeLines('import Module\n  ( Attr ((:=:)), Color (..), Point (px, py), Tree (Leaf, Node), XML\n  -- This is a comment!\n  , showAttr, (:->) -- This is another comment!\n  )');

    expect(lines[0][0]).toEqual({value: 'import', scopes: ['source.curry', 'meta.import.curry', 'keyword.other.import.curry']});
    expect(lines[0][2]).toEqual({value: 'Module', scopes: ['source.curry', 'meta.import.curry', 'entity.name.class.curry']});
    expect(lines[1][1]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']});
    expect(lines[1][3]).toEqual({value: 'Attr', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][5]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][6]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.begin.curry']});
    expect(lines[1][7]).toEqual({value: ':=:', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.curry']});
    expect(lines[1][8]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.end.curry']});
    expect(lines[1][9]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][10]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][12]).toEqual({value: 'Color', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][14]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][15]).toEqual({value: '..', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']});
    expect(lines[1][16]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][17]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][19]).toEqual({value: 'Point', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][21]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][22]).toEqual({value: 'px', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.curry']});
    expect(lines[1][23]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][25]).toEqual({value: 'py', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.curry']});
    expect(lines[1][26]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][27]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][29]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][31]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][32]).toEqual({value: 'Leaf', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']});
    expect(lines[1][33]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][35]).toEqual({value: 'Node', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']});
    expect(lines[1][36]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][37]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][39]).toEqual({value: 'XML', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[2][0]).toEqual({value: '  ', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.whitespace.comment.leading.curry']});
    expect(lines[2][1]).toEqual({value: '--', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']});
    expect(lines[2][2]).toEqual({value: ' This is a comment!', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']});
    expect(lines[3][1]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[3][3]).toEqual({value: 'showAttr', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(lines[3][4]).toEqual({value: ',', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[3][6]).toEqual({value: '(', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']});
    expect(lines[3][7]).toEqual({value: ':->', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']});
    expect(lines[3][8]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']});
    expect(lines[3][10]).toEqual({value: '--', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']});
    expect(lines[3][11]).toEqual({value: ' This is another comment!', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']});
    expect(lines[4][1]).toEqual({value: ')', scopes: ['source.curry', 'meta.import.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']});
  });

  it('tokenizes module declarations', () => {
    let {tokens} = grammar.tokenizeLine('module Prelude where');

    expect(tokens[0]).toEqual({value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']});
    expect(tokens[2]).toEqual({value: 'Prelude', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']});
    expect(tokens[4]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']});

    ({tokens} = grammar.tokenizeLine('module Prelude (Bool (..), Either (Left, Right), Maybe, map, (++)) where'));

    expect(tokens[0]).toEqual({value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']});
    expect(tokens[2]).toEqual({value: 'Prelude', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']});
    expect(tokens[5]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});
    expect(tokens[7]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(tokens[8]).toEqual({value: '..', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']});
    expect(tokens[9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(tokens[10]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[12]).toEqual({value: 'Either', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Either.curry']});
    expect(tokens[14]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(tokens[15]).toEqual({value: 'Left', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Left.curry']});
    expect(tokens[16]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[18]).toEqual({value: 'Right', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry', 'support.tag.prelude.Right.curry']});
    expect(tokens[19]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(tokens[20]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[22]).toEqual({value: 'Maybe', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry', 'support.type.prelude.Maybe.curry']});
    expect(tokens[23]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[25]).toEqual({value: 'map', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(tokens[26]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[28]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[29]).toEqual({value: '++', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[30]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[31]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']});
    expect(tokens[33]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']});

    const lines = grammar.tokenizeLines('module Module\n  ( Attr ((:=:)), Color (..), Point (px, py), Tree (Leaf, Node), XML\n  -- This is a comment!\n. , showAttr, (:->) -- This is another comment!\n  , module Prelude\n  ) where');

    expect(lines[0][0]).toEqual({value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.module.curry']});
    expect(lines[0][2]).toEqual({value: 'Module', scopes: ['source.curry', 'meta.declaration.module.curry', 'entity.name.class.curry']});
    expect(lines[1][1]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.begin.curry']});
    expect(lines[1][3]).toEqual({value: 'Attr', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][5]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][6]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.begin.curry']});
    expect(lines[1][7]).toEqual({value: ':=:', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.curry']});
    expect(lines[1][8]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.prefix.end.curry']});
    expect(lines[1][9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][10]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][12]).toEqual({value: 'Color', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][14]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][15]).toEqual({value: '..', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'keyword.other.export-wildcard.curry']});
    expect(lines[1][16]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][17]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][19]).toEqual({value: 'Point', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][21]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][22]).toEqual({value: 'px', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.curry']});
    expect(lines[1][23]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][25]).toEqual({value: 'py', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.function.curry']});
    expect(lines[1][26]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][27]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][29]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[1][31]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.begin.curry']});
    expect(lines[1][32]).toEqual({value: 'Leaf', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']});
    expect(lines[1][33]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][35]).toEqual({value: 'Node', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'entity.name.tag.curry']});
    expect(lines[1][36]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'meta.constructor-list.curry', 'punctuation.definition.constructor-list.end.curry']});
    expect(lines[1][37]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][39]).toEqual({value: 'XML', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.type.curry']});
    expect(lines[2][0]).toEqual({value: '  ', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.whitespace.comment.leading.curry']});
    expect(lines[2][1]).toEqual({value: '--', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']});
    expect(lines[2][2]).toEqual({value: ' This is a comment!', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']});
    expect(lines[3][1]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[3][3]).toEqual({value: 'showAttr', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.curry']});
    expect(lines[3][4]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[3][6]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.begin.curry']});
    expect(lines[3][7]).toEqual({value: ':->', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.curry']});
    expect(lines[3][8]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.function.prefix.end.curry']});
    expect(lines[3][10]).toEqual({value: '--', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry', 'punctuation.definition.comment.curry']});
    expect(lines[3][11]).toEqual({value: ' This is another comment!', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'comment.line.double-dash.curry']});
    expect(lines[4][1]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.separator.comma.curry']});
    expect(lines[4][3]).toEqual({value: 'module', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'keyword.other.module.curry']});
    expect(lines[4][5]).toEqual({value: 'Prelude', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'entity.name.class.curry']});
    expect(lines[5][1]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.module.curry', 'meta.declaration.exports.curry', 'punctuation.definition.exports.end.curry']});
    expect(lines[5][3]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.module.curry', 'keyword.other.where.curry']});
  });

  it('tokenizes class declarations', () => {
    const lines = grammar.tokenizeLines('class Pretty a where\n  pretty :: a -> String');

    expect(lines[0][0]).toEqual({value: 'class', scopes: ['source.curry', 'meta.declaration.class.curry', 'keyword.other.class.curry']});
    expect(lines[0][2]).toEqual({value: 'Pretty', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[0][6]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.class.curry', 'keyword.other.where.curry']});
    expect(lines[1][1]).toEqual({value: 'pretty', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(lines[1][3]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(lines[1][5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][7]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[1][9]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});

    const {tokens} = grammar.tokenizeLine('class Functor f => Applicative f where');

    expect(tokens[0]).toEqual({value: 'class', scopes: ['source.curry', 'meta.declaration.class.curry', 'keyword.other.class.curry']});
    expect(tokens[2]).toEqual({value: 'Functor', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Functor.curry']});
    expect(tokens[4]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: '=>', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'keyword.other.context-arrow.curry']});
    expect(tokens[8]).toEqual({value: 'Applicative', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[10]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.class.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[12]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.class.curry', 'keyword.other.where.curry']});
  });

  it('tokenizes instance declarations', () => {
    const lines = grammar.tokenizeLines('instance Pretty Bool where\n  pretty False = "False"\n  pretty True  = "True"');

    expect(lines[0][0]).toEqual({value: 'instance', scopes: ['source.curry', 'meta.declaration.instance.curry', 'keyword.other.instance.curry']});
    expect(lines[0][2]).toEqual({value: 'Pretty', scopes: ['source.curry', 'meta.declaration.instance.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.instance.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});
    expect(lines[0][6]).toEqual({value: 'where', scopes: ['source.curry', 'meta.declaration.instance.curry', 'keyword.other.where.curry']});
    expect(lines[1][1]).toEqual({value: 'pretty', scopes: ['source.curry', 'identifier.curry']});
    expect(lines[1][3]).toEqual({value: 'False', scopes: ['source.curry', 'entity.name.tag.curry', 'support.tag.prelude.False.curry']});
    expect(lines[1][5]).toEqual({value: '=', scopes: ['source.curry', 'keyword.other.assignment.curry']});
    expect(lines[1][7]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.begin.curry']});
    expect(lines[1][8]).toEqual({value: 'False', scopes: ['source.curry', 'string.quoted.double.curry']});
    expect(lines[1][9]).toEqual({value: '"', scopes: ['source.curry', 'string.quoted.double.curry', 'punctuation.definition.string.end.curry']});
  });

  it('tokenizes type synonym declarations', () => {
    let {tokens} = grammar.tokenizeLine('type String = [Char]');

    expect(tokens[0]).toEqual({value: 'type', scopes: ['source.curry', 'meta.declaration.type.curry', 'keyword.other.type.curry']});
    expect(tokens[2]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});
    expect(tokens[4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.assignment.curry']});
    expect(tokens[6]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[7]).toEqual({value: 'Char', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Char.curry']});
    expect(tokens[8]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});

    ({tokens} = grammar.tokenizeLine('type VarIdx = Int'));

    expect(tokens[0]).toEqual({value: 'type', scopes: ['source.curry', 'meta.declaration.type.curry', 'keyword.other.type.curry']});
    expect(tokens[2]).toEqual({value: 'VarIdx', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.assignment.curry']});
    expect(tokens[6]).toEqual({value: 'Int', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Int.curry']});

    ({tokens} = grammar.tokenizeLine('type Subst f = FM VarIdx (Term f)'));

    expect(tokens[0]).toEqual({value: 'type', scopes: ['source.curry', 'meta.declaration.type.curry', 'keyword.other.type.curry']});
    expect(tokens[2]).toEqual({value: 'Subst', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.assignment.curry']});
    expect(tokens[8]).toEqual({value: 'FM', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[10]).toEqual({value: 'VarIdx', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[12]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[13]).toEqual({value: 'Term', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[15]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[16]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});

    ({tokens} = grammar.tokenizeLine('type Func a b = a -> b'));

    expect(tokens[0]).toEqual({value: 'type', scopes: ['source.curry', 'meta.declaration.type.curry', 'keyword.other.type.curry']});
    expect(tokens[2]).toEqual({value: 'Func', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.assignment.curry']});
    expect(tokens[10]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[12]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[14]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    const lines = grammar.tokenizeLines('type MapFunc a b\n  = (a -> b) -> [(a, a)]\n  -> [(b, b)]');

    expect(lines[0][0]).toEqual({value: 'type', scopes: ['source.curry', 'meta.declaration.type.curry', 'keyword.other.type.curry']});
    expect(lines[0][2]).toEqual({value: 'MapFunc', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[0][6]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][1]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.assignment.curry']});
    expect(lines[1][3]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[1][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][6]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[1][8]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[1][11]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[1][13]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(lines[1][14]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[1][15]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][16]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][18]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][19]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[1][20]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(lines[2][1]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[2][3]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(lines[2][4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[2][5]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[2][6]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(lines[2][8]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[2][9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[2][10]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.type.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
  });

  it('tokenizes data declarations', () => {
    let {tokens} = grammar.tokenizeLine('data Bool = False | True');

    expect(tokens[0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(tokens[2]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});
    expect(tokens[4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(tokens[6]).toEqual({value: 'False', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry', 'support.tag.prelude.False.curry']});
    expect(tokens[8]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(tokens[10]).toEqual({value: 'True', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry', 'support.tag.prelude.True.curry']});

    ({tokens} = grammar.tokenizeLine('data Either a b = Left a | Right b'));

    expect(tokens[0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(tokens[2]).toEqual({value: 'Either', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Either.curry']});
    expect(tokens[4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(tokens[10]).toEqual({value: 'Left', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry', 'support.tag.prelude.Left.curry']});
    expect(tokens[12]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[14]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(tokens[16]).toEqual({value: 'Right', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry', 'support.tag.prelude.Right.curry']});
    expect(tokens[18]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    let lines = grammar.tokenizeLines('data Tree a = Leaf a\n            | Tree a :+: Tree a');

    expect(lines[0][0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(lines[0][2]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[0][6]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(lines[0][8]).toEqual({value: 'Leaf', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(lines[0][10]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][1]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(lines[1][3]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][7]).toEqual({value: ':+:', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.operator.curry']});
    expect(lines[1][9]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][11]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    lines = grammar.tokenizeLines('data Tree a = Leaf a\n            | Tree a :+: Tree a\n  deriving (Eq, Show)');

    expect(lines[0][0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(lines[0][2]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[0][6]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(lines[0][8]).toEqual({value: 'Leaf', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(lines[0][10]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][1]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(lines[1][3]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][7]).toEqual({value: ':+:', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.operator.curry']});
    expect(lines[1][9]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][11]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[2][1]).toEqual({value: 'deriving', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.deriving.curry', 'keyword.other.deriving.curry']});
    expect(lines[2][3]).toEqual({value: 'Eq', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.deriving.curry', 'entity.name.type.curry', 'support.type.prelude.Eq.curry']});
    expect(lines[2][4]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.deriving.curry', 'punctuation.separator.comma.curry']});
    expect(lines[2][6]).toEqual({value: 'Show', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.deriving.curry', 'entity.name.type.curry', 'support.type.prelude.Show.curry']});

    ({tokens} = grammar.tokenizeLine('data Attr = (:=:) String String'));

    expect(tokens[0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(tokens[2]).toEqual({value: 'Attr', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(tokens[6]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[7]).toEqual({value: ':=:', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[8]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[10]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});
    expect(tokens[12]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});

    ({tokens} = grammar.tokenizeLine('data List a = Empty | a `Cons` List a'));

    expect(tokens[0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(tokens[2]).toEqual({value: 'List', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(tokens[8]).toEqual({value: 'Empty', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(tokens[10]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(tokens[12]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[14]).toEqual({value: '`', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.definition.constructor.infix.begin.curry']});
    expect(tokens[15]).toEqual({value: 'Cons', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(tokens[16]).toEqual({value: '`', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.definition.constructor.infix.end.curry']});
    expect(tokens[18]).toEqual({value: 'List', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[20]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    lines = grammar.tokenizeLines('data Term f\n  = TermVar VarIdx\n  | TermCons f [Term f]');

    expect(lines[0][0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(lines[0][2]).toEqual({value: 'Term', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][1]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(lines[1][3]).toEqual({value: 'TermVar', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(lines[1][5]).toEqual({value: 'VarIdx', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[2][1]).toEqual({value: '|', scopes: ['source.curry', 'meta.declaration.data.curry', 'punctuation.separator.pipe.curry']});
    expect(lines[2][3]).toEqual({value: 'TermCons', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(lines[2][5]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[2][7]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(lines[2][8]).toEqual({value: 'Term', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[2][10]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[2][11]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});

    lines = grammar.tokenizeLines('data Point = Point { px :: Int\n                   , py :: Int }');

    expect(lines[0][0]).toEqual({value: 'data', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.data.curry']});
    expect(lines[0][2]).toEqual({value: 'Point', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.data.curry', 'keyword.other.assignment.curry']});
    expect(lines[0][6]).toEqual({value: 'Point', scopes: ['source.curry', 'meta.declaration.data.curry', 'entity.name.tag.curry']});
    expect(lines[0][8]).toEqual({value: '{', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'punctuation.definition.record.begin.curry']});
    expect(lines[0][10]).toEqual({value: 'px', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'entity.other.attribute-name.curry']});
    expect(lines[0][12]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'keyword.other.double-colon.curry']});
    expect(lines[0][14]).toEqual({value: 'Int', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Int.curry']});
    expect(lines[1][1]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][3]).toEqual({value: 'py', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'entity.other.attribute-name.curry']});
    expect(lines[1][5]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'keyword.other.double-colon.curry']});
    expect(lines[1][7]).toEqual({value: 'Int', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Int.curry']});
    expect(lines[1][9]).toEqual({value: '}', scopes: ['source.curry', 'meta.declaration.data.curry', 'meta.declaration.record.curry', 'punctuation.definition.record.end.curry']});

    ({tokens} = grammar.tokenizeLine('newtype Name = Name String'));

    expect(tokens[0]).toEqual({value: 'newtype', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.newtype.curry']});
    expect(tokens[2]).toEqual({value: 'Name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.assignment.curry']});
    expect(tokens[6]).toEqual({value: 'Name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'entity.name.tag.curry']});
    expect(tokens[8]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});

    lines = grammar.tokenizeLines('newtype Name = Name String\n  deriving (Eq, Show)');

    expect(lines[0][0]).toEqual({value: 'newtype', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.newtype.curry']});
    expect(lines[0][2]).toEqual({value: 'Name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[0][4]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.assignment.curry']});
    expect(lines[0][6]).toEqual({value: 'Name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'entity.name.tag.curry']});
    expect(lines[0][8]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});
    expect(lines[1][1]).toEqual({value: 'deriving', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.deriving.curry', 'keyword.other.deriving.curry']});
    expect(lines[1][3]).toEqual({value: 'Eq', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.deriving.curry', 'entity.name.type.curry', 'support.type.prelude.Eq.curry']});
    expect(lines[1][4]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.deriving.curry', 'punctuation.separator.comma.curry']});
    expect(lines[1][6]).toEqual({value: 'Show', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.deriving.curry', 'entity.name.type.curry', 'support.type.prelude.Show.curry']});

    ({tokens} = grammar.tokenizeLine('newtype Func a b = Func (a -> b)'));

    expect(tokens[0]).toEqual({value: 'newtype', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.newtype.curry']});
    expect(tokens[2]).toEqual({value: 'Func', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.assignment.curry']});
    expect(tokens[10]).toEqual({value: 'Func', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'entity.name.tag.curry']});
    expect(tokens[12]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[13]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[15]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[17]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[18]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});

    lines = grammar.tokenizeLines('newtype Person\n  = Person { name :: Name }');

    expect(lines[0][0]).toEqual({value: 'newtype', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.newtype.curry']});
    expect(lines[0][2]).toEqual({value: 'Person', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][1]).toEqual({value: '=', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'keyword.other.assignment.curry']});
    expect(lines[1][3]).toEqual({value: 'Person', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'entity.name.tag.curry']});
    expect(lines[1][5]).toEqual({value: '{', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.record.curry', 'punctuation.definition.record.begin.curry']});
    expect(lines[1][7]).toEqual({value: 'name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'entity.other.attribute-name.curry']});
    expect(lines[1][9]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'keyword.other.double-colon.curry']});
    expect(lines[1][11]).toEqual({value: 'Name', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.record.curry', 'meta.declaration.record-field.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(lines[1][13]).toEqual({value: '}', scopes: ['source.curry', 'meta.declaration.newtype.curry', 'meta.declaration.record.curry', 'punctuation.definition.record.end.curry']});
  });

  it('tokenizes function type declarations', () => {
    let {tokens} = grammar.tokenizeLine('map :: (a -> b) -> [a] -> [b]');

    expect(tokens[0]).toEqual({value: 'map', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[7]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[9]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[10]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[12]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[14]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[15]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[16]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[18]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[20]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[21]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[22]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});

    ({tokens} = grammar.tokenizeLine('fst :: (a, _) -> a'));

    expect(tokens[0]).toEqual({value: 'fst', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[8]).toEqual({value: '_', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.wildcard.curry']});
    expect(tokens[9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[11]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[13]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('snd :: (_, b) -> b'));

    expect(tokens[0]).toEqual({value: 'snd', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[5]).toEqual({value: '_', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.wildcard.curry']});
    expect(tokens[6]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[8]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[9]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[11]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[13]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('zip :: [a] -> [b] -> [(a, b)]'));

    expect(tokens[0]).toEqual({value: 'zip', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[5]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[8]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[10]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[11]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[12]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[14]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[16]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[17]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[18]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[19]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[21]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[22]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[23]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});

    ({tokens} = grammar.tokenizeLine('null :: [_] -> Bool'));

    expect(tokens[0]).toEqual({value: 'null', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[5]).toEqual({value: '_', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.wildcard.curry']});
    expect(tokens[6]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[8]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[10]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});

    ({tokens} = grammar.tokenizeLine('(!!) :: [a] -> Int -> a'));

    expect(tokens[0]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[1]).toEqual({value: '!!', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[2]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[4]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[6]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[7]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[10]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[12]).toEqual({value: 'Int', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Int.curry']});
    expect(tokens[14]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[16]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('maybe :: b -> (a -> b) -> Maybe a -> b'));

    expect(tokens[0]).toEqual({value: 'maybe', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[6]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[8]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[9]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[11]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[13]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[14]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[16]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[18]).toEqual({value: 'Maybe', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Maybe.curry']});
    expect(tokens[20]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[22]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[24]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    const lines = grammar.tokenizeLines('(>>=) :: IO a\n      -> (a -> IO b)\n      -> IO b');

    expect(lines[0][0]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.begin.curry']});
    expect(lines[0][1]).toEqual({value: '>>=', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.curry']});
    expect(lines[0][2]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.end.curry']});
    expect(lines[0][4]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(lines[0][6]).toEqual({value: 'IO', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.IO.curry']});
    expect(lines[0][8]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][1]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[1][3]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[1][4]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][6]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[1][8]).toEqual({value: 'IO', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.IO.curry']});
    expect(lines[1][10]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(lines[1][11]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(lines[2][1]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(lines[2][3]).toEqual({value: 'IO', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.IO.curry']});
    expect(lines[2][5]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('putStr :: String -> IO ()'));

    expect(tokens[0]).toEqual({value: 'putStr', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: 'String', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.String.curry']});
    expect(tokens[6]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[8]).toEqual({value: 'IO', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.IO.curry']});
    expect(tokens[10]).toEqual({value: '()', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'constant.language.unit.curry']});

    ({tokens} = grammar.tokenizeLine('otherwise :: Bool'));

    expect(tokens[0]).toEqual({value: 'otherwise', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});

    ({tokens} = grammar.tokenizeLine('isLeaf, isNode :: Tree _ -> Bool'));

    expect(tokens[0]).toEqual({value: 'isLeaf', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[1]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[3]).toEqual({value: 'isNode', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[5]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[7]).toEqual({value: 'Tree', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry']});
    expect(tokens[9]).toEqual({value: '_', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.wildcard.curry']});
    expect(tokens[11]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[13]).toEqual({value: 'Bool', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bool.curry']});

    ({tokens} = grammar.tokenizeLine('(?), max, min :: a -> a -> a'));

    expect(tokens[0]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.begin.curry']});
    expect(tokens[1]).toEqual({value: '?', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.curry']});
    expect(tokens[2]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.prefix.end.curry']});
    expect(tokens[3]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[5]).toEqual({value: 'max', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[6]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[8]).toEqual({value: 'min', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[10]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[12]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[14]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[16]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[18]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[20]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('putChar::Char->IO()'));

    expect(tokens[0]).toEqual({value: 'putChar', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[1]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[2]).toEqual({value: 'Char', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Char.curry']});
    expect(tokens[3]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[4]).toEqual({value: 'IO', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.IO.curry']});
    expect(tokens[5]).toEqual({value: '()', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'constant.language.unit.curry']});

    ({tokens} = grammar.tokenizeLine('fmap :: Functor f => (a -> b) -> f a -> f b'));

    expect(tokens[0]).toEqual({value: 'fmap', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: 'Functor', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Functor.curry']});
    expect(tokens[6]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: '=>', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.context-arrow.curry']});
    expect(tokens[10]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[11]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[13]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[15]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[16]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[18]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[20]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[22]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[24]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[26]).toEqual({value: 'f', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[28]).toEqual({value: 'b', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});

    ({tokens} = grammar.tokenizeLine('boundedEnumFrom :: (Bounded a, Enum a) => a -> [a]'));

    expect(tokens[0]).toEqual({value: 'boundedEnumFrom', scopes: ['source.curry', 'meta.declaration.function.curry', 'entity.name.function.curry']});
    expect(tokens[2]).toEqual({value: '::', scopes: ['source.curry', 'meta.declaration.function.curry', 'keyword.other.double-colon.curry']});
    expect(tokens[4]).toEqual({value: '(', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[5]).toEqual({value: 'Bounded', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Bounded.curry']});
    expect(tokens[7]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[8]).toEqual({value: ',', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[10]).toEqual({value: 'Enum', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'entity.name.type.curry', 'support.type.prelude.Enum.curry']});
    expect(tokens[12]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[13]).toEqual({value: ')', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.round.curry']});
    expect(tokens[15]).toEqual({value: '=>', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.context-arrow.curry']});
    expect(tokens[17]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[19]).toEqual({value: '->', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'keyword.other.function-arrow.curry']});
    expect(tokens[21]).toEqual({value: '[', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
    expect(tokens[22]).toEqual({value: 'a', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'variable.other.generic-type.curry']});
    expect(tokens[23]).toEqual({value: ']', scopes: ['source.curry', 'meta.declaration.function.curry', 'meta.type-signature.curry', 'punctuation.bracket.square.curry']});
  });

  it('tokenizes infix[lr] declarations', () => {
    let {tokens} = grammar.tokenizeLine('infix 4 `elem`');

    expect(tokens[0]).toEqual({value: 'infix', scopes: ['source.curry', 'keyword.other.infix.curry']});
    expect(tokens[2]).toEqual({value: '4', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.begin.curry']});
    expect(tokens[5]).toEqual({value: 'elem', scopes: ['source.curry', 'entity.name.function.curry']});
    expect(tokens[6]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.end.curry']});

    ({tokens} = grammar.tokenizeLine('infixl 9 !!'));

    expect(tokens[0]).toEqual({value: 'infixl', scopes: ['source.curry', 'keyword.other.infixl.curry']});
    expect(tokens[2]).toEqual({value: '9', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '!!', scopes: ['source.curry', 'keyword.operator.curry', 'support.function.prelude.curry']});

    ({tokens} = grammar.tokenizeLine('infixl 7 `div`, `mod`'));

    expect(tokens[0]).toEqual({value: 'infixl', scopes: ['source.curry', 'keyword.other.infixl.curry']});
    expect(tokens[2]).toEqual({value: '7', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.begin.curry']});
    expect(tokens[5]).toEqual({value: 'div', scopes: ['source.curry', 'entity.name.function.curry']});
    expect(tokens[6]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.end.curry']});
    expect(tokens[7]).toEqual({value: ',', scopes: ['source.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[9]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.begin.curry']});
    expect(tokens[10]).toEqual({value: 'mod', scopes: ['source.curry', 'entity.name.function.curry']});
    expect(tokens[11]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.end.curry']});

    ({tokens} = grammar.tokenizeLine('infixr 3 &&'));

    expect(tokens[0]).toEqual({value: 'infixr', scopes: ['source.curry', 'keyword.other.infixr.curry']});
    expect(tokens[2]).toEqual({value: '3', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '&&', scopes: ['source.curry', 'keyword.operator.curry', 'support.function.prelude.curry']});

    ({tokens} = grammar.tokenizeLine('infixr 0 $,`seq`,?'));

    expect(tokens[0]).toEqual({value: 'infixr', scopes: ['source.curry', 'keyword.other.infixr.curry']});
    expect(tokens[2]).toEqual({value: '0', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: '$', scopes: ['source.curry', 'keyword.operator.curry', 'support.function.prelude.curry']});
    expect(tokens[5]).toEqual({value: ',', scopes: ['source.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[6]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.begin.curry']});
    expect(tokens[7]).toEqual({value: 'seq', scopes: ['source.curry', 'entity.name.function.curry']});
    expect(tokens[8]).toEqual({value: '`', scopes: ['source.curry', 'punctuation.definition.function.infix.end.curry']});
    expect(tokens[9]).toEqual({value: ',', scopes: ['source.curry', 'punctuation.separator.comma.curry']});
    expect(tokens[10]).toEqual({value: '?', scopes: ['source.curry', 'keyword.operator.curry', 'support.function.prelude.curry']});

    ({tokens} = grammar.tokenizeLine('infixr 6 :=:'));

    expect(tokens[0]).toEqual({value: 'infixr', scopes: ['source.curry', 'keyword.other.infixr.curry']});
    expect(tokens[2]).toEqual({value: '6', scopes: ['source.curry', 'constant.numeric.decimal.curry']});
    expect(tokens[4]).toEqual({value: ':=:', scopes: ['source.curry', 'keyword.operator.curry']});
  });
});

function range(left, right, inclusive) {
  const arr = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;

  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    arr.push(i);
  }

  return arr;
}