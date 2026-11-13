require('dotenv').config()
const app = require("./src/app")
const connectToDb = require("./src/db/db")


connectToDb()
const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})