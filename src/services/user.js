require('../db/mongoose')
const mongooseUserModel = require('../models/user')
const sharp = require('sharp')

class userService {

    constructor(model = mongooseUserModel){
       this.userModel =  model
    }

    getUsers = async (spec) =>{
        try {
            const users = await this.userModel.getUsers(spec)
            for (let index = 0; index < users.length; index++) {
                let user = users[index];
                
                //Get friends list
                const friendsIds = user.friendsList.map(f => (f.user.toJSON()))
                const userFriends = await this.userModel.getUsers({id: {$in:friendsIds}})                
                Object.assign(user.friendsList , userFriends)
            }
            return users
        } catch (error) {
            throw error
        }
    }

    createUser = async(userData) => {
        const user = new this.userModel(userData)
        try {
            const newUser = await user.saveUser()
            const token = await newUser.generateAuthToken()

            return {user:newUser , token}
        } catch (error) {
            throw error
        }
    }

    updateUser = async(oldUserData,newUserData,file) => {
        if(file){
            const buffer  = await sharp(file.buffer).resize({ width: 250 , height:250 }).png().toBuffer()
            newUserData.avatar = buffer
        }
        const updates = Object.keys(newUserData)
        const allowedUpdates = ['firstName','lastName','userName', 'email', 'password', 'birthday' ,'avatar']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) throw new Error('invalid update')
        updates.forEach(updateField => {
            if(newUserData[updateField]){
                oldUserData[updateField] = newUserData[updateField]
            }
        })
        try {
            const updateUser = await oldUserData.saveUser()
            return updateUser
        } catch (error) {
            throw error
        }
    }

    deleteUser = async(user) => {
        try {
            this.userModel = user
            await this.userModel.remove()
        } catch (error) {
            throw error
        }
    }

    loginUser = async(email , password) => {
        try {
            const user = await this.userModel.findByCredentials(email,password)
            const token = await user.generateAuthToken()
            return {user:user , token}
        } catch (error) {
            throw error
        }
    }

    logout = async(user,currentToken) => {
        try {
            user.tokens = user.tokens.filter((token) => {
                return token.token !== currentToken
            })
            user.online = false
            user.socketId = ''
            await user.save()
        } catch (error) {
            throw error
        }
    }

    setFriendRequest = async (senderUser , reciverUserId) => {
        try {

            const users = await this.userModel.getUsers({id:reciverUserId})
            if(!users || users.length === 0) throw new Error('Reciver user not found')
            const reciverUser = users[0]

            //Update sender user

            const requestAlreadyExists = senderUser.sentRequests.find(req => req.user._id == reciverUser.id)
            if(requestAlreadyExists) return senderUser

            senderUser.sentRequests = [...senderUser.sentRequests , { 
                user:reciverUser._id , 
                createdAt:new Date()
            }]
            
            //Update reciver user
            reciverUser.requests = [...reciverUser.requests , { 
                user:senderUser._id,
                createdAt:new Date(),
                userName:senderUser.userName
            }]

            await reciverUser.saveUser()
            return await senderUser.saveUser()

        } catch (error) {
            throw error
        }
        
    }

    acceptedFriendRequest = async (acceptedUser , requestId) => {

        const request = acceptedUser.requests.find(req => (req.id === requestId))
        if(!request) throw new Error('Request not found')

        const senderId = request.user 
        try {
            const users = await this.userModel.getUsers({ id: senderId })
            if(!users || users.length === 0) throw new Error('Sender user not found')
            const sender = users[0] 

            //Update sender
            sender.sentRequests = sender.sentRequests.filter(req => (req.user != acceptedUser.id))
            sender.friendsList = [...sender.friendsList , { 
                user: acceptedUser._id,
                createdAt:new Date()
            }]

            //Update acceptedUser
            acceptedUser.requests = acceptedUser.requests.filter(req => (req.id !== requestId))
            acceptedUser.friendsList = [...acceptedUser.friendsList , {
                user: sender._id,
                createdAt:new Date()
            }]

            await sender.saveUser()
            return await acceptedUser.saveUser()

        } catch (error) {
            throw error
        }
        
    }

    addSocketId =  async (userId , socketId) => {
        try {
            return await this.userModel.findByIdAndUpdate(userId,{ socketId,online:true },{new:true})
        } catch (error) {
            throw error
        }
    }

    removeSocketId  = async (socketId) => {
        try {
            const users = await this.userModel.getUsers({socketId})
            if(!users || users.length === 0) throw new Error('Reciver user not found')
            const user = users[0]
            return await this.userModel.findByIdAndUpdate(user._id ,{ socketId:'',online:false },{new:true})
        } catch (error) {
            throw error
        }
    }
}


module.exports = userService

