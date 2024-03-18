import { Lazy } from 'https://deno.land/x/lazy_promise@0.0.1/mod.ts'
import { Gate } from 'https://deno.land/x/gate@0.0.0/mod.ts'

export type SomeSnail = <R>(f:<T>(Snail:Snail<T>)=>R)=>R

export class Snail<T> {

    lazy:Lazy<T>
    born:Promise<void>
    died:Promise<T>

    constructor(lazy:Lazy<T>) {
        const bornGate = new Gate<void>()
        const diedGate = new Gate<T>()
        this.born = bornGate.promise
        this.died = diedGate.promise
        this.lazy = () => {
            bornGate.resolve()
            lazy()
                .then(diedGate.resolve)
                .catch(reason => { diedGate.reject(reason) })
            return diedGate.promise
        }
    }

    static some<T>(snail:Snail<T>):SomeSnail { return f => f(snail) } 

}