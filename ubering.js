"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require('querystring');
const request = require('request');
const clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz';
const getAuthority = (protocol, host) => (host == 'uber-lift.herokuapp.com' ? 'https' : protocol) + '://' + (host || 'localhost');
exports.getAuthUrl = (protocol, host, relRedirect) => {
    return 'https://login.uber.com/oauth/v2/authorize?response_type=code'
        + '&client_id=' + clientId
        + '&scope=history+history_lite+profile'
        + '&redirect_uri=' + getAuthority(protocol, host) + relRedirect; // http://localhost:3000'
};
exports.getBearer = (clientSecret, code, protocol, host, fBearer) => {
    const form = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: getAuthority(protocol, host)
    };
    const formData = querystring.stringify(form);
    // reference: https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
    request({
        headers: { 'Content-Length': formData.length, 'Content-Type': 'application/x-www-form-urlencoded' },
        uri: 'https://login.uber.com/oauth/v2/token',
        body: formData,
        method: 'POST'
    }, function (_, res, body) {
        console.log('yay response?' + typeof body);
        const jBody = JSON.parse(body);
        if (jBody.error) {
            throw jBody.error;
        }
        else if (jBody.access_token) {
            fBearer(jBody.access_token);
        }
    });
};
exports.getFromUber = (bearer, uri, f) => {
    if (bearer == null)
        throw ('no bearer for uri ' + uri);
    console.log("fetching" + uri);
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri,
        method: 'GET'
    }, (err, _, body) => {
        if (err != null) {
            console.error(JSON.stringify(err));
            throw ('getFromUber body:' + body);
        }
        if (body == null)
            throw 'getFromUber no body';
        const jBody = JSON.parse(body);
        // console.log('mybody', jBody, body)
        f(jBody);
    });
};
function getFullHistory(bearer) {
    return __asyncGenerator(this, arguments, function* getFullHistory_1() {
        var pulled = 0;
        var result = yield __await(exports.getHistory(bearer, 0));
        pulled += result.history.length;
        yield yield __await(result);
        var errored = false;
        while (pulled < result.count && !errored) {
            result = yield __await(exports.getHistory(bearer, pulled));
            pulled += result.history.length;
            yield yield __await(result);
        }
    });
}
exports.getFullHistory = getFullHistory;
exports.getHistory = (bearer, offset) => {
    console.log('fetching fresh history');
    return new Promise((resolve, reject) => {
        request({
            headers: { Authorization: 'Bearer ' + bearer },
            uri: 'https://api.uber.com/v1.2/history' + (offset > 0 ? '?offset=' + offset : ''),
            method: 'GET'
        }, (err, _, body) => {
            if (err != null) {
                var e = JSON.stringify(err);
                console.error(e);
                return reject(e);
            }
            if (body == null)
                return reject('getHistory no body');
            const jBody = JSON.parse(body);
            return resolve(jBody);
        });
    });
};
exports.getMe = (bearer, f) => {
    exports.getFromUber(bearer, 'https://api.uber.com/v1.2/me', (me) => {
        console.log('me', me);
        // any schema validation goes here
        // yes double ! is ugly, but it makes typescript happy
        const isFullProfile = (!(!me.rider_id)) && Object.keys(me).indexOf('mobile_verified') >= 0;
        if (!isFullProfile)
            console.error('scope request does not include profile');
        return f.call(null, me, isFullProfile);
    });
};
