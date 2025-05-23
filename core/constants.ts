// universal
export const textEncoder=new TextEncoder;
export const textDecoder=new TextDecoder;
export const decenc=new class TextTranscoder{
    #td=new TextDecoder; #te=new TextEncoder;
    td(input?: BufferSource, options?: TextDecodeOptions){
        return this.#td.decode(input,options)
    };
    te(input?: string){
        return this.#te.encode(input);
    }
}

// http/1.1
export const HttpEndHeaders=new Uint8Array([13,10,13,10]);
