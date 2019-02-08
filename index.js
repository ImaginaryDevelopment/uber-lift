const express = require('express')
const https = require('https')
const request = require('request')
const querystring = require('querystring')
const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'
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
        // res.send('Hello code! ' + req.query.code)
        const form = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: 'http://' + req.headers.host + (port != 80 ? ':' + port : '')
        }
        const formData = querystring.stringify(form)
        // reference: https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
        request({
            headers: { 'Content-Length': formData.length, 'Content-Type': 'application/x-www-form-urlencoded' },
            uri: 'https://login.uber.com/oauth/v2/token',
            body: formData,
            method: 'POST'
        }, function (err, res2, body) {
            console.log('yay response?' + typeof body)
            const bearer = JSON.parse(body);
            if (bearer.error) {
                res.send('Error:' + JSON.stringify(bearer))
            } else if(bearer.access_token){
                res.send('Bearer :' + bearer.access_token)
            }
        })
    }
};
app.get('/', indexHandler)
app.get('/hello', (req, res) => res.send('Hello World!'))
app.get('/markers', (req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('public', ['html', 'htm']))
app.listen(port, () => console.log("Example app listening on port " + port))
