export interface Addr {
    transport?: "tcp" | "udp" | "unix" | "unixpacket" | "unkown";
    hostname?: string;
    port?: number;
    path?: string;
};