require('../db/mongoose')
const mongooseCommentModel = require('../models/comment')

class CommentService {

    constructor(model =  mongooseCommentModel){
        this.commentModel = model
    }

    getComments = async (spec) => {
        try {
            const comments = await this.commentModel.getComments(spec)
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

    updateComment = async (id,commentData,userId) => {
        if(!commentData.text) throw new Error('Text is empty')
        try {
            const comments = await this.commentModel.getComments({ id , userId })
            if(!comments || comments.length === 0) throw new Error('Comment not found')
            const comment = comments[0]
            comment.text = commentData.text
            return await comment.saveComment()
        } catch (error) {
            throw error
        }
    }

    removeComment = async (id,userId) => {
        try {
            if(!id) throw new Error('commentId is required')
            return await this.commentModel.removeComment(id,userId)
        } catch (error) {
            throw error
        }
    }   

}

module.exports = CommentService