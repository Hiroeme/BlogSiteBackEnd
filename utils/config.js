require('dotenv').config()

const PORT = process.env.PORT
const mongoUrl = process.env.mongoUrl

module.exports = {
  PORT,
  mongoUrl
}