require('../db/mongoose')
const usermodel = require('../models/user')
const sharp = require('sharp')
class userService {

    constructor(model = usermodel){
       this.userModel =  model
    }

    getUsers = async (spec) =>{
        try {
            const users = await this.userModel.getUsers(spec)
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
            await user.save()
        } catch (error) {
            throw error
        }
    }
}


module.exports = userService

