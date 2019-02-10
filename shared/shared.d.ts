
declare var global:any;
declare var module:any;
// declare var window:any;
type Action = () => void;
type ActionAny = (...rest:any[]) => void;
type Action1<T> = (x:T) => void;
type Action2<T,T2> = (x:T, y:T2) => void;
type Func<T> = () => T;
type Func1<T,T2> = (x:T) => T2
type Uri=string
interface Choice1Of2<T> {
    kind:"Choice1Of2"
    value:T
}
interface Choice2Of2<T>{
    kind:"Choice2Of2"
    value:T
}

type ChoiceOf2<T1,T2> = Choice1Of2<T1> | Choice2Of2<T2>
type ChoiceOf3<T1,T2,T3> = {kind:"Choice1Of3",value:T1} | {kind:"Choice2Of3",value:T2} | {kind:"Choice3Of3", value:T3}

interface IDictionary<T>{
    [key:string]:T | undefined
}
type UberUserIdentifier = string
interface HistoryCity {
    latitude: number
    display_name: string
    longitude: number
}
interface HistoryItem {
    status: string
    distance: number
    product_id: string
    start_time: number
    start_city: HistoryCity
    end_time: number
    request_id: string
    request_time: number
}
interface HistoryData {
    count: number
    limit: number
    offset: number
    history: HistoryItem[]
}
interface UberProfile {
    picture: Uri
    first_name: string
    last_name: string
    promo_code: string
    rider_id: string
    email: string
    mobile_verified: boolean
    uuid: UberUserIdentifier
}
interface ObjectConstructor {
    keys<T>(x:T):(keyof T)[]
}