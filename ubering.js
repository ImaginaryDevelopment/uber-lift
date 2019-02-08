const querystring = require('querystring')
const request = require('request')

const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'
exports.getBearer = (clientSecret,code,host,port,fBearer,fError) =>{
        const form = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://' + host + (port != 80 ? ':' + port : '')
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
            const jBody = JSON.parse(body);
            if (jBody.error) {
                fError()
            } else if(jBody.access_token){
                fBearer(jBody.access_token);
            }
        })

}