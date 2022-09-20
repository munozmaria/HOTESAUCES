
const {User} = require("../mongo")

const bcrypt = require("bcrypt")

const variableToken = require("jsonwebtoken")

//Créer un compte
async function createUser(req, res,){
  
    try{
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = await hashPassword(password)

    const user = await new User({email, password: hashedPassword}).save()
   
    res.status(201).send({message: "You are registered 💯 "})

    }catch(err ){
            res.status(409).send({message: "This email is already registered 😲 :" + err})
        } 
  
    
  }


//Function Hasher le Mot de Passe
  function hashPassword(password){
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
    
  }

//Function logUser 
async function logUser (req, res){

    try{
    const email = req.body.email
    const password = req.body.password
    
    const user = await User.findOne({email})
    
    const comparerPassword = await bcrypt.compare(password, user.password) 
    if(!comparerPassword){
        res.status(403).send({message: "Incorrect password"})
    }else{
        const token = createToken(email)
        res.status(200).send({userId: user._id, token: token})
    }

    } catch (err){
    res.status(500).send({message: "Error"})
    }

}




function createToken(email){
   const tokenPassword = process.env.tokenPword
   return token = variableToken.sign({email: email}, tokenPassword, {expiresIn: "24h"})
 
}



module.exports = {createUser, logUser}