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

//This route handle like and unlike
router.post('/posts/like' , auth , async(req,res) => {
    try {
        const post = await new postService().setLike(req.body.id,req.user)
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
})


//Patch
router.patch('/posts/:id' , auth,uploadImageBuffer.array('file') , async(req,res) => {
    try {
        const post = await new postService().updatePost(req.params.id,req.body,req.files)
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Delete
router.delete('/posts/:id' , auth , async(req,res) => {
    try {
        const post = await new postService().removePost(req.params.id , req.user.id)
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router