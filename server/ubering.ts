const querystring = require('querystring')
const request = require('request')

const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'

const getAuthority = (protocol:string, host:string) => (host == 'uber-lift.herokuapp.com' ? 'https' : protocol) + '://' + host
type GetAuthDelegate = (protocol:string, host:string, relRedirect:string) => string
const getAuthUrl: GetAuthDelegate  = (protocol:string, host:string, relRedirect:string) =>
    'https://login.uber.com/oauth/v2/authorize?response_type=code'
    + '&client_id=' + clientId
    + '&scope=history+history_lite+profile'
    + '&redirect_uri=' + getAuthority(protocol, host) + relRedirect // http://localhost:3000'
exports.getAuthUrl = getAuthUrl
exports.getBearer = (clientSecret:string, code:string, protocol:string, host:string, fBearer:Action1<string>) => {
    const form = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: getAuthority(protocol, host)
    }
    const formData = querystring.stringify(form)
    // reference: https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
    request({
        headers: { 'Content-Length': formData.length, 'Content-Type': 'application/x-www-form-urlencoded' },
        uri: 'https://login.uber.com/oauth/v2/token',
        body: formData,
        method: 'POST'
    }, function (_:any, res:Response, body:string) {
        console.log('yay response?' + typeof body)
        const jBody = JSON.parse(body);
        if (jBody.error) {
            throw jBody.error
        } else if (jBody.access_token) {
            fBearer(jBody.access_token);
        }
    })
}
exports.getFromUber = (bearer:string, uri:string, f:Action1<any>) => {
    if (bearer == null)
        throw ('no bearer for uri ' + uri)
    console.log("fetching" + uri)
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri,
        method: 'GET'
    }, (err:any, _:any, body:string|undefined) => {
        if (err != null) {
            console.error(JSON.stringify(err))
            throw ('getFromUber body:' + body)
        }
        if (body == null) throw 'getFromUber no body'
        const jBody = JSON.parse(body)
        // console.log('mybody', jBody, body)
        f(jBody)
    })
}
exports.getHistory = (bearer:string, fHistory:Action1<any>) => {
    console.log('fetching fresh history')
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri: 'https://api.uber.com/v1.2/history',
        method: 'GET'
    }, (err:any, _:any, body:string|undefined) => {
        if (err != null) {
            var e = JSON.stringify(err)
            console.error(e)
            throw e
        }
        if (body == null) throw 'getHistory no body'
        const jBody = JSON.parse(body)
        fHistory(jBody)
    })

}
exports.getMe = (bearer:string, f:Action2<UberProfile,boolean>) => {
    exports.getFromUber(bearer, 'https://api.uber.com/v1.2/me', (me:UberProfile) => {
        console.log('me', me)
        // any schema validation goes here
        // yes double ! is ugly, but it makes typescript happy
        const isFullProfile:boolean = (!(!me.rider_id)) && Object.keys(me).indexOf('mobile_verified') >= 0 as boolean;
        if (!isFullProfile) console.error('scope request does not include profile')
        return f.call(null, me, isFullProfile)
    })

}