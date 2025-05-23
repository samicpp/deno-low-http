export class Stream{
    #readMode="char";
    #read:(obj?:{until?: Uint8Array, size?: number})=>number|Uint8Array;

    #writeMode="char";
    #write:(c: number|Uint8Array)=>boolean;

    write(buffer: Uint8Array):boolean{
        let bool=true;
        if(this.#writeMode=="char"){
            for(let i of buffer){
                bool=bool&&this.#write(i);
            }
        } else if(this.#writeMode=="buffer") {
            bool=this.#write(buffer);
        }
        return !!bool;
    };
    read(obj: {size?: number,until?: Uint8Array}={}): Uint8Array{
        const {size,until}={size:1, until: new Uint8Array(),...obj};
        let tot:any=[]; // is of type Uint8[]
        let matchIndex=0;
        let match=false;
        if(this.#readMode=="char"){
            for(let i=0;i<size;i++){
                let r; tot.push(r=this.#read());

                if(!until||until?.length==0){
                    //continue;
                }else if(match&&matchIndex<until.length){
                    match=until[matchIndex++]==r;
                }else if(match&&matchIndex==until.length){
                    break;
                }else if(until&&r==until[0]){
                    match=true;
                    matchIndex++;
                }
            };
        } else if(this.#readMode=="buffer") {
            tot=this.#read({size,until});
        }
        return new Uint8Array(tot);
    };

    constructor(obj:{read?:(obj?:{until?: Uint8Array, size?: number})=>number|Uint8Array,write?:(c: number|Uint8Array)=>boolean,mode?:string}={}){
        const {read,write,mode}={mode:"char",read(){return 0},write(obj){return false},...obj};
        this.#readMode=this.#writeMode=mode;
        this.#read=read;
        this.#write=write;
    };
}