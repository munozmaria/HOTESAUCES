
const mongoose = require ('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

mongoose.connect((process.env.URI), {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('database connected 🔥'))
    .catch(error => console.log('erreur connection' + error))


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        
    },
  });

userSchema.plugin(uniqueValidator)


  const User = mongoose.model('User', userSchema)
  
  module.exports = {mongoose, User}