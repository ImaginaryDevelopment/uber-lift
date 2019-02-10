import { Schema, Model, SchemaDefinition, Document } from 'mongoose'
// import * as mongoose from 'mongoose'
const mongoose = require('mongoose')
import {Connection} from 'mongoose'
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

const connect = async (fConn:Func1<Connection,Promise<void>>) => {
    // returns a promise of a connection
    const connectResult:Promise<any> = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true })
    mongoose.connection.once('open', async () => {
        console.log('connection is open')
        const fConnResult = fConn(mongoose.connection)
        if(fConnResult == null || !fConnResult.then)
        console.error('fConnResult wasn\'t a promise this time')
        await fConnResult
    })
    await connectResult
    console.log('connect is over')
}
export module Kittens {
    export const storeKitten = () => {
        connect(async () => {
            const Cat = getOrCreateSchema('Cat', { name: String })!.M
            const kitty = new Cat({ name: 'Zildjian' })
            kitty.save().then(() => console.log('meow'))
        })
    }

    export const getKittens = (fCallMeMaybe:Action1<Document[]>) => {
        connect(async () => {
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
    export const getProfiles = async (f: Func1<UberProfile[],Promise<void>>) => {
        await connect(async () => {
            console.log('gettingSchema')
            const { name, s } = schemas["Profile"]!
            console.log('obtained')
            const fAll:Action1<Action1<UberProfile[]>>= getAll(name, s)
            console.log('delegate created')
            await fAll(f)
        })
    }
    export const saveProfile = async (profile:UberProfile, f:Func1<UberProfile,Promise<void>>) => {
        await connect(async () => {
            console.log('saveProfile:connected')
            const filter = { uuid: profile.uuid }
            const m = schemas['Profile']
            if(m == null) throw 'up profile should be populated'
            const dbProfile = await m.M.findOne(filter)
            console.log('saveProfile:awaited?')
            if (dbProfile != null) {
                Object.keys(profile).map((k:keyof UberProfile) => dbProfile[k] = profile[k])
                dbProfile.save(async (err:any, _:any) => {
                    if (err) throw err
                    await f(dbProfile)
                })
            } else {
                const x = new m.M(profile)
                return x.save(function (err:any, _:any) {
                    if (err) throw err
                    return f(x)
                })
            }
        })
    }
}
export module Histories {
    export const getHistory = async (uuid:UberUserIdentifier, f:Func1<any,Promise<void>>) => {
        await connect(async () => {
            // const filter = { uuid: uuid }
            const { name, s } = schemas["History"]!
            const fAll = getAll(name, s)
            console.log('about to fAll')
            const fAllResult:any = fAll(f)
            if(fAllResult && fAllResult.then)
                console.error('fAllResult was promise')
        })
    }
    export const saveHistory = async (uuid:UberUserIdentifier,history:HistoryData,f:Func1<any,Promise<void>>) =>{
        await connect(async() =>{
            const filter ={uuid}
            const m = schemas.History!
            const findOneResult:any = m.M.findOne(filter)
            if(findOneResult&&findOneResult.then)
                console.error('findOneResult is a promise')
            const dbHistory = await findOneResult
            console.log('done waiting for saveHistory findOne')
            await f(history)
        })


    }
}
// exports.model = (name,schema) => f =>{
//     const s = new mongoose.Schema(schema)
//     const M = mongoose.model(name,s)


// }