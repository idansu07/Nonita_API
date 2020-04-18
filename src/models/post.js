const mongoose = require('mongoose')

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
    comments:[{
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: 'User'
        },
        content:{
            type:String,
            trim:true,
            required:true
        },
        createdAt:{
            type:Date,
            required:true
        },
        updatedAt:{
            type:Date
        }
    }],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    }
}, {
    timestamps:true
})

postSchema.statics.getPosts = async(spec) => {
    let query = {}
    if(spec.id) query._id = spec.id
    if(spec.userId) query._owner = spec.userId

    try {
        const posts = await Post.find(query).sort('-createdAt').populate('owner').exec()
        return posts
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



const Post = mongoose.model('Post',postSchema)

module.exports = Post