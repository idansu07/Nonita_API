const express = require('express')
const auth = require('../middleware/auth')
const postService = require('../services/post')
const { uploadImageBuffer } = require('../utils/uploadFiles')

const router = express.Router()

//Get
router.get('/posts',auth,async(req,res) => {
    try {
        const posts = await new postService().getPosts(req.query)
        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send(error.message)
    }    
})

//Post
router.post('/posts' , auth , uploadImageBuffer.array('file') , async(req,res) => {
    try {
        const post = await new postService().createPost(req.body,req.user._id,req.files)
        res.status(201).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Patch
router.patch('/posts' , auth , async(req,res) => {
    try {
        const post = await new postService().updatePost(req.body)
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Delete
router.delete('/posts' , auth , async(req,res) => {
    try {
        await new postService().removePost(req.query._id)
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router