const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save(blog))
  await Promise.all(promiseArray)
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

test('blog without titles/url are not added', async () => {
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

after(async () => {
  await mongoose.connection.close()
})