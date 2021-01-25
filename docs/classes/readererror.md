[gocsv](../README.md) / [Exports](../modules.md) / ReaderError

# Class: ReaderError

Common error class for anything that might go wrong with Reader

## Hierarchy

* *Error*

  ↳ **ReaderError**

  ↳↳ [*ParseError*](parseerror.md)

## Table of contents

### Constructors

- [constructor](readererror.md#constructor)

### Properties

- [message](readererror.md#message)
- [name](readererror.md#name)
- [stack](readererror.md#stack)
- [prepareStackTrace](readererror.md#preparestacktrace)
- [stackTraceLimit](readererror.md#stacktracelimit)

### Methods

- [captureStackTrace](readererror.md#capturestacktrace)

## Constructors

### constructor

\+ **new ReaderError**(`message`: *string*): [*ReaderError*](readererror.md)

#### Parameters:

Name | Type |
------ | ------ |
`message` | *string* |

**Returns:** [*ReaderError*](readererror.md)

Defined in: [src/errors.ts:4](https://github.com/pckhoi/gocsv/blob/7048efc/src/errors.ts#L4)

## Properties

### message

• **message**: *string*

Defined in: node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• **name**: *string*

Defined in: node_modules/typescript/lib/lib.es5.d.ts:973

___

### stack

• `Optional` **stack**: *undefined* | *string*

Defined in: node_modules/typescript/lib/lib.es5.d.ts:975

___

### prepareStackTrace

▪ `Optional` `Static` **prepareStackTrace**: *undefined* | (`err`: Error, `stackTraces`: CallSite[]) => *any*

Optional override for formatting stack traces

**`see`** https://github.com/v8/v8/wiki/Stack%20Trace%20API#customizing-stack-traces

Defined in: node_modules/@types/node/globals.d.ts:140

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: *number*

Defined in: node_modules/@types/node/globals.d.ts:142

## Methods

### captureStackTrace

▸ `Static`**captureStackTrace**(`targetObject`: Object, `constructorOpt?`: Function): *void*

Create .stack property on a target object

#### Parameters:

Name | Type |
------ | ------ |
`targetObject` | Object |
`constructorOpt?` | Function |

**Returns:** *void*

Defined in: node_modules/@types/node/globals.d.ts:133
