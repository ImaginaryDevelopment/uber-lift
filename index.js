const express = require('express')
const https = require('https')
const request = require('request')
const querystring = require('querystring')
const clientId = 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'
const app = express()
const port = process.env.PORT || 3000;
const indexHandler = (req, res) => {
    if (req.query.code == null) {
        res.sendFile(__dirname + '/public/index.html')
    } else {
        // res.send('Hello code! ' + req.query.code)
        const form = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: 'http://localhost:' + port
        }
        const formData = querystring.stringify(form)
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
            // res.send('Bearer :' + JSON.stringify(body));
            // res.send('Bearer :' + bearer);
        })



    }
};
app.get('/', indexHandler)
app.get('/hello', (req, res) => res.send('Hello World!'))
app.get('/markers', (req, res) => res.sendFile(__dirname + '/public/markers.html'))
app.use(express.static('public', ['html', 'htm']))
app.listen(port, () => console.log("Example app listening on port " + port))
