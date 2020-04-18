const express = require('express')
const cors = require('./middleware/cors')
const user = require('./controllers/user')
const post = require('./controllers/post')

const app = express()
app.use(cors)
app.use(express.json())
app.use(user)
app.use(post)
module.exports = app