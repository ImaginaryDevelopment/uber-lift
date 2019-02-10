"use strict";
var querystring = require('querystring');
var request = require('request');
var clientId = process.env.clientid || 'SbTAG12Fz26uhgNZ6qAxxBTiqabpLKlz';
var getAuthority = function (protocol, host) { return (host == 'uber-lift.herokuapp.com' ? 'https' : protocol) + '://' + host; };
var getAuthUrl = function (protocol, host, relRedirect) {
    return 'https://login.uber.com/oauth/v2/authorize?response_type=code'
        + '&client_id=' + clientId
        + '&scope=history+history_lite+profile'
        + '&redirect_uri=' + getAuthority(protocol, host) + relRedirect;
}; // http://localhost:3000'
exports.getAuthUrl = getAuthUrl;
exports.getBearer = function (clientSecret, code, protocol, host, fBearer) {
    var form = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: getAuthority(protocol, host)
    };
    var formData = querystring.stringify(form);
    // reference: https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
    request({
        headers: { 'Content-Length': formData.length, 'Content-Type': 'application/x-www-form-urlencoded' },
        uri: 'https://login.uber.com/oauth/v2/token',
        body: formData,
        method: 'POST'
    }, function (_, res, body) {
        console.log('yay response?' + typeof body);
        var jBody = JSON.parse(body);
        if (jBody.error) {
            throw jBody.error;
        }
        else if (jBody.access_token) {
            fBearer(jBody.access_token);
        }
    });
};
exports.getFromUber = function (bearer, uri, f) {
    if (bearer == null)
        throw ('no bearer for uri ' + uri);
    console.log("fetching" + uri);
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri: uri,
        method: 'GET'
    }, function (err, _, body) {
        if (err != null) {
            console.error(JSON.stringify(err));
            throw ('getFromUber body:' + body);
        }
        if (body == null)
            throw 'getFromUber no body';
        var jBody = JSON.parse(body);
        // console.log('mybody', jBody, body)
        f(jBody);
    });
};
exports.getHistory = function (bearer, fHistory) {
    console.log('fetching fresh history');
    request({
        headers: { Authorization: 'Bearer ' + bearer },
        uri: 'https://api.uber.com/v1.2/history',
        method: 'GET'
    }, function (err, _, body) {
        if (err != null) {
            var e = JSON.stringify(err);
            console.error(e);
            throw e;
        }
        if (body == null)
            throw 'getHistory no body';
        var jBody = JSON.parse(body);
        fHistory(jBody);
    });
};
exports.getMe = function (bearer, f) {
    exports.getFromUber(bearer, 'https://api.uber.com/v1.2/me', function (me) {
        console.log('me', me);
        // any schema validation goes here
        // yes double ! is ugly, but it makes typescript happy
        var isFullProfile = (!(!me.rider_id)) && Object.keys(me).indexOf('mobile_verified') >= 0;
        if (!isFullProfile)
            console.error('scope request does not include profile');
        return f.call(null, me, isFullProfile);
    });
};
