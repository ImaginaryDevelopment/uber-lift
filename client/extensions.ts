/* global global module window */
"use strict";
// for reference:
// http://stackoverflow.com/questions/37807779/what-is-the-difference-of-the-different-ways-of-importing-libraries-in-typescrip/37808633#37808633
// https://github.com/Microsoft/TypeScript/issues/2812
// https://github.com/Microsoft/TypeScript/issues/2709
// https://www.typescriptlang.org/docs/handbook/module-resolution.html
// http://stackoverflow.com/questions/12930049/how-do-i-import-other-typescript-files
/* testing */
type AddClassesFunction = (defaultClasses?:(string|null)[] , otherClasses?:string|string[]) => string;

type DebounceChangeDelegate = (callback:Action, e:any,...args:any[]) => void;

interface ArrayConstructor {
    from<T>(src:T[]):T[];
}

interface Array<T> {
    remove(item:T): T | undefined;
    replace(item:T, replacement:T):boolean;
    findIndex(x:(f:Func1<T,boolean>) => number,thisArg?:any): number
    // built-in for our browser at least
    includes(x:T):boolean;
}
// String['funcName'] = ...
interface StringConstructor {
    // this exists in my browser, maybe not all though
    trim(s:string):string;
    contains(s:string,delimiter:string): boolean;
}

interface String {
    contains(delimiter:string): boolean;
    before(delimiter:string): string;
    after(delimiter:string): string;
}
interface DateConstructor{
    today():Date;
    to_yyyyMMdd(x:any,sep?:string):string;
    to_MMddyyyy(x:any,sep?:string):string;
    addHours(dt:Date,h:number):void;
    isValidDate(dt:Date | undefined):boolean;
}
interface Date {
    addHours(hours:number):void;
    yyyyMMdd(separator?:string):string;
    MMddyyyy(separator?:string):string;
    toDateInputValue(this:Date):string;
}
interface Number{
    // formatMoney(c?:Number | any,d?,t?):string;
    formatMoney(c?:Number,decimalSeparator?:string,thousandsSeparator?:string):string;
}
// export module Extensions{

var findJsParent = () : any =>
    ((typeof module !== "undefined" && module && module.exports
        || typeof module !== "undefined" && module)
        || typeof global !== "undefined" && global
        || typeof window !== "undefined" && window
        );

type Guid = string

interface Location{
    href:Uri
}
interface Monad<T>{
    //unary return operation?
    new(x:T):Monad<T>
    // tupled form
    bind<TResult>(x:T,f:Func1<T,TResult>):Monad<TResult>
    // non-tupled form
    bind<TResult>(x:T):Func1<Func1<T,TResult>,Monad<TResult>>
}

type GetValidateClassesDelegate = (isValid?:string|boolean) => string[];

interface Extensions {
    findJsParent:Func<any>
    isDifferent(x:any,y:any):boolean
    // any used to be able to pretend a value returns where needed
    todo(title?:string):any
    guid():Guid
    clone<T>(x:T):T
    // why does this signature differ from the implementation?
    isDifferent<T>(x:T,y:T):boolean
    makePick<T, K extends keyof T>(key:K, value:T[K]):Pick<T,K>
    makePickFromObj:<T>() => <K extends keyof T>(value:Pick<T,K>) => Pick<T,K>
    nameof<T extends {}>(name: keyof T):keyof T;
    redirect(url:Uri, app:{location?:Location, document?:{location:Location}}):(never|void)
    inspect<T>(x:T,title?:string,propNames?:string|string[]) : T
    post(url:Uri, onLoad:Action1<ProgressEvent>,onFailure:Action1<ProgressEvent>, contentType:'application/x-www-form-urlencoded'|'application/json', data:object):void
    // there is a new ES5 method named fetch
    fetchB(url:Uri,onLoad:Action1<ProgressEvent>,onFailure:Action1<ProgressEvent>,method?:string):void
    fetchBT<T>(url:Uri,onLoad:Action1<T>,onFailure:Action1<ProgressEvent>,method?:string,onLoadFailure?:Action1<any>):void
    before(s:string,delimiter:string):string
    after(s:string,delimiter:string):string
    flattenArray<T>(a:T|T[],recurse?:boolean):T[]
    isDefined (o:any):boolean
    isPositive(x:number):boolean
    getValidateClasses:GetValidateClassesDelegate
    debounce(callback:((...args:any[]) => void), ms:number):void
    debounceChange: DebounceChangeDelegate
}
// prototypal extensions and polyfills
var addImpureExtensions = ():void => {
    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    // polyfill for older browsers, which this project really doesn't need
    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj:any) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result:any[] = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    String['trim'] = function(s:string):string{
        if(s != null)
            return s.trim();
        return s;
    }

    // adding static and instance methods
    String['contains'] = (s:string,delimiter:string):boolean =>
        s != null && delimiter != null && delimiter != "" && s.indexOf(delimiter) >= 0;

    String.prototype.contains = function(delimiter:string):boolean{
        return String.contains(this as any,delimiter);
    };
    // http://stackoverflow.com/a/1050782/57883
    Date['addHours'] = (dt:Date,h:number):void => {
        dt.setTime(dt.getTime() + (h*60*60*1000));
    }


    Date.prototype.addHours = function(h:number):void {
        Date.addHours(this, h);
    };
    Date.isValidDate = (dt:Date | undefined):boolean => {
        if(dt == null) return false;
        // check if it is a Date via https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
        if(typeof dt.getMonth !== "function")
            return false;
        if(!(dt instanceof Date) && Object.prototype.toString.call(dt) !== '[object Date]')
            return false;
        // check if it is a valid Date

        // `isNan <| dt.ValueOf()` is bad in some cases : `new Date('Do NOT Convert Me as a date 1')` still has a valueOf in spite of it being an Invalid Date
        var check1 = !isNaN(dt.valueOf());
        var check2 = dt.toString() != "Invalid Date";
        return !isNaN(dt.valueOf()) && check2;
    };

    if(!Date.today){
        Date.today = function():Date{
            var today = new Date();
            return new Date(today.getFullYear(), today.getMonth(), today.getDate());
        };
    }

    Date.prototype.yyyyMMdd = function(separator?:string) : string {
        var mm = this.getMonth() + 1;
        var dd = this.getDate().toString();
        if(separator == null) separator = '/';
        return [this.getFullYear(), mm < 10 ? '0' + mm : mm , dd as any < 10 ? '0' + dd : dd].join(separator);
    };
    Date.prototype.MMddyyyy = function(separator?:string) : string {
        var mm = this.getMonth() + 1;
        var dd = this.getDate().toString();
        if(separator == null) separator = '/';
        return [mm < 10 ? '0' + mm : mm , dd as any < 10 ? '0' + dd : dd,this.getFullYear()].join(separator);
    };
    Date['to_yyyyMMdd'] = function(dateish:any, separator?:string):string {
        if(dateish instanceof Date){
            return dateish.yyyyMMdd(separator);
        }
        return new Date(dateish).yyyyMMdd(separator);
    };
    Date['to_MMddyyyy'] = function(dateish:any, separator?:string):string {
        if(dateish instanceof Date){
            return dateish.MMddyyyy(separator);
        }
        return new Date(dateish).MMddyyyy(separator);
    };
    // from https://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
    Date.prototype.toDateInputValue = (function(){
        var local = new Date(this as any);
        local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
        return local.toJSON().slice(0,10);
    })

    // code from http://stackoverflow.com/a/149099/57883
    // c is the number of decimals to show
    // d is decimal separator
    // t is the thousands separator
    // this function uses redeclaration for brevity, so the implementation signature is slightly bastardized for ts
    Number.prototype.formatMoney = function (c: number | any, d?:string| any, t?:string| any):string {
        var n = this as any,
            c = isNaN(c = Math.abs(c)) ? 2 : c, // eslint-disable-line no-redeclare
            d = d == undefined ? "." : d, // eslint-disable-line no-redeclare
            t = t == undefined ? "," : t, // eslint-disable-line no-redeclare
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j:any = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : "");
    };

    // untested, going to use replace instead of remove
    // Array.prototype['remove'] = function<T>(item:T){
    // mutation : removes an item from the array, returning the removed item or undefined
    Array.prototype.remove = function<T>(item:T): T | undefined{
        const index = this.indexOf(item);
        if(index >=0)
            return this.splice(index,1)[0];
        return undefined;
    };

    // Array.prototype.replace = function<T>(item:T,replacement:T){
    Array.prototype.replace = function<T>(item:T,replacement:T):boolean{
        const index = this.indexOf(item);
        if(index >=0){
            this[index] = replacement;
            return true;
        } else{
            return false;
        }
    };

};
(function(this:void,exports:Extensions){
    addImpureExtensions();
    exports.findJsParent = exports.findJsParent || findJsParent;
    exports.isDifferent = exports.isDifferent = (x:any,y:any):boolean =>{
        var isX = x != null;
        var isY = y != null;
        if(!isX && !isY)
            return false;
        if(isX && !isY)
            return true;
        if(isY && !isX)
            return true;
        return x != y;
    };

    exports.todo = (msg?:string) => {
      console.error((msg ? msg +":" : '') + 'item stubbed as todo called');
    };
    exports.guid = () : Guid => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    exports.redirect = (url:Uri, app:{location?:Location, document?:{location:Location}} = (exports as any)) =>{
        console.log('redirecting to ', url);
        if(app.location != null){
            app.location.href = url;
        } else if (app.document != null){
            app.document.location.replace(url);
        } else {
            console.error('unable to find redirection mechanism');
        }
    }
    exports.post = (url:Uri, onLoad:Action1<ProgressEvent>,onFailure:Action1<ProgressEvent>, contentType:'application/x-www-form-urlencoded'|'application/json', data:object) =>{
        const oReq  = new XMLHttpRequest()
        oReq.addEventListener("load", onLoad as any);
        oReq.addEventListener("error", onFailure as any);
        oReq.open('POST', url, true);
        oReq.setRequestHeader('Content-type', contentType);
        switch(contentType)
        {
            case 'application/json':
                let body = JSON.stringify(data);
                oReq.send(body);
            break;
            case 'application/x-www-form-urlencoded':
            default: oReq.send(data as any);
            break;
        }
    }
    exports.fetchB = (url:Uri,onLoad:Action1<ProgressEvent>,onFailure:Action1<ProgressEvent>,method?:string) => {
            const oReq = new XMLHttpRequest();
            oReq.addEventListener("load", onLoad as any);
            oReq.addEventListener("error", onFailure as any);
            oReq.open(method || "GET", url);
            oReq.send();
    }
    exports.fetchBT = <T>(url:Uri, onLoad:Action1<T>, onFailure:Action1<ProgressEvent>, method?:string,onLoadFailure?:Action1<any>) => {
        var onLoadWrapped = (pe:ProgressEvent) => {
            console.group('fetchT onLoadWrapped', url);
            var t: XMLHttpRequest | undefined;
            try{
            // (exports as any).evt = evt;
                t = pe.target as XMLHttpRequest;
                if(t.status == 200){
                    if(t.getResponseHeader("Content-Type") !== ""){

                    }
                    var model = JSON.parse(t.responseText) as T;
                    onLoad(model);
                } else{
                    console.log('calling failure for status', t.status);
                    debugger;
                    onFailure(pe);
                }

            }catch(ex){
                if(onLoadFailure != undefined){
                    onLoadFailure(ex);
                } else{
                    console.error("fetchBT failed", ex);
                    throw ex;
                }

            }
            finally{
                console.groupEnd();
            }
        };
        exports.fetchB(url,onLoadWrapped, onFailure,method);
    };

    exports.inspect = <T> (x:T,title?:string,propNames?:string|string[]) : T => {
        const logIt = (value:any) => title? console.log(title,value) : console.log(value);
        if(propNames){
            if(Array.isArray(propNames)){
                propNames.map(propName => logIt((x as any)[propName]));
            } else {
                logIt((x as any)[propNames]);
            }
        } else logIt(x);
        return x;
    };

    exports.before = (s:string,delimiter:string):string => {
        if(!delimiter) throw Error('no delimiter provided in "' + s + "'.before(delimiter)");
        var i = s.indexOf(delimiter);
        if(i < 0) throw Error("delimiter('" + delimiter + "') not found in '" + s + "'");
        return s.substr(0,i);
    };
    String.prototype.before = function(delimiter:string):string {
        return exports.before(this as any,delimiter);
    };
    exports.after = (s:string,delimiter:string):string =>{
        if(!delimiter) throw Error('no delimiter provided in "' + s + "'.after(delimiter)");
        var i = s.indexOf(delimiter);
        if(i < 0) throw Error("delimiter('" + delimiter + "') not found in '" + s + "'");
        return s.substr(s.indexOf(delimiter) + delimiter.length);
    }
    String.prototype.after = function(delimiter:string):string {
        return exports.after(this as any,delimiter);
    };

    // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    var clone = exports.clone = function<T>(obj:T):T {

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            let copy = new Date() as any;
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array && Array.isArray(obj)) {
            let copy:any[] = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return (copy as any);
        }

        // Handle Object
        if (obj instanceof Object) {
            let copy = {} as T;
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy as T;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    // type PickDelegate =
    // since the syntax doesn't seem to support object literal picks {[key]:value}, make a syntax helper
    exports.makePick = <T, K extends keyof T>(key:K, value:T[K]):Pick<T,K> => {
        var x: Partial<T> = {};
        x[key] = value;
        return x as Pick<T,K>;
    };
    var pickValue = <T>() => {
        return <K extends keyof T>(value:Pick<T,K>) => value;
    };
    exports.makePickFromObj = pickValue;

    // add compiler error for places whose accept type is wider than what we want to be constrained to
    // https://schneidenbach.gitbooks.io/typescript-cookbook/nameof-operator.html
    exports.nameof = <T extends {}>(name: keyof T):keyof T => name;
    // const nameof = <T>(name: keyof T) => name;

    exports.flattenArray = <T> (a:T|T[],recurse?:boolean):T[] => {
        if(a == null) return [];
        if(Array.isArray(a)){
            var b = a as T[];
            var result :any[] = [].concat.apply([],b as any);
            if(!recurse)
                return result;
            var index;
            while (( index = result.findIndex(Array.isArray as any)) > -1)
                result.splice(index,1, ...result[index]);
            return result;
        }
        return [a];
    }

    exports.isDefined = (o:any):boolean => typeof o !== 'undefined' && o != null;


    exports.isPositive = (x:number):boolean => +x > 0;
    var getValidateClasses = exports.getValidateClasses =
        (isValid?:string | boolean):string[] =>{
            if(isValid === undefined) return [];
        // returning bootstrap-classes
            switch(isValid){
                case true:
                    return [];
                case 'success':
                    return ['has-success']
                case false:
                case 'danger':
                case 'error':
                    return ['has-error'];
                case 'warn':
                default :
                    return ['has-warning'];
            }
    }

    exports.debounce = (function(){
        var timer:number = 0;
        return (function(callback:((...args:any[]) => void), ms:number){
            if(typeof(callback) !== "function")
                throw callback;
            // this method does not ever throw, or complain if passed an invalid id
            clearTimeout(timer);
            // any needed here, because NodeJs returns a non-number type
            timer = setTimeout(callback,ms) as any; //setTimeout(callback,ms);
        });
    })();

    var debounceChange: DebounceChangeDelegate = function(callback: ActionAny, e, ...args){
        if(!exports.isDefined(callback)){
            console.info('no callback for debounceChange', e.target, typeof callback, callback);
            return;
        }
        e.persist();
        args.unshift(e.target.value);
        exports.debounce(()=> callback(...args), 500);
    };
    exports.debounceChange = debounceChange;
    return exports;
})(findJsParent());
// }