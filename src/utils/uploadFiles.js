const multer = require('multer')
const path = require('path')
const UPLOAD_PATH = path.resolve(__dirname,'../../images')

const uploadImageBuffer = multer({
    limits:{
        fileSize:5000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

const uploadImageStorage = multer({
    'dest':UPLOAD_PATH,
    limits:{fieldSize:2000000 , files:5}
    })

    // filename: function(req,file,cb){
    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //     cb(null,file.fieldname + '-' + uniqueSuffix)
    // }

module.exports = { uploadImageBuffer , uploadImageStorage }