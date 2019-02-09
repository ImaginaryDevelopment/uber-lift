const express = require('express')
const https = require('https')
const ubering = require('./ubering.js')
const fs = require('fs')
const clientSecret = process.env.ubersecret
if (clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret'
const app = express()
const port = process.env.PORT || 3000;
const sendErrorF = res => e => res.send('Error:' + JSON.stringify(e))
const indexHandler = (req, res) => {
    const sendError = sendErrorF(res)
    if (req.cookies != null) {
        res.send('Cookies:' + JSON.stringify(req.cookies))
        // ubering.getHistory(req.cookies('bearer'),() => {}, (err,res2,body) => res.send('Error:' + JSON.stringify({err,res2,body})))
        return;
    }
    // reference: https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
    if (req.query.code == null) {
        // reference: https://stackoverflow.com/questions/26079611/node-js-typeerror-path-must-be-absolute-or-specify-root-to-res-sendfile-failed
        res.sendFile(__dirname + '/public/index.html')
    } else {
        console.log('ubering!')
        ubering.getBearer(clientSecret, req.query.code, req.headers.host, port,
            bearer => {
                res.cookie('bearer', bearer)
                ubering.getHistory(bearer, history => {
                    res.send(history)
                }, sendError)
            },
            sendError
        )
    }
};
app.get('/', indexHandler)
app.get('/hello', (req, res) => res.send('Hello World!'))
app.get('/history/sample/raw', (req, res) => res.sendfile(__dirname + '/public/samplehistory.json'))
app.get('/history/sample/table', (_, res) => {
    fs.readFile(__dirname + '/public/samplehistory.json', 'utf8', (err, raw) => {
        if (err != null) return sendErrorF(res)(err)
        fs.readFile(__dirname + '/public/table.html', 'utf8', (err, html) => {
            if (err != null) return sendErrorF(res)(err)
            res.send(html.replace("'@body'",raw))
        }
        )
    }
    )
})
app.get('/markers', (req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('client'))
app.use(express.static('public', ['html', 'htm', 'json']))
app.listen(port, () => console.log("Example app listening on port " + port))
