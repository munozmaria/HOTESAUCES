const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require("path");




//Connection to database
const mongo = require('./mongo');


//Controllers
const {createUser, logUser} = require("./controllers/users");
const {getSauces, createSauces, getOnlyOneSauce, deleteSauce, modifySauce, likeSauce} = require("./controllers/sauces");


//Middleware 
app.use(cors());

app.use(express.json());

const {verifyUser} = require ("./middleware/authentication");

const {upload} = require ('./middleware/multer');

//Routes
app.post('/api/auth/signup', createUser) 
app.post('/api/auth/login', logUser)
app.get("/api/sauces", verifyUser, getSauces)
app.post("/api/sauces", verifyUser, upload.single("image"), createSauces)
app.get("/api/sauces/:id",verifyUser, getOnlyOneSauce)
app.put("/api/sauces/:id",verifyUser,  upload.single("image"), modifySauce)
app.delete("/api/sauces/:id",verifyUser, deleteSauce)
app.post("/api/sauces/:id/like", verifyUser, likeSauce)

app.get('/', (req, res) => {
  res.send(`Lstening on port 3000 💯`) 
})



app.use("/images", express.static(path.join(__dirname,"images")))


app.listen(process.env.PORT || 3000, ()=> console.log('serveur working 👍'))

module.exports = app;