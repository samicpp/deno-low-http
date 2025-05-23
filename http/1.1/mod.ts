import { Socket } from "../../core/socket.ts";
import { Stream } from "../../core/streams.ts";
import { HttpEndHeaders, decenc } from "../../core/constants.ts";
import { NetStream } from "../../mod.ts";
import { Addr } from "../../core/structs.ts";

export class HttpSocket extends Socket{
    //#firstUntil=new Uint8Array([13,10,13,10]); // "\r\n\r\n"
    #buffer=new Uint8Array(1*1024**2); // 1mb
    #bytesRead=0;
    #client=new HttpClient;

    async#init(){
        this.#parser();
        //this.#readLoop();
    }

    async#readLoop(amount=1){
        for(let i=0;i<amount;i++){
            const byte=await this.conn.read();
            if(byte==null)break;
            this.#buffer[this.#bytesRead++]=byte[0];
        }
    }
    async #parser(){
        // const ret=await this.conn.read({size:65536,until:HttpEndHeaders})||new Uint8Array;
        // const str=decenc.td(ret).replaceAll("\r\n","\n");
        // const arr=str.split("\n");
        // const mpv=arr.splice(0,1)[0].split(" ");
        
        //let statement=true;
        let lastLen=0;
        let str:string;
        while(true){
            if(lastLen!=this.#bytesRead){
                str=decenc.td(this.#buffer.subarray(0,this.#bytesRead));
                if(str.match(/\r\n\r\n/)){
                    break;
                }else{
                    lastLen=this.#bytesRead;
                };
            };
            this.#readLoop(1);
        };
        const [hstr]=str.split("\r\n\r\n");
        const bopa=str.replace(hstr+"\r\n\r\n","");
        const head=hstr.split("\r\n");
        const mpv=head.splice(0,1)[0].split(" "); 
        this.#client.method=mpv[0];
        this.#client.path=mpv[1];
        this.#client.version=mpv[2];
        for(const hv of head){
            const [h,v]=hv.split(": ");
            if(!this.#client.headers[h])this.#client.headers[h]=[v];
            else this.#client.headers[h].push(v);
        };
    };


    constructor(conn: NetStream, initialData: Uint8Array=new Uint8Array){
        super(conn);
        initialData.forEach((c,i)=>this.#buffer[i]=c);
        this.#bytesRead=initialData.length;
        this.#init();
    };
};


export class HttpClient{
    valid:boolean=false;
    path:string="/";
    version:string="http/1.1";
    method:string="GET";
    headers:Record<string,string[]>={};
    addr:Deno.NetAddr={transport:"tcp",hostname:"127.0.0.1",port:1};
    data:()=>Uint8Array;
    awaitData:()=>Promise<Uint8Array>;
}