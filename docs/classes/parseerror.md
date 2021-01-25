[gocsv](../README.md) / [Exports](../modules.md) / ParseError

# Class: ParseError

Common error class for parse errors

## Hierarchy

* [*ReaderError*](readererror.md)

  ↳ **ParseError**

## Table of contents

### Constructors

- [constructor](parseerror.md#constructor)

### Properties

- [message](parseerror.md#message)
- [name](parseerror.md#name)
- [prepareStackTrace](parseerror.md#preparestacktrace)
- [stack](parseerror.md#stack)
- [stackTraceLimit](parseerror.md#stacktracelimit)

### Methods

- [captureStackTrace](parseerror.md#capturestacktrace)

## Constructors

### constructor

\+ **new ParseError**(`args`: ParseErrorArgs): [*ParseError*](parseerror.md)

#### Parameters:

Name | Type |
------ | ------ |
`args` | ParseErrorArgs |

**Returns:** [*ParseError*](parseerror.md)

Inherited from: [ReaderError](readererror.md)

Defined in: [src/errors.ts:28](https://github.com/pckhoi/gocsv/blob/7048efc/src/errors.ts#L28)

## Properties

### message

• **message**: *string*

Inherited from: [ReaderError](readererror.md).[message](readererror.md#message)

Defined in: node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• **name**: *string*

Inherited from: [ReaderError](readererror.md).[name](readererror.md#name)

Defined in: node_modules/typescript/lib/lib.es5.d.ts:973

___

### prepareStackTrace

• `Optional` **prepareStackTrace**: *undefined* | (`err`: Error, `stackTraces`: CallSite[]) => *any*

Optional override for formatting stack traces

**`see`** https://github.com/v8/v8/wiki/Stack%20Trace%20API#customizing-stack-traces

Defined in: node_modules/@types/node/globals.d.ts:140

___

### stack

• `Optional` **stack**: *undefined* | *string*

Inherited from: [ReaderError](readererror.md).[stack](readererror.md#stack)

Defined in: node_modules/typescript/lib/lib.es5.d.ts:975

___

### stackTraceLimit

• **stackTraceLimit**: *number*

Defined in: node_modules/@types/node/globals.d.ts:142

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`: Object, `constructorOpt?`: Function): *void*

Create .stack property on a target object

#### Parameters:

Name | Type |
------ | ------ |
`targetObject` | Object |
`constructorOpt?` | Function |

**Returns:** *void*

Defined in: node_modules/@types/node/globals.d.ts:133
