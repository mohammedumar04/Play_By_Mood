const express = require("express")
const songRoutes = require("./routes/song.routes")
const cors = require("cors")
const path = require('path')
/* const frontendPath = path.join(__dirname, '../../frontend/public')
const allowedOrigins = require('./config/allowed-origins') */

const app = express()
app.use(express.json())
app.use(cors())

app.use('/',songRoutes) // this line is to know that the another api exist in this backend

module.exports = app