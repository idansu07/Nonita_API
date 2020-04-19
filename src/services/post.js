require('../db/mongoose')
const postModel = require('../models/post')
const Comment = require('../models/comment')
const sharp = require('sharp')

class PostService {

    constructor(model = postModel){
        this.postModel =  model
    }

    getPosts = async (spec) => {
        try {
            const posts = await this.postModel.getPosts(spec)

            let postIds = [];
            posts.forEach(post => {
                post.owner = post.owner
                postIds.push(post._id);
            })
            let comments = await Comment.find({ post: {$in: postIds} }).populate('owner').sort({ post:1, createdAt:-1 })
            if(comments){
                posts.forEach(post => {
                    post.comments = comments.filter(comment => ( comment.post ==  post.id))
                })
            }
            return posts
        } catch (error) {
            throw error
        }
    }

    setLike = async(id, user) => {
        try {
            const spec = { id:id }
            const posts =  await this.postModel.getPosts(spec)
            if(!posts) throw new Error('Post not found')
            const post = posts[0]
            const likeExists = post.likes.find(like => like.owner == user.id)
            if(likeExists){
                post.likes = post.likes.filter(like => like.owner != user.id)
                return await post.savePost() 
            }
            else{
                post.likes.push({ owner:user.id , createdAt:new Date() })
                return await post.savePost() 
            }
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

    updatePost = async (id,updatePost,files) => {
        try {
            if(!id) throw new Error('postId is required')
            if(files.length > 0){
                updatePost.images = []
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    const buffer  = await sharp(file.buffer).resize({ width: 250 , height:250 }).png().toBuffer()
                    
                    updatePost.images.push({image:buffer})
                }
            }

            const updates = Object.keys(updatePost)
            const allowedUpdates = ['content' , 'images']
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
            if (!isValidOperation) throw new Error('invalid update')
            const posts = await this.postModel.getPosts({ id: id , userId: updatePost.owner })
            if(!posts) throw new Error('post not found')
            const postDB = posts[0]
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