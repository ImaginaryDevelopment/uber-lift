"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var cookieParser = require('cookie-parser');
// const https = require('https')
var ubering = require('./ubering.js');
var fs = require('fs');
var clientSecret = process.env.ubersecret;
var util = require('util');
var dal = require('./dal.js');
if (clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret';
var port = process.env.PORT || 3000;
var app = express();
app.use(cookieParser());
var readFile = function (relPath) {
    return new Promise(function (resolve, reject) {
        return fs.readFile(__dirname + relPath, 'utf8', function (err, text) {
            return err != null ? reject(err) : resolve(text);
        });
    });
};
var errorHandler = function (err, req, res, _next) {
    var rest = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        rest[_i - 4] = arguments[_i];
    }
    if (!res || !res.status || !res.send)
        throw { Message: 'Inappropriate errorHandler call', err: err };
    if (err && err.stack && req && res) {
        console.error(err.stack);
        // log this to database in prod, not to customer
        return res.status(500).send('Error:' + util.inspect({ err: err, req: req, res: res }));
    }
    return res.status(500).send('Error' + util.inspect(__assign({ err: err, req: req }, rest)));
};
var helloDbHandler = function (_, res) {
    dal.storeKitten();
    res.send('yay db!');
};
var indexHandler = function (req, res, next) {
    if (req.cookies != null && req.cookies.bearer != null) {
        return res.redirect('/home');
    }
    if (req.query.code == null) {
        Promise.all([readFile('/public/index.html'), readFile('/public/menu.html')])
            .then(function (_a) {
            var html = _a[0], menuHtml = _a[1];
            console.log('indexing', req.headers.host);
            res.send(html
                .replace('@nav', menuHtml)
                .replace('@authUrl', ubering.getAuthUrl(req.protocol, req.headers.host, '')));
        })
            .catch(function (e) { return errorHandler(e, req, res, next); });
    }
    else {
        console.log('ubering!');
        ubering.getBearer(clientSecret, req.query.code, req.protocol, req.headers.host, function (bearer) {
            res.cookie('bearer', bearer);
            res.redirect('/home');
        });
    }
};
var historyUrl = '/history/refresh';
var getTableHtml = function (me, history, f, allowRefresh) {
    return Promise.all([readFile('/public/table.html'), readFile('/public/menu.html')])
        .then(function (_a) {
        var html = _a[0], menuHtml = _a[1];
        var data = JSON.stringify(history);
        var pro = JSON.stringify(me);
        var output = html
            .replace('@nav', menuHtml)
            .replace("data = null", 'data = ' + data)
            .replace("me = null", 'me = ' + pro)
            .replace("historyUrl = null", allowRefresh ? 'historyUrl = \'' + historyUrl + '\'' : 'historyUrl = null');
        return f(output);
    });
};
var homeHandler = function (req, res) {
    if (req.cookies == null || req.cookies.bearer == null)
        return res.redirect('/');
    // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
    var send = function (x) { return res.send(x); };
    var bearer = req.cookies.bearer;
    ubering.getMe(bearer, function (me, _isFull) {
        dal.saveProfile(me, function () {
            dal.getHistory(me.uuid, function (item) {
                if (item == null) {
                    console.log('history not found in db');
                    ubering.getHistory(bearer, function (history) {
                        dal.saveHistory(history, function () {
                            return getTableHtml(me, history, send, true);
                        });
                    });
                }
                else {
                    console.log('history found in db');
                    getTableHtml(me, item, send, true);
                }
            });
        });
    });
};
app.get('/', indexHandler);
app.use(express.static('client'));
app.use(express.static('public', ['html', 'htm', 'json']));
app.get('*', function (req, _, next) { console.log('Request for ' + req.url); next(); });
app.get('/hello', function (_req, res) { return res.send('Hello World!'); });
app.get('/home', homeHandler);
app.get(historyUrl, (function (req, res) {
    var bearer = req.cookies.bearer;
    if (bearer == null)
        return res.send('No bearer cookie found');
    ubering.getHistory(bearer, function (history) {
        console.log("refreshing history");
        res.send(history);
    });
}));
app.get('/history/sample/raw', function (_, res) { return res.sendfile(__dirname + '/public/samplehistory.json'); });
app.get('/history/sample/table', function (_, res) {
    Promise.all([readFile('/public/sampleuser.json'), readFile('/public/samplehistory.json')])
        .then(function (_a) {
        var me = _a[0], history = _a[1];
        // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
        var send = function (x) { return res.send(x); };
        getTableHtml(JSON.parse(me), JSON.parse(history), send, false);
    });
});
app.get('/db/hello', helloDbHandler);
app.get('/db/fetch', function (_, res) {
    dal.getKittens(function (k) { return res.send(k); });
});
app.get('/db/profiles', function (_, res) {
    dal.getProfiles(function (profiles) {
        res.send(profiles);
    });
});
app.get('/markers', function (_req, res) { return res.sendFile(__dirname + '/public/markers.html'); });
// express error-handling: https://expressjs.com/en/guide/error-handling.html
app.use(errorHandler);
app.listen(port, function () { return console.log("Example app listening on port " + port); });
