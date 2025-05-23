import { Stream } from "./streams.ts";
import { Addr } from "./structs.ts";

export class NetStream extends Stream{
    #conn: Deno.Conn;

    get conn(){return this.#conn};

    async#read():Promise<number>{
        const u=new Uint8Array(1);
        await this.#conn.read(u);
        return u[0];
    };
    async#write(c: number):Promise<boolean>{
        await this.#conn.write(new Uint8Array([c]));
        return true;
    };

    remoteAddr(){
        return this.#conn.remoteAddr;
    }

    close(){
        this.#conn.close();
        super.close();
    };

    constructor(conn:Deno.Conn){
        super({read:()=>this.#read(),write: c=>this.#write(c)});
        this.#conn=conn;
    }
}