const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
require('express-async-errors')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)


describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    // const blogObjects = helper.initialBlogs
    //   .map(blog => new Blog(blog))
    // const promiseArray = blogObjects.map(blog => blog.save(blog))
    // await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('unique identifier is named id', async () => {
    const blogs = await helper.blogsInDb()
    // console.log(blogs[0])
    assert.ok(blogs[0].id)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'Wilbo',
        author: 'Wilbo',
        url: 'Wilbo',
        likes: 3
      }
    
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    
      // console.log(blogsAtEnd)
      const titles = blogsAtEnd.map(blogs => blogs.title)
      assert(titles.includes('Wilbo'))
    })

    test('blog with no likes property can be added with 0 likes', async () => {
      const newBlog = {
        title: 'Wilbo',
        author: 'Wilbo',
        url: 'Wilbo',
      }

      const returnedBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(returnedBlog.body.likes, 0)
    })

    test('blog without titles/url fails with status code 400', async () => {
      const newBlog = {
        author: 'Wilbo',
        likes: 1,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

      const titles = blogsAtEnd.map(blogs => blogs.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('update of a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const id = blogsAtStart[0].id
      const newBlog = {
        title: 'Wilbo',
        author: 'Wilbo',
        url: 'Wilbo',
        likes: 2
      }

      await api
        .put(`/api/blogs/${id}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const titles = (await helper.blogsInDb()).map(blog => blog.title)
      assert(titles.includes(newBlog.title))
    })

    test('fails with status code 400 if id is invalid', async () => {

      const invalidId = '5a3d5da59070081a82a3445'

      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        title: 'Wilbo',
        author: 'Wilbo',
        url: 'Wilbo',
        likes: 2
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.deepStrictEqual(blogsAtEnd, blogsAtStart)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})