require('../db/mongoose')
const commentModel = require('../models/comment')

class CommentService {

    constructor(model =  commentModel){
        this.commentModel = model
    }

    getComments = async (spec) => {
        try {
            const comments = await this.commentModel().getComments(spec)
            comments.forEach(comment => {
                comment.owner = comment.owner
            })
            return comments
        } catch (error) {
            throw error
        }
    }

    createComment = async (commentData,userId) => {
        if(!commentData.postId) throw new Error('Comment must be relation to post')
        const comment = new this.commentModel(commentData)
        comment.owner = userId
        comment.parent = commentData.parentId
        comment.post = commentData.postId
        try {
            return await comment.saveComment()
        } catch (error) {
            throw error
        }
    }

}

module.exports = CommentService