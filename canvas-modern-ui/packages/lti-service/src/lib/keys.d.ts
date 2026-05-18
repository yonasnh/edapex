export declare function getToolKeyPair(): Promise<{
    publicKey: any;
    privateKey: any;
}>;
export declare function getPublicJWK(): Promise<{
    kty: string;
    n: string | undefined;
    e: string | undefined;
    kid: string;
    alg: string;
    use: string;
}>;
//# sourceMappingURL=keys.d.ts.map