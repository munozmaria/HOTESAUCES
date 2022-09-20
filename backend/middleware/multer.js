const multer = require ("multer")
const storage = multer.diskStorage({destination: "images/", filename: nameImg})
const upload = multer({storage: storage})

function nameImg(req, file, cb){
    cb(null, Date.now()+ "_" + file.originalname)
  }


  module.exports = {upload}