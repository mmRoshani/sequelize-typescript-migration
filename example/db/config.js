require('dotenv').config()

module.exports = {
  development: {
    url: process.env.DB_URI
  },
  test: {
    url: process.env.DB_URI
  },
  production: {
    url: process.env.DB_URI
  }
}
