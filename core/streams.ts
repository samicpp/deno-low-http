import { Addr } from "./structs";

export class Stream{
    #closed=false;
    close(){
        this.#closed=true;
    };
    get isOpen(){return !this.#closed};
    get isClosed(){return this.#closed};

    #readMode="char";
    #read:(obj?:{until?: Uint8Array, size?: number})=>Promise<number|Uint8Array>;

    #writeMode="char";
    #write:(c: number|Uint8Array)=>Promise<boolean>;

    async write(buffer: Uint8Array):Promise<boolean|null>{
        if(this.#closed)return null;
        let bool=true;
        if(this.#writeMode=="char"){
            for(let i of buffer){
                bool=bool&&await this.#write(i).catch(e=>false);
            }
        } else if(this.#writeMode=="buffer") {
            bool=await this.#write(buffer).catch(e=>false);
        }
        return !!bool;
    };
    async read(obj: {size?: number,until?: Uint8Array}={}): Promise<Uint8Array<ArrayBufferLike>|null>{
        if(this.#closed)return null;
        const {size,until}={size:1, until: new Uint8Array(),...obj};
        let tot:number[]=[];//new Uint8Array(size); // is of type Uint8[]
        let matchIndex=0;
        let match=false;
        if(this.#readMode=="char"){
            for(let i=0;i<size;i++){
                let r; tot[i]=r=await this.#read().catch(e=>0);

                if(!until||until?.length==0){
                    //continue;
                }else if(match&&matchIndex<until.length){
                    match=until[matchIndex++]==r;
                }/*else if(match&&matchIndex==until.length){
                    break;
                }*/else if(until&&r==until[0]){
                    match=true;
                    matchIndex++;
                }if(match&&matchIndex==until.length){
                    break;
                }
            };
        } else if(this.#readMode=="buffer") {
            tot=await this.#read({size,until}).catch(e=>[]);
        }
        return new Uint8Array(tot);
    };

    #addr:Addr={transport:"unkown"};
    get addr(){return this.#addr};
    

    constructor(obj:{
        read?:(obj?:{until?: Uint8Array, size?: number})=>Promise<number|Uint8Array>,
        write?:(c: number|Uint8Array)=>any,
        mode?:string
    }={}, addr?: Addr){
        const {read,write,mode}={mode:"char",read(){return 0},write(obj){return false},...obj};
        this.#readMode=this.#writeMode=mode;
        this.#read=async function(obj){return read(obj)};
        this.#write=async function(c){return write(c)};
        this.#addr={...this.#addr,...addr};
    };
};

//export class CachableStream{}