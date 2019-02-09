const express = require('express')
const cookieParser = require('cookie-parser')
// const https = require('https')
const ubering = require('./ubering.js')
const fs = require('fs')
const clientSecret = process.env.ubersecret
const util = require('util')

if (clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret'
const port = process.env.PORT || 3000;
const app = express()
app.use(cookieParser())

const err = e => { throw ('Error:' + JSON.stringify(e)) }
const readFile = (relPath, fText, fErr) => fs.readFile(__dirname + relPath, 'utf8', (err, text) => {
    if (err != null) return fErr(err)
    fText(text)
})

const indexHandler = (req, res) => {
    if (req.cookies != null && req.cookies.bearer != null) {
        return res.redirect('/home')}
    // reference: https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
    if (req.query.code == null) {
        // reference: https://stackoverflow.com/questions/26079611/node-js-typeerror-path-must-be-absolute-or-specify-root-to-res-sendfile-failed
        //https://login.uber.com/oauth/v2/authorize?response_type=code&client_id=SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz&scope=history+history_lite+profile&redirect_uri=http://localhost:3000
        readFile('/public/index.html', html => {
            console.log('indexing', req.headers.host)
            res.send(html.replace('@authUrl', ubering.getAuthUrl(req.headers.host, '')))
        })
    } else {
        console.log('ubering!')
        ubering.getBearer(clientSecret, req.query.code, req.headers.host,
            bearer => {
                res.cookie('bearer', bearer)
                res.redirect('/home')
            })
    }
};
const homeHandler = (req, res) => {
    if (req.cookies == null || req.cookies.bearer == null) return res.redirect('/')
    ubering.getMe(req.cookies.bearer, (me, _isFull) => {
        ubering.getHistory(req.cookies.bearer, history => {
            // res.send(util.inspect(me) + '\r\n' + util.inspect(history))
            readFile('/public/table.html', html => {
                res.send(html.replace("body = null", history).replace("me = null", me))
            })
        })
    })
}
app.get('/hello', (_req, res) => res.send('Hello World!'))
app.get('/', indexHandler)
app.get('/home', homeHandler)
app.get('/history/sample/raw', (_req, res) => res.sendfile(__dirname + '/public/samplehistory.json'))
app.get('/history/sample/table', (_, res) => {
    fs.readFile(__dirname + '/public/samplehistory.json', 'utf8', (err, raw) => {
        if (err != null) return sendErrorF(res)(err)
        fs.readFile(__dirname + '/public/table.html', 'utf8', (err, html) => {
            if (err != null) return sendErrorF(res)(err)
            const replaced =
                html
                    .replace("data = null", 'data = ' + raw)
            res.send(replaced)
        }
        )
    }
    )
})
app.get('/markers', (req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('client'))
app.use(express.static('public', ['html', 'htm', 'json']))
// express error-handling: https://expressjs.com/en/guide/error-handling.html
app.use(function (err, req, res, next) {
    console.error(err.stack)
    // log this to database in prod, not to customer
    res.status(500).send('Error:' + util.inspect({ err, req, res, next }))
})
app.listen(port, () => console.log("Example app listening on port " + port))
