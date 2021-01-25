[gocsv](../README.md) / [Exports](../modules.md) / Reader

# Class: Reader

## Hierarchy

* **Reader**

## Table of contents

### Constructors

- [constructor](reader.md#constructor)

### Methods

- [readAll](reader.md#readall)
- [readN](reader.md#readn)

## Constructors

### constructor

\+ **new Reader**(`input`: *string* | *ReadableStream*<*string*\> | *Uint8Array* | *ReadableStream*<*Uint8Array*\>, `config?`: [*readerConfig*](../modules.md#readerconfig)): [*Reader*](reader.md)

Create a new instance of Reader.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`input` | *string* | *ReadableStream*<*string*\> | *Uint8Array* | *ReadableStream*<*Uint8Array*\> | CSV text string, bytes array or readable stream of those types.   |
`config?` | [*readerConfig*](../modules.md#readerconfig) | If present then override default settings.    |

**Returns:** [*Reader*](reader.md)

Defined in: [src/reader.ts:94](https://github.com/pckhoi/gocsv/blob/7048efc/src/reader.ts#L94)

## Methods

### readAll

▸ **readAll**(`cb`: [*recordCallback*](../modules.md#recordcallback)): *Promise*<*void*\>

Read all the remaining records.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`cb` | [*recordCallback*](../modules.md#recordcallback) | The callback that will be called with each record.   |

**Returns:** *Promise*<*void*\>

Resolve when there's no record left or if reading is aborted.

Defined in: [src/reader.ts:352](https://github.com/pckhoi/gocsv/blob/7048efc/src/reader.ts#L352)

___

### readN

▸ **readN**(`n`: *number*, `cb`: [*recordCallback*](../modules.md#recordcallback)): *Promise*<*void*\>

Read at most N records.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`n` | *number* | Maximum number of records to read.   |
`cb` | [*recordCallback*](../modules.md#recordcallback) | The callback to be called with each record.   |

**Returns:** *Promise*<*void*\>

Resolve when there's no record left or the maximum number of records have been reached.

Defined in: [src/reader.ts:371](https://github.com/pckhoi/gocsv/blob/7048efc/src/reader.ts#L371)
