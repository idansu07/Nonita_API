const mongoose = require('mongoose')
const messageSchema = mongoose.Schema({
    message:{
        text: { type:String, required:true }
    },
    // users:[{
    //     user: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true }
    // }],
    sender: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    reciver: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    read: { type:Date }
},
{
    timestamps: true
});

//users should be array of participants
messageSchema.statics.getMessages = async(currentUser,friend) => {
    try {
        const messages = await Message.find({ $and :[ { $or: [ { sender:currentUser } ,{ sender:friend } ] } ,
                                                      { $or: [ { reciver: currentUser } ,{ reciver:friend } ] }
                                                    ] }).sort({ updateAt:1 })
        return messages
    } catch (error) {
        throw new Error(error)
    }
}

messageSchema.methods.saveMessage = async function(){
    const message = this
    try {
        return await message.save()
    } catch (error) {
        throw new Error(error)
    }
}


const Message = mongoose.model('Message',messageSchema)
module.exports = Message