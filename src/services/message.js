require('../db/mongoose')
const mongooseMessageModel = require('../models/message')
const userService = require('./user')
class MessageService {

    constructor(model = mongooseMessageModel){
        this.messageModel = model
    }

    getMessages = async (currentUser,friendId) => {
        const friends = await new userService().getUsers({id:friendId})
        if(!friends) throw new Error('MessageService => getMessages => user not found')
        const friend = friends[0]
        try {
            const messages = await this.messageModel.getMessages(currentUser, friend)
            return messages
        } catch (error) {
            throw error
        }
    }

    addMessage = async (message) => {
        if(!message) throw new Error('MessageService => addMessage => message is required')
        try {
            const newMessage = new this.messageModel(message)
            return await newMessage.saveMessage()
        } catch (error) {
            throw error
        }
    }
}

module.exports = MessageService