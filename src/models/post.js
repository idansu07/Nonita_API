const mongoose = require('mongoose')
const Comment = require('../models/comment')

const postSchema = new mongoose.Schema({
    content:{
        type:String,
        trim:true
    },
    images:[{
        image:{
            type:Buffer,
            contentType: String
        }
    }],
    likes:[{
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: 'User'
        },
        createdAt:{
            type:Date,
            required:true
        }
    }],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    }
}, {
    timestamps:true,
    toObject:{
        transform: function (doc, ret) {
            ret.comments
        }
    },
    toJSON:{
        virtuals: true,
        transform: function (doc, ret, options) {
            ret.comments = doc.comments  ? [...doc.comments] : []
            return ret
        }
    }
})

postSchema.virtual('comments',{
    ref:'Comment',
    localField: '_id',
    foreignField: 'post'
 })

postSchema.statics.getPosts = async(spec) => {
    let query = {}
    if(spec.id) query._id = spec.id
    if(spec.userId) query.owner = spec.userId
    try {
        const posts = await Post.find(query).sort('-createdAt').populate('owner').exec()
        return posts
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

postSchema.statics.removePost = async(id,userId) => {
    try {
        const post = await Post.findByIdAndRemove({ _id: id , owner:userId})
        await post.remove()
        return post
    } catch (error) {
        throw new Error(error)
    }
}

postSchema.methods.savePost = async function(){
    const post = this
    try {
        return await post.save(post)
    } catch (error) {
        throw new Error(error)
    }
}

postSchema.pre('remove' , async function(next) {
    const post = this
    await Comment.deleteMany({ post: post._id })
    next()
})

const Post = mongoose.model('Post',postSchema)

module.exports = Post