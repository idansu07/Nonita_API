const express = require('express')
const cors = require('./middleware/cors')
const user = require('./controllers/user')
const post = require('./controllers/post')
const comment = require('./controllers/comment')

const app = express()
app.use(cors)
app.use(express.json())
app.use(user)
app.use(post)
app.use(comment)
module.exports = app