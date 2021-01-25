gocsv / [Exports](modules.md)

# GoCSV

There's a lack of high performance and correct implementation of CSV reading/writing in JS ecosystem, thus this library was born. All tests from Go's csv package are ported over and used to validate the correctness of this library. Furthermore it was written to run in modern browsers and should feel fairly modern to use. Finally only csv Reader has been ported at this point.

## Getting started

```bash
npm install --save gocsv
```

## Usage

Read from string

```javascript
import { Reader } from 'gocsv'

const reader = new Reader('a,b,c\n1,2,3\n4,5,6')
reader
  .readAll(row => {
    console.log('read row:', row)
  })
  .then(() => {
    console.log('finished reading')
  })
```

Read from file

```javascript
import { Reader } from 'gocsv'

const reader = new Reader(file.stream())
reader
  .readAll(row => {
    console.log('read row:', row)
  })
  .then(() => {
    console.log('finished reading')
  })
```

Read 10 lines

```javascript
import { Reader } from 'gocsv'

const reader = new Reader(file.stream())
reader
  .readN(10, row => {
    console.log('read row:', row)
  })
  .then(() => {
    console.log('finished reading')
  })
```
