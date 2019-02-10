
declare var global:any;
declare var module:any;
// declare var window:any;
type Action = () => void;
type AnyAction = (...rest:any[]) => void;
type Action1<T> = (x:T) => void;
type Action2<T,T2> = (x:T, y:T2) => void;
type Func<T> = () => T;
type Func1<T,T2> = (x:T) => T2
type Uri=string

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
    uuid: string
}