const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('total likes', () => {
  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })
  test('when list has only one blog equal the likes of that', () => {
    const blogs = [
      {
        title: 'How to Play',
        author: 'Wilbo',
        url: 'N/A',
        likes: 2
      }
    ]

    assert.strictEqual(listHelper.totalLikes(blogs), 2)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      {
        title: 'How to Play',
        author: 'Wilbo',
        url: 'N/A',
        likes: 2
      },
      {
        title: 'How to Play',
        author: 'Wilbo',
        url: 'N/A',
        likes: 3
      }
    ]

    assert.strictEqual(listHelper.totalLikes(blogs), 5)
  })
})