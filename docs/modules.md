[gocsv](README.md) / Exports

# gocsv

## Table of contents

### Classes

- [ParseError](classes/parseerror.md)
- [Reader](classes/reader.md)
- [ReaderError](classes/readererror.md)

### Type aliases

- [readerConfig](modules.md#readerconfig)
- [recordCallback](modules.md#recordcallback)

## Type aliases

### readerConfig

Ƭ **readerConfig**: { `comma?`: *string* ; `comment?`: *string* ; `fieldsPerRecord?`: *number* ; `lazyQuotes?`: *boolean* ; `trimLeadingSpace?`: *boolean*  }

Reader configurations at the time of creation.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`comma?` | *string* | The field delimiter. Default to comma character (','). Comma must be a valid rune and must not be \r, \n, or the Unicode replacement character (0xFFFD).   |
`comment?` | *string* | Comment, if defined, is the comment character. Lines beginning with the comment character without preceding whitespace are ignored. With leading whitespace the comment character becomes part of the field, even if [trimLeadingSpace](modules.md#trimleadingspace) is true. Comment must be a valid rune and must not be \r, \n, or the Unicode replacement character (0xFFFD). It must also not be equal to [comma](modules.md#comma).   |
`fieldsPerRecord?` | *number* | The number of expected fields per record. If fieldsPerRecord is positive, Read requires each record to have the given number of fields. If fieldsPerRecord is 0, Read sets it to the number of fields in the first record, so that future records must have the same field count. If fieldsPerRecord is negative, no check is made and records may have a variable number of fields.   |
`lazyQuotes?` | *boolean* | If lazyQuotes is true, a quote may appear in an unquoted field and a non-doubled quote may appear in a quoted field.   |
`trimLeadingSpace?` | *boolean* | If trimLeadingSpace is true, leading white space in a field is ignored. This is done even if the field delimiter, Comma, is white space.   |

Defined in: [src/reader.ts:14](https://github.com/pckhoi/gocsv/blob/7048efc/src/reader.ts#L14)

___

### recordCallback

Ƭ **recordCallback**: (`record`: *string*[]) => *boolean* | *void*

Called once for each record. If this callback returns `true`
then abort reading prematurely.

**`param`** Array of fields in this record.

**`returns`** true to abort iteration.

Defined in: [src/reader.ts:60](https://github.com/pckhoi/gocsv/blob/7048efc/src/reader.ts#L60)
