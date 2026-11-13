const mongoose = require("mongoose")

function connectToDb(){
    mongoose.connect(process.env.MONGOBD_URL)
    .then(()=>{
        console.log("Connected to Db")
    })
    .catch((err)=>{
        console.error("Error connecting to MongoDB")
    })
}

module.exports = connectToDb