const express = require('express')
const auth = require('../middleware/auth')
const userService = require('../services/user');
const { uploadImageBuffer } = require('../utils/uploadFiles')


const router = express.Router()

//Get
router.get('/users' , auth ,async (req,res) => {
    try {
        const users = await new userService().getUsers(req.query)
        res.status(200).send(users)
    } catch (error) {
        res.status(400).send(error.message)
    }  
})

router.get('/users/me' , auth , async(req,res) => {
    try {
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//Post
router.post('/users', async (req,res) => {
    try {
        const user = await new userService().createUser(req.body)
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/users/login' , async (req,res) => {
    try {
        const { user , token } = await new userService().loginUser(req.body.email,req.body.password)
        res.send({ user , token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/users/logout' , auth ,  async(req,res) => {
    try {
        await new userService().logout(req.user,req.token)
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Patch
router.patch('/users' , auth,uploadImageBuffer.single('avatar') ,async (req,res) => {
    try {
        const user = await new userService().updateUser(req.user,req.body , req.file)
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Delete
router.delete('/users' , auth , async(req,res) => {
    try {
        await new userService().deleteUser(req.user)
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router

