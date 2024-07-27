const mongoose = require('mongoose')
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
require('express-async-errors')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails when username is less than 3 letters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Bo',
      password: 'password',
      name: 'Bob'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('username and password have to be at least 3 letters'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails when password is less than 3 letters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Bob',
      password: 'pa',
      name: 'Bob'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('username and password have to be at least 3 letters'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})