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

const readFile = (relPath, fText) => fs.readFile(__dirname + relPath, 'utf8', (err, text) => {
    if (err != null) throw err
    return fText(text)
})

const indexHandler = (req, res) => {
    if (req.cookies != null && req.cookies.bearer != null) {
        return res.redirect('/home')
    }
    // reference: https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
    if (req.query.code == null) {
        // reference: https://stackoverflow.com/questions/26079611/node-js-typeerror-path-must-be-absolute-or-specify-root-to-res-sendfile-failed
        // https://login.uber.com/oauth/v2/authorize?response_type=code&client_id=SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz&scope=history+history_lite+profile&redirect_uri=http://localhost:3000
        readFile('/public/index.html', html => {
            console.log('indexing', req.headers.host)
            res.send(html.replace('@authUrl', ubering.getAuthUrl(req.protocol,req.headers.host, '')))
        })
    } else {
        console.log('ubering!')
        ubering.getBearer(clientSecret, req.query.code, req.protocol, req.headers.host,
            bearer => {
                res.cookie('bearer', bearer)
                res.redirect('/home')
            })
    }
}
const getTableHtml = (me, history, f) =>
    readFile('/public/table.html',
        html => {
            console.log('we have a table')
            const data = JSON.stringify(history)
            const pro = JSON.stringify(me)
            const output = html.replace("data = null", 'data = ' + data).replace("me = null", 'me = ' + pro)
            console.log('we have html',output)
            return f(output)
        }
    )

const homeHandler = (req, res) => {
    if (req.cookies == null || req.cookies.bearer == null) return res.redirect('/')
    const bearer = req.cookies.bearer
    ubering.getMe(bearer, (me, _isFull) => {
        ubering.getHistory(bearer, history => {
            // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
            const send = x => res.send(x)
            return getTableHtml(me, history, send)
        })
    })
}
app.get('/hello', (_req, res) => res.send('Hello World!'))
app.get('/', indexHandler)
app.get('/home', homeHandler)
app.get('/history/sample/raw', (_req, res) => res.sendfile(__dirname + '/public/samplehistory.json'))
app.get('/history/sample/table', (_, res) => {
    readFile('/public/sampleuser.json', me =>
        readFile('/public/samplehistory.json', history =>{
            // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
            const send = x => res.send(x)
            getTableHtml(JSON.parse(me), JSON.parse(history), send)
        }
        )
    )
})
app.get('/markers', (_req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('client'))
app.use(express.static('public', ['html', 'htm', 'json']))
// express error-handling: https://expressjs.com/en/guide/error-handling.html
app.use(function (err, req, res, next) {
    console.log('in error handler')
    console.error(err.stack)
    // log this to database in prod, not to customer
    res.status(500).send('Error:' + util.inspect({ err, req, res, next }))
})
app.listen(port, () => console.log("Example app listening on port " + port))
