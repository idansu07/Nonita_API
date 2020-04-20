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

commentSchema.statics.getComments = async(spec) => {
    let queryFind = {}
    if(spec.id) queryFind._id = spec.id
    if(spec.userId) queryFind.owner = spec.userId
    if(spec.parentId) queryFind.parent = {$in: spec.parentIds}
    if(spec.postIds) queryFind.post = {$in: spec.postIds}
    try {
        let query = Comment.find(queryFind).sort('createdAt')
        if(spec.includeOwner) query.populate('owner')
        if(spec.includeParent) query.populate('parent')
        const comments = await query.exec()
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

commentSchema.statics.removeComment = async (id,userId) => {
    try {
        const comment = await Comment.findByIdAndRemove({ _id: id , owner:userId })
        await comment.remove()
        return comment
    } catch (error) {
        throw new Error(error)
    }
}

commentSchema.pre('remove' ,  async function(next) {
    const comment = this
    await Comment.deleteMany({ parent: comment._id })
    next()
})

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment