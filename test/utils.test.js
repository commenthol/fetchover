import assert from 'assert'
import { replaceServer, shuffle } from '../src/utils.js'

describe('utils', function () {
  describe('replaceServer', function () {
    it('shall replace server', function () {
      const url = new URL('https://target.server/path/?hi=there')
      const server = 'http://backup.server'
      assert.deepEqual(
        replaceServer(url, server),
        new URL('http://backup.server/path/?hi=there')
      )
    })
  })

  describe('shuffle', function () {
    it('shall shuffle array', function () {
      const arr = [1, 2, 3, 4, 5]
      let shuffled = shuffle(arr)
      if (arr.join(',') === shuffled.join(',')) {
        shuffled = shuffle(arr)
      }
      assert.notDeepEqual(arr, shuffled)
    })
  })
})
