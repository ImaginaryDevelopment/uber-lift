const querystring = require('querystring')
const request = require('request')

const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz'
const getAuthority = (protocol: string, host: string | undefined) => (host == 'uber-lift.herokuapp.com' ? 'https' : protocol) + '://' + (host || 'localhost')
export const getAuthUrl = (protocol: string, host: string | undefined, relRedirect: string) => {
    return 'https://login.uber.com/oauth/v2/authorize?response_type=code'
        + '&client_id=' + clientId
        + '&scope=history+history_lite+profile'
        + '&redirect_uri=' + getAuthority(protocol, host) + relRedirect // http://localhost:3000'
}
export const getBearer = (clientSecret: string, code: string, protocol: string, host: string | undefined, fBearer: Action1<string>) => {
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
    }, function (_: any, res: Response, body: string) {
        console.log('yay response?' + typeof body)
        const jBody = JSON.parse(body);
        if (jBody.error) {
            throw jBody.error
        } else if (jBody.access_token) {
            fBearer(jBody.access_token);
        }
    })
}
export const getFromUber = (bearer: string, uri: string, f: Action1<any>) => {
    if (bearer == null)
        throw ('no bearer for uri ' + uri)
    console.log("fetching" + uri)
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri,
        method: 'GET'
    }, (err: any, _: any, body: string | undefined) => {
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

export async function* getFullHistory(bearer: string) {
    var pulled = 0;
    var result: HistoryData = await getHistory(bearer, 0);
    pulled += result.history.length;
    yield result;
    var errored = false
    while (pulled < result.count && !errored) {
        result = await getHistory(bearer, pulled);
        pulled += result.history.length;
        yield result;
    }
}
export const getHistory = (bearer: string, offset: number): Promise<HistoryData> => {
    console.log('fetching fresh history')
    return new Promise((resolve, reject) => {
        request({
            headers: { Authorization: 'Bearer ' + bearer },
            uri: 'https://api.uber.com/v1.2/history' + (offset > 0 ? '?offset=' + offset : ''),
            method: 'GET'
        }, (err: any, _: any, body: string | undefined) => {
            if (err != null) {
                var e = JSON.stringify(err)
                console.error(e)
                return reject(e)
            }
            if (body == null) return reject('getHistory no body')
            const jBody: HistoryData = JSON.parse(body)
            return resolve(jBody)
        })

    })
}
export const getMe = (bearer: string, f: Action2<UberProfile, boolean>) => {
    exports.getFromUber(bearer, 'https://api.uber.com/v1.2/me', (me: UberProfile) => {
        console.log('me', me)
        // any schema validation goes here
        // yes double ! is ugly, but it makes typescript happy
        const isFullProfile: boolean = (!(!me.rider_id)) && Object.keys(me).indexOf('mobile_verified') >= 0 as boolean;
        if (!isFullProfile) console.error('scope request does not include profile')
        return f.call(null, me, isFullProfile)
    })

}
