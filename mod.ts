import { Lazy } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/lazy@0.0.0/mod.ts'
import { Gate } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/gate@0.0.1/mod.ts'

export type SomeSnail = <R>(f:<T>(Snail:Snail<T>)=>R)=>R

export class Snail<T> {

    lazy:Lazy<T>
    born:Promise<void>
    died:Promise<T>
    signal?:AbortSignal

    constructor({ lazy, signal }:{ lazy:Lazy<T>, signal?:AbortSignal }) {
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
        this.signal = signal
    }

    static some<T>(snail:Snail<T>):SomeSnail { return f => f(snail) } 

}