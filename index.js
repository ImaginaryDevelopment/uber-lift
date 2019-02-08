const express = require('express')
const app = express()
const port = 3000
app.get('/', (req,res) => res.sendFile(__dirname + '/public/index.html'))
app.get('/hello', (req,res) => res.send('Hello World!'))
app.get('/markers', (req,res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('public', ['html','htm']))
app.listen(port, () => console.log("Example app listening on port " + port))