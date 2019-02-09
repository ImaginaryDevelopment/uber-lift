const util = require('util')
const mongoose = require('mongoose')
// name -> Model
const schemas = {
}

const getOrCreateSchema = (name, schema) => {
    if (schemas[name]) {
        console.log('schema ' + name + ' is already created')
        return schemas[name]
    }
    if (schema == null) {
        console.log('schema not found and none was provided:' + name)
        return null
    }
    // console.log('model?',name,schema && schema.constructor && schema.constructor.collection && schema.constructor.collection.name)
    const s = new mongoose.Schema(schema)
    const M = mongoose.model(name, s)
    const val = { name, s, M }
    schemas[name] = val
    console.log('created schema/model for ' + name)
    return val
}
getOrCreateSchema('Profile', {
    picture: String,
    first_name: String,
    last_name: String,
    promo_code: String,
    rider_id: String,
    email: String,
    mobile_verified: Boolean,
    uuid: String
})
getOrCreateSchema('History',{
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
})

exports.connect = fConn => {
    // returns a promise of a connection
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true })
    const db = mongoose.connection
    db.once('open', () => {
        fConn(db)
    })
}

exports.storeKitten = () => {
    exports.connect(() => {
        const Cat = getOrCreateSchema('Cat', { name: String }).M
        const kitty = new Cat({ name: 'Zildjian' })
        kitty.save().then(() => console.log('meow'))
    })
}

exports.getKittens = fCallMeMaybe => {
    exports.connect(() => {
        const Cat = getOrCreateSchema('Cat', { name: String }).M
        Cat.find((err, kittens) => {
            if (err) return console.error(err)
            fCallMeMaybe(kittens)
        })
    })
}

saveOne = (name, schema, props) => f => {
    const M = getOrCreateSchema(name, schema).M
    const m = new M(props)
    m.save(function (err, mSaved) {
        if (err) throw err
        f(mSaved)
    })
}
find = (name, filter) => f => {
    const M = getOrCreateSchema(name, schema).M
    M.find(filter, f)
}
getAll = (name, schema) => f => {
    const M = getOrCreateSchema(name, schema).M
    M.find({}, name).then(function (users) {
        f(users)
    })
}
exports.getProfiles = f => {
    exports.connect(() => {
        console.log('gettingSchema')
        const { name, s } = getOrCreateSchema("Profile")
        console.log('obtained')
        const fAll = getAll(name, s)
        console.log('delegate created')
        fAll(f)
    })
}
exports.getHistory = (uuid, f) => {
    exports.connect(async () => {
        const filter = {uuid:uuid}
        const {name,s} = getOrCreateSchema("History")
        const fAll = getAll(name,s)
        fAll(f)
    })
}
exports.saveProfile = (profile, f) => {
    exports.connect(async () => {
        console.log('saveProfile:connected')
        const filter = { uuid: profile.uuid }
        const m = getOrCreateSchema('Profile')
        const dbProfile = await m.M.findOne(filter)
        console.log('saveProfile:awaited?')
        if (dbProfile != null) {
            Object.keys(profile).map(k => dbProfile[k] = profile[k])
            dbProfile.save(function (err, _) {
                if (err) throw err
                f(dbProfile)
            })
        } else {
            const x = new m.M(profile)
            x.save(function (err, _) {
                if (err) throw err
                f(x)
            })
        }
    })
}
// exports.model = (name,schema) => f =>{
//     const s = new mongoose.Schema(schema)
//     const M = mongoose.model(name,s)


// }