import { Stream } from "./streams.ts";
import { Addr } from "./structs.ts";

export class Eventable {
    #que: Record<string, any[]> = {};
    #listeners: Record<string, Array<(event: any) => Promise<void> | void>> = {};
    on(name: string, listener: (event: any) => Promise<void> | void): number {
        let index = 0;
        if (this.#listeners[name]) index = this.#listeners[name].push(listener);
        else this.#listeners[name] = [listener];

        if (this.#que[name]) {
            for (let i in this.#que[name]) {
                listener(this.#que[name][i]);
                this.#que[name].splice(i, 1);
            }
        };

        return index;
    };
    emit(name: string, event: any, async = false): number[] | Promise<number[]> {
        let errs: number[] = [];
        if (this.#listeners[name] && async) {
            return async function () {
                for (let i in this.#listeners[name]) {
                    let f = this.#listeners[name][i];
                    await (async function () { return f(event) })().then(e => errs.push(i));
                }
                return errs;
            }();
        } else if (this.#listeners[name]) {
            for (let i in this.#listeners[name]) {
                let f = this.#listeners[name][i];
                try {
                    f(event);
                } catch (error) {
                    errs.push(i);
                };
            }
        } else if (!this.#listeners[name]) {
            if (this.#que[name]) this.#que[name].push(event);
            else this.#que[name] = [event];
        };
        return errs;
    }
}

export class Socket extends EventTarget {
    #stream: Stream;
    #addr: Addr;

    get conn() { return this.#stream };
    get addr() { return this.#addr };
    get remoteAddr() { return this.#addr };
    constructor(conn: Stream) {
        super();
        this.#addr = conn.addr;
        this.#stream = conn;
    }
}