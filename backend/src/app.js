const express = require("express")
const songRoutes = require("./routes/song.routes")
const cors = require("cors")
const path = require('path')

const app = express()
const frontendPath = path.join(__dirname, '../../frontend/dist')

app.use(express.json())
app.use(cors())
app.use(express.static(frontendPath))

app.use('/',songRoutes) // this line is to know that the another api exist in this backend

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
})

module.exports = app