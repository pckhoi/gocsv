/* global eprint, eprintKill */

import Papa from 'papaparse'

import Benchmark from './benchmark'
import Reader from '../src/reader'
import { stringStream } from '../src/io'
import csvBase64 from './players_20.csv'
import { base64ToArrayBuffer, timeExecution } from './utils'

const buffer = base64ToArrayBuffer(csvBase64)
const file = new File([buffer], 'players_20.csv')

const benchmarkCSVData = `x,y,z,w
x,y,z,
x,y,,
x,,,
,,,
"x","y","z","w"
"x","y","z",""
"x","y","",""
"x","","",""
"","","",""
`

const largeFieldsCSVData = `xxxxxxxxxxxxxxxx,yyyyyyyyyyyyyyyy,zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz,wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww,vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
xxxxxxxxxxxxxxxxxxxxxxxx,yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy,zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz,wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww,vvvv
,,zzzz,wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww,vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx,yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy,zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz,wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww,vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
`.repeat(3)

const run = async () => {
  await timeExecution('Read players_20.csv with CSV.js', async () => {
    const r = new Reader(file.stream())
    let i = 0
    while (true) {
      const sl = await r.read()
      if (!sl) {
        break
      }
      i++
    }
    if (i !== 18279) {
      throw new Error(`unexpected number of rows ${i}`)
    }
  })
  await timeExecution(
    'Read players_20.csv with PapaParse',
    () =>
      new Promise(resolve => {
        Papa.parse(file, {
          complete: results => {
            if (results.data.length !== 18280) {
              throw new Error(`unexpected number of rows ${results.data.length}`)
            }
            resolve()
          }
        })
      })
  )
  eprintKill()
}
run()

// const suite = new Benchmark.Suite('Reader')

// suite
//   .add('CSVJS.Reader', async () => {
//     const r = new Reader(stringStream(benchmarkCSVData))
//     while (true) {
//       const sl = await r.read()
//       if (!sl) {
//         break
//       }
//     }
//   })
//   .add('CSVJS.Reader#largeFields', async () => {
//     const r = new Reader(stringStream(largeFieldsCSVData))
//     while (true) {
//       const sl = await r.read()
//       if (!sl) {
//         break
//       }
//     }
//   })
//   .on('cycle', function(event) {
//     eprint(String(event.target))
//   })
//   .on('complete', async () => {
//     await timeExecution('Read players_20.csv with CSV.js', async () => {
//       const r = new Reader(file.stream())
//       let i = 0
//       while (true) {
//         const sl = await r.read()
//         if (!sl) {
//           break
//         }
//         i++
//       }
//       if (i !== 18279) {
//         throw new Error(`unexpected number of rows ${i}`)
//       }
//     })
//     await timeExecution(
//       'Read players_20.csv with PapaParse',
//       () =>
//         new Promise(resolve => {
//           Papa.parse(file, {
//             complete: results => {
//               eprint(JSON.stringify(results))
//               if (results.length !== 18278) {
//                 throw new Error(`unexpected number of rows ${results.length}`)
//               }
//               resolve()
//             }
//           })
//         })
//     )
//     eprintKill()
//   })
//   // run async
//   .run({
//     async: true
//   })
