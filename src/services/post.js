require('../db/mongoose')
const postModel = require('../models/post')
const sharp = require('sharp')

class PostService {

    constructor(model = postModel){
        this.postModel =  model
    }

    getPosts = async (spec) => {
        try {
            const posts = await this.postModel.getPosts(spec)

            posts.forEach(post => {
                post.owner = post.owner
            })

            return posts
        } catch (error) {
            throw error
        }
    }

    createPost = async (postData , userId , files) => {
        try {
            const post = new postModel(postData)
            post.owner = userId
            if(files.length > 0){
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    const buffer  = await sharp(file.buffer).resize({ width: 250 , height:250 }).png().toBuffer()
                    post.images.push({image:buffer})
                }
            }
            return await post.savePost() 
        } catch (error) {
            throw error
        }
    }

    updatePost = async (updatePost) => {
        try {
            if(!updatePost._id) throw new Error('postId is required')
            const updates = Object.keys(updatePost)
            const allowedUpdates = ['content']
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
            if (!isValidOperation) throw new Error('invalid update')
            const postDB = await this.postModel.getPosts({ id: updatePost._id , userId: updatePost.owner })
            if(!postDB) throw new Error('post not found')
            updates.forEach(updateField => postDB[updateField] = updatePost[updateField])
            return await postDB.savePost()
        } catch (error) {
            throw error
        }
    }

    removePost = async (postId) => {
        try {
            if(!post._id) throw new Error('postId is required')
            const postDB = await this.postModel.getPosts({ id: postId , userId: updatePost.owner })
            if(!postDB) throw new Error('post not found')
            await postDB.remove()
        } catch (error) {
            throw error
        }
    }
}

module.exports = PostService