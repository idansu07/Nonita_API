const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Post'
    }
},{
    timestamps:true,
    toObject:{
        transform: function (doc, ret) {
        }
    },
    toJSON:{
        transform: function (doc, ret) {
        }
    }
})

commentSchema.static.getComments = async(spec) => {
    let query = {}
    if(spec.id) query._id = spec.id
    if(spec.userId) query.owner = spec.userId
    if(spec.parentId) query.parent = spec.parentId
    if(spec.postId) query.post = spec.postId
    try {
        const comments = await Comment.find(query).
            sort('-createdAt').
            populate('owner').
            populate('parent').
            exec()
        return comments
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

commentSchema.methods.saveComment = async function(){
    const comment = this
    try {
        return await comment.save(comment)
    } catch (error) {
        throw new Error(error)
    }
}

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment