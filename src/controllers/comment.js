const express = require('express')
const auth = require('../middleware/auth')
const commentService = require('../services/comment')
const router = express.Router()

//Get
router.get('/comments' , auth, async(req,res) => {
    try {
        const comments = await new commentService().getComments(req.query)
        res.status(200).send(comments)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//POST
router.post('/comment' , auth , async(req,res) => {
    try {
        const comment = await new commentService().createComment(req.body,req.user._id)
        res.status(201).send(comment) 
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.patch('/comment/:id' , auth , async(req,res) => {
    try {
        const comment = await new commentService().updateComment(req.params.id,req.body , req.user._id)
        res.status(200).send(comment)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.delete('/comment/:id' , auth, async(req,res) => {
    try {
        const comment = await new commentService().removeComment(req.params.id , req.user._id)
        res.status(200).send(comment)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router