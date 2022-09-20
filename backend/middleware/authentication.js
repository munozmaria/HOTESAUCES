const jwt = require("jsonwebtoken")

function verifyUser (req, res, next){
  
    const header = req.header("Authorization")

    if (header == null) return res.status(403).send({message: "There is no header 👎"})


    const token = header.split(" ")[1]

    if(token == null) return res.status(403).send({message: "Token invalid 👎"})
   
   
    jwt.verify(token, process.env.tokenPword, (err, decoded) => {
        if (err) return res.status(403).send({messageee: "Token invalid 👎" + err})

        next()
    })

    
}

module.exports = {verifyUser}