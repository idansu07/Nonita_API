const express = require('express')
const auth = require('../middleware/auth')
const messageService = require('../services/message')

const router = express.Router()

router.get('/message/:id' , auth , async(req,res) => {
    try {
        const messages = await new messageService().getMessages(req.user,req.params.id)
        res.status(200).send(messages)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router