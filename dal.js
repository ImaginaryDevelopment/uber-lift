"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// import * as mongoose from 'mongoose'
const mongoose = require('mongoose');
const util = require('util');
const schemas = {};
const getOrCreateSchema = (name, schema) => {
    if (schemas[name]) {
        console.log('schema ' + name + ' is already created');
        return schemas[name];
    }
    if (schema == null) {
        console.log('schema not found and none was provided:' + name);
        return undefined;
    }
    // console.log('model?',name,schema && schema.constructor && schema.constructor.collection && schema.constructor.collection.name)
    const s = new mongoose_1.Schema(schema);
    const M = mongoose.model(name, s);
    const val = { name, s, M };
    schemas[name] = val;
    console.log('created schema/model for ' + name);
    return val;
};
getOrCreateSchema('Profile', {
    picture: String,
    first_name: String,
    last_name: String,
    promo_code: String,
    rider_id: String,
    email: String,
    mobile_verified: Boolean,
    uuid: String
});
getOrCreateSchema('History', {
    uuid: String,
    history: {
        status: String,
        distance: Number,
        product_id: String,
        start_time: Number,
        start_city: {
            latitude: Number,
            display_name: String,
            longitude: Number,
        },
        end_time: Number,
        request_id: String,
        request_time: Number
    }
});
const connect = (fConn) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            // returns a promise of a connection
            const connectResult = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true });
            mongoose.connection.once('open', () => {
                console.log('connection is open');
                const fConnResult = fConn(mongoose.connection);
                resolve(fConnResult);
            });
        }
        catch (e) {
            reject(e);
        }
    });
});
var Kittens;
(function (Kittens) {
    Kittens.storeKitten = () => {
        connect(() => __awaiter(this, void 0, void 0, function* () {
            const Cat = getOrCreateSchema('Cat', { name: String }).M;
            const kitty = new Cat({ name: 'Zildjian' });
            kitty.save().then(() => console.log('meow'));
        }));
    };
    Kittens.getKittens = (fCallMeMaybe) => {
        connect(() => __awaiter(this, void 0, void 0, function* () {
            const Cat = getOrCreateSchema('Cat', { name: String }).M;
            Cat.find((err, kittens) => {
                if (err)
                    return console.error(err);
                fCallMeMaybe(kittens);
            });
        }));
    };
})(Kittens = exports.Kittens || (exports.Kittens = {}));
const saveOne = (name, schema, props) => (f) => {
    const M = getOrCreateSchema(name, schema).M;
    const m = new M(props);
    m.save(function (err, mSaved) {
        if (err)
            throw err;
        f(mSaved);
    });
};
const find = (name, filter) => (f) => {
    const schemaOpt = schemas[name];
    if (schemaOpt == null)
        return f(null);
    const M = schemaOpt.M;
    M.find(filter, f);
};
const getAll = (name, schema) => (f) => {
    const M = getOrCreateSchema(name, schema).M;
    const findPromise = M.find({}, name);
    findPromise.then((items) => {
        f(items);
    });
};
var Profiles;
(function (Profiles) {
    Profiles.getProfiles = (f) => __awaiter(this, void 0, void 0, function* () {
        yield connect(() => __awaiter(this, void 0, void 0, function* () {
            console.log('gettingSchema');
            const { name, s } = schemas["Profile"];
            console.log('obtained');
            const fAll = getAll(name, s);
            console.log('delegate created');
            yield fAll(f);
        }));
    });
    Profiles.saveProfile = (profile, f) => __awaiter(this, void 0, void 0, function* () {
        yield connect(() => __awaiter(this, void 0, void 0, function* () {
            console.log('saveProfile:connected');
            const filter = { uuid: profile.uuid };
            const m = schemas['Profile'];
            if (m == null)
                throw 'up profile should be populated';
            const dbProfile = yield m.M.findOne(filter);
            console.log('saveProfile:awaited?');
            if (dbProfile != null) {
                Object.keys(profile).map((k) => dbProfile[k] = profile[k]);
                dbProfile.save((err, _) => __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        throw err;
                    yield f(dbProfile);
                }));
            }
            else {
                const x = new m.M(profile);
                return x.save(function (err, _) {
                    if (err)
                        throw err;
                    return f(x);
                });
            }
        }));
    });
})(Profiles = exports.Profiles || (exports.Profiles = {}));
var Histories;
(function (Histories) {
    Histories.getHistory = (uuid) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield connect(() => __awaiter(this, void 0, void 0, function* () {
                    // const filter = { uuid: uuid }
                    const filter = { uuid };
                    const m = schemas.History;
                    const findOneResult = m.M.findOne(filter);
                    const result = yield Promise.resolve(findOneResult);
                    resolve(result);
                }));
            }
            catch (e) {
                reject(e);
            }
        }));
    });
    Histories.saveHistory = (history) => __awaiter(this, void 0, void 0, function* () {
        yield connect(() => __awaiter(this, void 0, void 0, function* () {
            const filter = { uuid: history.uuid };
            const m = schemas.History;
            const findOneResult = m.M.findOne(filter);
            if (findOneResult && findOneResult.then)
                console.error('findOneResult is a promise');
            const dbHistory = yield Promise.resolve(findOneResult);
            if (dbHistory != null) {
                console.log('updating history');
                Object.keys(history).map(k => dbHistory[k] = history[k]);
                dbHistory.save((err, documentHistory, numRows) => console.log('updated history', documentHistory));
            }
            else {
                console.log('inserting history');
                const x = new m.M(history);
                x.save((err, documentHistory, numRows) => console.log('inserted history', documentHistory));
            }
            console.log('done waiting for saveHistory findOne');
            return history;
        }));
    });
})(Histories = exports.Histories || (exports.Histories = {}));
// exports.model = (name,schema) => f =>{
//     const s = new mongoose.Schema(schema)
//     const M = mongoose.model(name,s)
// }
