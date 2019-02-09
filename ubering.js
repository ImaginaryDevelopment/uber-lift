const querystring = require('querystring')
const request = require('request')

const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'
const getAuthority = host => 'http://' + host
exports.getAuthUrl = (host, relRedirect) =>
    'https://login.uber.com/oauth/v2/authorize?response_type=code'
    + '&client_id=' + clientId
    + '&scope=history+history_lite+profile'
    + '&redirect_uri=' + getAuthority(host) + relRedirect // http://localhost:3000'
exports.getBearer = (clientSecret, code, host, fBearer, fErr) => {
    const form = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: getAuthority(host)
    }
    const formData = querystring.stringify(form)
    // reference: https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
    request({
        headers: { 'Content-Length': formData.length, 'Content-Type': 'application/x-www-form-urlencoded' },
        uri: 'https://login.uber.com/oauth/v2/token',
        body: formData,
        method: 'POST'
    }, function (_err, _res, body) {
        console.log('yay response?' + typeof body)
        const jBody = JSON.parse(body);
        if (jBody.error) {
            fErr()
        } else if (jBody.access_token) {
            fBearer(jBody.access_token);
        }
    })
}
exports.getFromUber = (bearer, uri, f, fErr) => {
    if (bearer == null)
        return fErr('no bearer for uri ' + uri)
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri,
        method: 'GET'
    }, (err, res, body) => {
        if (err != null) {
            console.error(JSON.stringify(err))
            return fErr(err, res, body)
        }
        if (body == null) return fErr({ err, res, body })
        const jBody = JSON.parse(body)
        console.log('mybody', jBody, body)
        f(jBody)
    })
}
exports.getHistory = (bearer, fHistory, fErr) => {
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri: 'https://api.uber.com/v1.2/history',
        method: 'GET'
    }, (err, res, body) => {
        if (err != null) {
            console.error(JSON.stringify(err))
            return fErr(err, res, body)
        }
        if (body == null) return fErr({ err, res, body })
        const jBody = JSON.parse(body)
        fHistory(jBody)
    })

}
exports.getMe = (bearer, f, fErr) => {
    exports.getFromUber(bearer, 'https://api.uber.com/v1.2/me', me => {
        console.log('me', me)
        // any schema validation goes here
        var isFullProfile = me.rider_id && Object.keys(me).indexOf('mobile_verified') >= 0;
        if (!isFullProfile) console.error('scope request does not include profile')
        return f.call(me, isFullProfile)
    }, fErr)

}