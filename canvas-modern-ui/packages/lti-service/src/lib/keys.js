import { exportJWK, importPKCS8 } from 'jose';
import { webcrypto } from 'node:crypto';
import { config } from './config.js';
// Make crypto available globally for jose library
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}
let cachedKeyPair = null;
export async function getToolKeyPair() {
    if (cachedKeyPair) {
        return cachedKeyPair;
    }
    try {
        // Import private key from PEM - jose returns a KeyLike object
        const privateKey = await importPKCS8(config.LTI_TOOL_PRIVATE_KEY_PEM, 'RS256');
        console.log('Private key imported successfully');
        // For jose library, we can use the private key directly for JWK export
        // No need to derive a separate public key
        cachedKeyPair = { publicKey: privateKey, privateKey };
        return cachedKeyPair;
    }
    catch (error) {
        console.error('Key loading error:', error);
        throw new Error(`Failed to load tool key pair: ${error instanceof Error ? error.message : String(error)}`);
    }
}
export async function getPublicJWK() {
    try {
        const { privateKey } = await getToolKeyPair();
        // Use the private key to export the public JWK
        const jwk = await exportJWK(privateKey);
        // Remove private key components and add metadata
        const publicJWK = {
            kty: jwk.kty,
            n: jwk.n,
            e: jwk.e,
            kid: config.LTI_TOOL_KID,
            alg: 'RS256',
            use: 'sig'
        };
        console.log('Public JWK generated successfully');
        return publicJWK;
    }
    catch (error) {
        console.error('getPublicJWK error:', error);
        throw error;
    }
}
// Note: Key generation is handled by the generate-keys.sh script
// This function is not used in production and has been removed to avoid TypeScript issues
//# sourceMappingURL=keys.js.map