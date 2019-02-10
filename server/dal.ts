import { Schema, Model, SchemaDefinition, Document } from 'mongoose'
import * as mongoose from 'mongoose'
const util = require('util')

// name -> Model
interface ModelWrapper<T extends Document> { name: string, s: SchemaDefinition, M: Model<T> }
const schemas: IDictionary<ModelWrapper<any>> = {
}

const getOrCreateSchema = <T extends Document>(name: string, schema: SchemaDefinition):ModelWrapper<T>|undefined => {
    if (schemas[name]) {
        console.log('schema ' + name + ' is already created')
        return schemas[name] as ModelWrapper<T>
    }
    if (schema == null) {
        console.log('schema not found and none was provided:' + name)
        return undefined
    }
    // console.log('model?',name,schema && schema.constructor && schema.constructor.collection && schema.constructor.collection.name)
    const s = new Schema(schema)
    const M:Model<T> = mongoose.model(name, s)
    const val:ModelWrapper<T> = { name, s, M }
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
})

const connect = (fConn:Action1<mongoose.Connection>) => {
    // returns a promise of a connection
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true })
    const db = mongoose.connection
    db.once('open', () => {
        fConn(db)
    })
}
export module Kittens {
    export const storeKitten = () => {
        connect(() => {
            const Cat = getOrCreateSchema('Cat', { name: String })!.M
            const kitty = new Cat({ name: 'Zildjian' })
            kitty.save().then(() => console.log('meow'))
        })
    }

    export const getKittens = (fCallMeMaybe:Action1<Document[]>) => {
        connect(() => {
            const Cat = getOrCreateSchema('Cat', { name: String })!.M
            Cat.find((err, kittens) => {
                if (err) return console.error(err)
                fCallMeMaybe(kittens)
            })
        })
    }

}

const saveOne = (name:string, schema: SchemaDefinition, props: any) => (f:ActionAny) => {
    const M = getOrCreateSchema(name, schema)!.M
    const m = new M(props)
    m.save(function (err, mSaved) {
        if (err) throw err
        f(mSaved)
    })
}
const find = (name: string, filter: any) => (f: ActionAny) => {
    const schemaOpt = schemas[name]
    if (schemaOpt == null) return f(null)
    const M = schemaOpt.M
    M.find(filter, f)
}

const getAll = <T extends Document>(name: string, schema: SchemaDefinition) => (f: Action1<T[]> | ActionAny) => {
    const M = getOrCreateSchema(name, schema)!.M
    const findPromise = M.find({}, name)
    findPromise.then((items: any) => {
        f(items)
    })
}
export module Profiles {
    export const getProfiles = (f: Action1<UberProfile[]>) => {
        connect(() => {
            console.log('gettingSchema')
            const { name, s } = schemas["Profile"]!
            console.log('obtained')
            const fAll:Action1<Action1<UberProfile[]>>= getAll(name, s)
            console.log('delegate created')
            fAll(f)
        })
    }
    export const saveProfile = (profile:UberProfile, f:Action1<UberProfile>) => {
        connect(async () => {
            console.log('saveProfile:connected')
            const filter = { uuid: profile.uuid }
            const m = schemas['Profile']
            if(m == null) throw 'up profile should be populated'
            const dbProfile = await m.M.findOne(filter)
            console.log('saveProfile:awaited?')
            if (dbProfile != null) {
                Object.keys(profile).map((k:keyof UberProfile) => dbProfile[k] = profile[k])
                dbProfile.save(function (err:any, _:any) {
                    if (err) throw err
                    f(dbProfile)
                })
            } else {
                const x = new m.M(profile)
                x.save(function (err:any, _:any) {
                    if (err) throw err
                    f(x)
                })
            }
        })
    }
}
export module Histories {
    export const getHistory = (uuid:UberUserIdentifier, f:ActionAny) => {
        connect(() => {
            // const filter = { uuid: uuid }
            const { name, s } = schemas["History"]!
            const fAll = getAll(name, s)
            fAll(f)
        })
    }
    export const saveHistory = (profile,f) =>{
        connect(async() =>{



        })


    }
}
// exports.model = (name,schema) => f =>{
//     const s = new mongoose.Schema(schema)
//     const M = mongoose.model(name,s)


// }