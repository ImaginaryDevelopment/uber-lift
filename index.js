"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// translation failed
const express = require('express');
const cookieParser = require('cookie-parser');
const ubering = __importStar(require("./ubering"));
const fs_1 = __importDefault(require("fs"));
const clientSecret = process.env.ubersecret;
const util = require('util');
const dal = __importStar(require("./dal"));
if (clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret';
const port = process.env.PORT || 3000;
const app = express();
app.use(cookieParser());
const readFile = (relPath) => new Promise((resolve, reject) => fs_1.default.readFile(__dirname + relPath, 'utf8', (err, text) => err != null ? reject(err) : resolve(text)));
const errorHandler = (err, req, res, _next, ...rest) => {
    if (!res || !res.status || !res.send)
        throw { Message: 'Inappropriate errorHandler call', err };
    if (err && err.stack && req && res) {
        console.error(err.stack);
        // log this to database in prod, not to customer
        return res.status(500).send('Error:' + util.inspect({ err, req, res }));
    }
    return res.status(500).send('Error' + util.inspect(Object.assign({ err, req }, rest)));
};
const helloDbHandler = (_, res) => {
    dal.Kittens.storeKitten();
    res.send('yay db!');
};
const indexHandler = (req, res, next) => {
    if (req.cookies != null && req.cookies.bearer != null) {
        return res.redirect('/home');
    }
    if (req.query.code == null) {
        Promise.all([readFile('/public/index.html'), readFile('/public/menu.html')])
            .then(([html, menuHtml]) => {
            console.log('indexing', req.headers.host);
            res.send(html
                .replace('@nav', menuHtml)
                .replace('@authUrl', ubering.getAuthUrl(req.protocol, req.headers.host, '')));
        })
            .catch(e => errorHandler(e, req, res, next));
    }
    else {
        console.log('ubering!');
        ubering.getBearer(clientSecret, req.query.code, req.protocol, req.headers.host, (bearer) => {
            res.cookie('bearer', bearer);
            res.redirect('/home');
        });
    }
};
const historyUrl = '/history/refresh';
const getTableHtml = (me, history, f, allowRefresh) => Promise.all([readFile('/public/table.html'), readFile('/public/menu.html')])
    .then(([html, menuHtml]) => {
    const data = JSON.stringify(history);
    const pro = JSON.stringify(me);
    const output = html
        .replace('@nav', menuHtml)
        .replace("data = null", 'data = ' + data)
        .replace("me = null", 'me = ' + pro)
        .replace("historyUrl = null", allowRefresh ? 'historyUrl = \'' + historyUrl + '\'' : 'historyUrl = null');
    return f(output);
});
const homeHandler = (req, res) => {
    if (req.cookies == null || req.cookies.bearer == null)
        return res.redirect('/');
    // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
    const send = (x) => res.send(x);
    const bearer = req.cookies.bearer;
    ubering.getMe(bearer, (me, _isFull) => __awaiter(this, void 0, void 0, function* () {
        yield dal.Profiles.saveProfile(me, () => __awaiter(this, void 0, void 0, function* () {
            yield dal.Histories.getHistory(me.uuid, function (item) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('dal.getHistory callback');
                    if (item == null || item == [] || item.history == null) {
                        console.log('history not found in db');
                        ubering.getHistory(bearer, (history) => {
                            console.log('ubering.getHistory callback');
                            dal.Histories.saveHistory(me.uuid, history, () => __awaiter(this, void 0, void 0, function* () {
                                return yield getTableHtml(me, history, send, true);
                            }));
                        });
                    }
                    else {
                        console.log('history found in db', util.inspect(item), item);
                        yield getTableHtml(me, item, send, true);
                    }
                });
            });
        }));
    }));
};
app.get('/', indexHandler);
app.use(express.static('client'));
app.use(express.static('public', ['html', 'htm', 'json']));
app.get('*', (req, _, next) => { console.log('Request for ' + req.url); next(); });
app.get('/hello', (_req, res) => res.send('Hello World!'));
app.get('/home', homeHandler);
app.get(historyUrl, ((req, res) => {
    const bearer = req.cookies.bearer;
    if (bearer == null)
        return res.send('No bearer cookie found');
    ubering.getHistory(bearer, (history) => {
        console.log("refreshing history");
        res.send(history);
    });
}));
app.get('/history/sample/raw', (_, res) => res.sendfile(__dirname + '/public/samplehistory.json'));
app.get('/history/sample/table', (_, res) => {
    Promise.all([readFile('/public/sampleuser.json'), readFile('/public/samplehistory.json')])
        .then(([me, history]) => {
        // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
        const send = (x) => res.send(x);
        getTableHtml(JSON.parse(me), JSON.parse(history), send, false);
    });
});
app.get('/db/hello', helloDbHandler);
app.get('/db/fetch', (_, res) => {
    dal.Kittens.getKittens((k) => res.send(k));
});
app.get('/db/profiles', (_, res) => {
    dal.Profiles.getProfiles((profiles) => __awaiter(this, void 0, void 0, function* () {
        res.send(profiles);
    }));
});
app.get('/markers', (_req, res) => res.sendFile(__dirname + '/public/markers.html'));
// express error-handling: https://expressjs.com/en/guide/error-handling.html
app.use(errorHandler);
app.listen(port, () => console.log("Example app listening on port " + port));
