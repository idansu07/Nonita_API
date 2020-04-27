const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Post = require('../models/post')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    userName:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validte(value){
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    birthday:{
        type:Date,
        //required: true,
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }],
    avatar:{
            type:Buffer,
            contentType: String
    },
    sentRequests:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: 'User'
        },
        createdAt:{
            type:Date,
            required:true
        }
    }],
    requests:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: 'User'
        },
        userName:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            required:true
        }
    }],
    friendsList:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: 'User'
        },
        createdAt:{
            type:Date,
            required:true
        }
    }],
    socketId:{
        type:String
    },
    online:{
        type:Boolean,
        required:true
    }
}, {
    timestamps:true,
    toObject:{
        transform: function (doc, ret) {
            delete ret.tokens;
            delete ret.password
        }
    },
    toJSON:{
        transform: function (doc, ret) {
            delete ret.tokens;
            delete ret.password
        }
    }
})

userSchema.virtual('posts',{ 
    ref:'Post',
    localField: '_id',
    foreignField: 'owner'
 })

 userSchema.virtual('comments',{ 
    ref:'Comment',
    localField: '_id',
    foreignField: 'owner'
 })


userSchema.pre('save' ,async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)
    }
    next()
})



// Delete user tasks when user is removed
userSchema.pre('remove' , async function(next) {
    const user = this
    await Post.deleteMany({ owner: user._id })
    next()
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user.id.toString()} ,process.env.JWT_SECRET)
    user.tokens = [...user.tokens , { _id: user.id , token:token }]
    await user.save()
    return token
}

userSchema.methods.saveUser = async function(){
    const user = this
    try {
        const newUser = await user.save()
        return newUser
    } catch (error) {
        throw new Error(error)
    }
}

//Static methods
userSchema.statics.findByCredentials = async(email,password) => {
    const user = await User.findOne({ email })
    if(!user) throw new Error('Unable to login - email not found')
    const isMatch = await bcrypt.compare(password , user.password)
    if(!isMatch) throw new Error('Unable to login')
    return user
}

userSchema.statics.getUsers = async function(spec = { limit:5 }){
    
    let query = {}
    if(spec.id) query._id = spec.id
    if(spec.userName) query.userName = spec.userName
    if(spec.email) query.email = spec.email
    if(spec.firstName) query.firstName = spec.firstName
    if(spec.lastName) query.lastName = spec.lastName
    if(spec.socketId) query.socketId = spec.socketId

    try {
        const users = await User.find(query)
        return users
    } catch (error) {
        throw new Error('Unable to get users')
    }
}


const User = mongoose.model('User',userSchema)
module.exports = User

