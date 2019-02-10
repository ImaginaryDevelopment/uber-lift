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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose = __importStar(require("mongoose"));
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
    status: String,
    distance: Number,
    product_id: String,
    start_time: Number,
    start_city: {
        latitude: Number,
        display_name: String,
        longitude: Number
    }
});
const connect = (fConn) => {
    // returns a promise of a connection
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true });
    const db = mongoose.connection;
    db.once('open', () => {
        fConn(db);
    });
};
var Kittens;
(function (Kittens) {
    Kittens.storeKitten = () => {
        connect(() => {
            const Cat = getOrCreateSchema('Cat', { name: String }).M;
            const kitty = new Cat({ name: 'Zildjian' });
            kitty.save().then(() => console.log('meow'));
        });
    };
    Kittens.getKittens = (fCallMeMaybe) => {
        connect(() => {
            const Cat = getOrCreateSchema('Cat', { name: String }).M;
            Cat.find((err, kittens) => {
                if (err)
                    return console.error(err);
                fCallMeMaybe(kittens);
            });
        });
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
    Profiles.getProfiles = (f) => {
        connect(() => {
            console.log('gettingSchema');
            const { name, s } = schemas["Profile"];
            console.log('obtained');
            const fAll = getAll(name, s);
            console.log('delegate created');
            fAll(f);
        });
    };
    Profiles.saveProfile = (profile, f) => {
        connect(() => __awaiter(this, void 0, void 0, function* () {
            console.log('saveProfile:connected');
            const filter = { uuid: profile.uuid };
            const m = schemas['Profile'];
            if (m == null)
                throw 'up profile should be populated';
            const dbProfile = yield m.M.findOne(filter);
            console.log('saveProfile:awaited?');
            if (dbProfile != null) {
                Object.keys(profile).map((k) => dbProfile[k] = profile[k]);
                dbProfile.save(function (err, _) {
                    if (err)
                        throw err;
                    f(dbProfile);
                });
            }
            else {
                const x = new m.M(profile);
                x.save(function (err, _) {
                    if (err)
                        throw err;
                    f(x);
                });
            }
        }));
    };
})(Profiles = exports.Profiles || (exports.Profiles = {}));
var Histories;
(function (Histories) {
    Histories.getHistory = (uuid, f) => {
        connect(() => {
            // const filter = { uuid: uuid }
            const { name, s } = schemas["History"];
            const fAll = getAll(name, s);
            fAll(f);
        });
    };
    Histories.saveHistory = (profile, f) => {
        connect(() => __awaiter(this, void 0, void 0, function* () {
        }));
    };
})(Histories = exports.Histories || (exports.Histories = {}));
// exports.model = (name,schema) => f =>{
//     const s = new mongoose.Schema(schema)
//     const M = mongoose.model(name,s)
// }
