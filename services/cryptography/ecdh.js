const elliptic = require('elliptic');
const EC = elliptic.ec;

// Menggunakan kurva elliptic secp256r1 (alias P-256)
const ec = new EC('p256');

function ecdh(privateKey, otherPublicKey) {
    try {
        // Membuat pasangan kunci Bob dari private key
        const bobKey = ec.keyFromPrivate(privateKey, 'hex');
        var publicKey1 = bobKey.getPublic('hex');
        console.log('public key bob: ', publicKey1);

        // Membuat pasangan kunci Alice dari public key yang diterima
        const alicePublicKey = ec.keyFromPublic(otherPublicKey, 'hex');

        // Bob menghasilkan shared secret menggunakan public key Alice
        const bobSharedSecret = bobKey.derive(alicePublicKey.getPublic()).toArrayLike(Buffer, 'be', 32);

        console.log("Bob's Shared Secret (Normal Order):", bobSharedSecret.toString('hex'));

        // Reverse shared secret for comparison

        return bobSharedSecret;
    } catch (error) {
        console.error("Error:", error)
        return null;
    }
}

module.exports = { ecdh };
