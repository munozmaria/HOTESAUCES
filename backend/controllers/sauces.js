
const mongoose = require("mongoose")
const unlink = require("fs").promises.unlink 



const productSchema = new mongoose.Schema({
    userId  :String,
    name : String,
    manufacturer : String, 
    description : String,
    mainPepper : String, 
    imageUrl : String, 
    heat : Number,
    likes : Number, 
    dislikes : Number, 
    usersLiked : [String],
    usersDisliked : [String]

})

const Product = mongoose.model("Product", productSchema)





function getSauces(req, res){

    Product.find({})
    .then(products => res.send(products))
    .catch(error => res.status(500).send(error))
     
    
}


function createSauces(req,res){
   
    
    const sauce = JSON.parse(req.body.sauce)
 

    const {name, manufacturer, description, mainPepper, heat, userId} = sauce


    const imageUrl =  (req.protocol + '://' + req.get('host')) + '/images/' + req.file.filename
    
  

    const product = new Product({
        userId,
        name,
        manufacturer, 
        description,
        mainPepper, 
        imageUrl, 
        heat,
        likes: 0,
        dislikes: 0,
        usersLiked : [],
        usersDisliked : []
    })
    product
    .save()
    .then((message)=> {
        res.status(201).send({message})
        return 
    }).catch(error => res.status(500).send(error))
}

function getOneSauce(req, res){
    const id = req.params.id
    return Product.findById(id)
}


function getOnlyOneSauce (req, res){
    getOneSauce(req, res)
    .then(product => modifyUpdateResponseClient(product,res))
    .catch(error => res.status(500).send({message: error}))
    
}



function deleteSauce(req, res){
    const id = req.params.id
    Product.findByIdAndDelete(id)
    .then(deleteImageLocal)
    .then(dataResponse => modifyUpdateResponseClient(dataResponse, res)) 
    .catch(error => res.status(500).send({message: error}))
}




function deleteImageLocal (dataResponse){
    const imageUrl = dataResponse.imageUrl
    const imageToDelete = imageUrl.split("/").at(-1)
    return unlink(`images/${imageToDelete}`).then(() => dataResponse)

}


function modifySauce (req, res){
    const params = req.params
    const id = params.id


    let addImage = req.file != null

    const payload = makeNewPayload(addImage, req)
   

    Product.findByIdAndUpdate(id, payload)
    .then((dataResponse) => modifyUpdateResponseClient(dataResponse, res))
    .then ((Product) => { 
            if(addImage) deletePreviousImage (Product)
    })
    .catch(error => res.status(500).send({message: error}))
   
     }

function deletePreviousImage (product){
    if (product == null || product.imageUrl == "") {
        return
    }else{
        const imageDelete = product.imageUrl.split("/").at(-1)
        return unlink(`images/${imageDelete}`).then(() => product)
    }
}



function makeNewPayload (addImage, req){
 
    if (!addImage){
        return req.body
    }else{   
        const payload = JSON.parse(req.body.sauce)
        payload.imageUrl = (req.protocol + '://' + req.get('host')) + '/images/' + req.file.filename
        return payload
    }
}


function modifyUpdateResponseClient(dataResponse, res){
        if (dataResponse == null){
  
            res.status(404).send({message: "Objet not found in database"})
        } else{
      
            return Promise.resolve (res.status(200).send(dataResponse)).then(()=>dataResponse)
        }
    }




function likeSauce (req, res){
   const {like, userId} = req.body

   if (![1, -1, 0].includes (like)){
     return res.status (403).send({message : "Invalid value"})
    } else{

    getOneSauce(req, res)
    .then(product => updateLike(product, like, userId, res))
    .then(vote => vote.save())
    .then(prod => modifyUpdateResponseClient(prod, res))
    .catch(error => res.status(500).send(error))
    }
    
}

function updateLike (product, like, userId, res){
  if (like === 1 || like === -1) return changeVote (product, userId, like)
  if (like === 0) return resetVote (product, userId, res)

}

function changeVote(product, userId, like){
    
    const {usersLiked, usersDisliked} = product

    const likesArray = like === 1? usersLiked : usersDisliked
   
    if (likesArray.includes (userId)) {
    
        return product

    }else{
        
        likesArray.push(userId)

        like === 1 ? ++product.likes : ++product.dislikes
        return product
   }
    
}

function resetVote(product, userId){
   
    const {usersLiked, usersDisliked} = product
    
    if ([usersLiked, usersDisliked].every(arr => arr.includes(userId))) return Promise.reject("you can not vote both ways")

    
    if (![usersLiked, usersDisliked].some(arr => arr.includes(userId))) return Promise.reject ("user seems have not voted")

    
    if (usersLiked.includes(userId)){
        --product.likes 
        product.usersLiked = product.usersLiked.filter(id => id !== userId)
    }else{
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter(id => id !== userId)
    }

    return product

}



module.exports = {getSauces, createSauces, getOnlyOneSauce, deleteSauce, modifySauce, likeSauce}