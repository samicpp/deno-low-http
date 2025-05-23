import { Socket } from "../../core/socket.ts";
import { Stream } from "../../core/streams.ts";

export class HttpSocket extends Socket{
    constructor(conn: Stream){
        super(conn);
    };
}