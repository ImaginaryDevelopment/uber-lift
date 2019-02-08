const express = require('express')
const https = require('https')
const ubering = require('./ubering.js')
const clientSecret = process.env.ubersecret
if(clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret'
const app = express()
const port = process.env.PORT || 3000;
const indexHandler = (req, res) => {
    // reference: https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
    if (req.query.code == null) {
        // reference: https://stackoverflow.com/questions/26079611/node-js-typeerror-path-must-be-absolute-or-specify-root-to-res-sendfile-failed
        res.sendFile(__dirname + '/public/index.html')
    } else {
        console.log('ubering!')
        ubering.getBearer(clientSecret,req.query.code,req.headers.host,port,bearer =>
                res.send('Bearer :' + bearer), e => res.send('Error:' + JSON.stringify(e))
                )
    }
};
app.get('/', indexHandler)
app.get('/hello', (req, res) => res.send('Hello World!'))
app.get('/markers', (req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('public', ['html', 'htm']))
app.listen(port, () => console.log("Example app listening on port " + port))
