import { NetStream } from "./net-stream.ts";

export async function* iterTcpStream(port:number,hostname="0.0.0.0"){
    const tcp=Deno.listen({port, hostname});
    for await (const conn of tcp) {
        yield new NetStream(conn);
    };
};