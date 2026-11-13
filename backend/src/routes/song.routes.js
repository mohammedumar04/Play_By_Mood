const express = require('express')
const uploadFile = require("../service/storage.service")
const multer = require("multer")
const songModel = require("../models/song.model")
const router = express.Router() // creating with help of express
// here multer is used to read the date, which was uploaded from 'form-data'

const upload = multer({ storage: multer.memoryStorage() }) // here memoryStorage is nothing but storing file in ram(stores for sometime (temporary storage))

router.post('/songs',upload.single("audio"), async (req, res) => { // upload.single is a middleware, if mutlipe files uploading use upload.multiple ,note the name written in the upload.single must be same in form-data

    console.log(req.body)
    console.log(req.file)
    const fileData = await uploadFile(req.file)
    // console.log(fileData)
    const song = await songModel.create({
        title: req.body.title,
        artist: req.body.artist,
        audio: fileData.url,
        mood: req.body.mood
    })

    res.status(201).json({ // here status code was 201 means creating something in database.
        message: 'Song created successfully',
        song: song
    })
})

router.get('/songs', async(req,res)=>{
    const {mood} = req.query

    const songs = await songModel.find({
        mood: mood
    })

    res.status(200).json({
        message: "Song fetched successfully",
        songs
    })
})



module.exports = router