import { Application, Response, Request } from "express";
import { RequestHandler, ErrorHandler } from "express/lib/router";
interface CookieRequest extends Request {
    cookies?: any;
}
const express = require('express')
const cookieParser = require('cookie-parser')
// const https = require('https')
const ubering = require('./ubering.js')
const fs = require('fs')
const clientSecret = process.env.ubersecret
const util = require('util')
const dal = require('./dal.js')
if (clientSecret == null)
    throw 'please set the ubersecret env variable to your client_secret'
const port = process.env.PORT || 3000;
const app: Application = express()
app.use(cookieParser())

const readFile = (relPath: string): Promise<string> =>
    new Promise((resolve, reject) =>
        fs.readFile(__dirname + relPath, 'utf8', (err: any, text: string) =>
            err != null ? reject(err) : resolve(text)
        ))

const errorHandler:ErrorHandler = (err, req, res: Response | undefined, _next, ...rest: any) => {
    if (!res || !res.status || !res.send)
        throw { Message: 'Inappropriate errorHandler call', err }
    if (err && err.stack && req && res) {
        console.error(err.stack)
        // log this to database in prod, not to customer
        return res.status(500).send('Error:' + util.inspect({ err, req, res }))
    }
    return res.status(500).send('Error' + util.inspect({ err, req, ...rest }))
}

const helloDbHandler:RequestHandler = (_, res) => {
    dal.storeKitten()
    res.send('yay db!')
}
const indexHandler:RequestHandler = (req: CookieRequest, res,next) => {
    if (req.cookies != null && req.cookies.bearer != null) {
        return res.redirect('/home')
    }
    if (req.query.code == null) {
        Promise.all([readFile('/public/index.html'), readFile('/public/menu.html')])
            .then(([html, menuHtml]) => {
                console.log('indexing', req.headers.host)
                res.send(
                    html
                        .replace('@nav', menuHtml)
                        .replace('@authUrl', ubering.getAuthUrl(req.protocol, req.headers.host, '')))
            })
            .catch(e => errorHandler(e, req, res, next))
    } else {
        console.log('ubering!')
        ubering.getBearer(clientSecret, req.query.code, req.protocol, req.headers.host,
            (bearer:string) => {
                res.cookie('bearer', bearer)
                res.redirect('/home')
            })
    }
}
const historyUrl = '/history/refresh'

const getTableHtml = (me: UberProfile, history: HistoryData, f: (Func1<string, any>), allowRefresh: boolean) =>
    Promise.all([readFile('/public/table.html'), readFile('/public/menu.html')])
        .then(([html, menuHtml]) => {
            const data = JSON.stringify(history)
            const pro = JSON.stringify(me)
            const output: string =
                html
                    .replace('@nav', menuHtml)
                    .replace("data = null", 'data = ' + data)
                    .replace("me = null", 'me = ' + pro)
                    .replace("historyUrl = null", allowRefresh ? 'historyUrl = \'' + historyUrl + '\'' : 'historyUrl = null')
            return f(output)
        })
const homeHandler:RequestHandler= (req:CookieRequest, res:Response) => {
    if (req.cookies == null || req.cookies.bearer == null) return res.redirect('/')
    // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
    const send = (x: any) => res.send(x)
    const bearer = req.cookies.bearer
    ubering.getMe(bearer, (me: UberProfile, _isFull: boolean) => {
        dal.saveProfile(me, () => {
            dal.getHistory(me.uuid, function (item: HistoryData) {
                if (item == null) {
                    console.log('history not found in db')
                    ubering.getHistory(bearer, (history:HistoryData) => {
                        dal.saveHistory(history, () => {
                            return getTableHtml(me, history, send, true)
                        })
                    })
                } else {
                    console.log('history found in db')
                    getTableHtml(me, item, send, true)
                }
            })
        })
    })
}

app.get('/', indexHandler as RequestHandler)
app.use(express.static('client'))
app.use(express.static('public', ['html', 'htm', 'json']))
app.get('*', (req:Request, _:any, next:Action) => { console.log('Request for ' + req.url); next() })
app.get('/hello', (_req:any, res:Response) => res.send('Hello World!'))
app.get('/home', homeHandler)
app.get(historyUrl, ((req:CookieRequest, res:Response) => {
    const bearer = req.cookies.bearer
    if (bearer == null) return res.send('No bearer cookie found')
    ubering.getHistory(bearer, (history:HistoryData) => {
        console.log("refreshing history")
        res.send(history)
    })
}) as any )
app.get('/history/sample/raw', (_:Request, res:Response) => res.sendfile(__dirname + '/public/samplehistory.json'))
app.get('/history/sample/table', (_:Request, res:Response) => {
    Promise.all([readFile('/public/sampleuser.json'), readFile('/public/samplehistory.json')])
        .then(([me, history]) => {

            // necessary https://stackoverflow.com/questions/41801723/express-js-cannot-read-property-req-of-undefined
            const send = (x:any) => res.send(x)
            getTableHtml(JSON.parse(me), JSON.parse(history), send, false)
        })
})

app.get('/db/hello', helloDbHandler)
app.get('/db/fetch', (_:Request, res:Response) => {
    dal.getKittens((k:any) => res.send(k))
})
app.get('/db/profiles', (_:Request, res:Response) => {
    dal.getProfiles((profiles:UberProfile[]) => {
        res.send(profiles)
    }
    )
})
app.get('/markers', (_req:any, res:Response) => res.sendFile(__dirname + '/public/markers.html'))
// express error-handling: https://expressjs.com/en/guide/error-handling.html
app.use(errorHandler)
app.listen(port, () => console.log("Example app listening on port " + port))
