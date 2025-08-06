const { deriveKey } = require("../services/cryptography/hkdf");
const EC = require('elliptic').ec;
const ec = new EC('p256');
const sessionStore = require('../keys/sessionStore');
const HKDF = require('futoin-hkdf');
const crypto = require('crypto');

const keyExchange = async (req, res) => {
    const deviceId = req.body.device_id;
    const clientPubBase64 = req.body.pub_key;
    const saltBase64 = req.body.salt;

    try {
        if (!deviceId) {
            return res.status(400).send({
                error: 'Device ID is required.',
            });
        }

        if (!clientPubBase64) {
            return res.status(400).send({
                error: 'Pub key is required',
            });
        }

        if (!saltBase64) {
            return res.status(400).send({
                error: 'Salt is required',
            })
        }

        console.log(deviceId);
        console.log(clientPubBase64);

        // Generate server EC keypair
        const serverKey = ec.genKeyPair();

        // Decode client public key (assumed to be uncompressed point)
        const clientPubBuf = Buffer.from(clientPubBase64, 'base64');
        const clientKey = ec.keyFromPublic(clientPubBuf, 'hex');
        const salt = Buffer.from(saltBase64, 'base64');

        // Compute shared secret
        const sharedSecretBN = serverKey.derive(clientKey.getPublic()); // BN instance
        const sharedSecret = Buffer.from(sharedSecretBN.toArray());

        // Derive session key using HKDF-SHA256 (16-byte key)
        const info = Buffer.from([0x05, 0x06, 0x07, 0x08]);
        const sessionKeyBuf = deriveKey(sharedSecret, salt, info, 16); // 16-byte key
        const sessionKey = sessionKeyBuf.toString('hex');

        // Store session key in memory
        sessionStore.set(deviceId, {
            sessionKey: sessionKey,
            // serverPublicKey: serverKey.getPublic(false, 'hex'),
        });

        console.log(`[Server] Session key derived for ${deviceId}:`, sessionKey);

        // Respond with server public key in base64 (uncompressed)
        const serverPubKeyUncompressed = Buffer.from(serverKey.getPublic(false, 'hex'), 'hex');
        const serverPubB64 = serverPubKeyUncompressed.toString('base64');
        res.send(serverPubB64);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }

}

const keyExchangeClient = async (req, res) => {
    const { clientPublicKey, userId } = req.body;

    if (!userId) {
        return res.status(400).send({
            error: 'User ID is required.'
        })
    }

    if (!clientPublicKey) {
        return res.status(400).send({
            error: 'Pub key is required',
        });
    }

    try {
        console.log('test body: ', req.body);
        const serverKeyPair = ec.genKeyPair();

        // Decode client public key (assumed to be uncompressed point)
        const clientPubBuf = Buffer.from(clientPublicKey, 'base64');
        const clientKey = ec.keyFromPublic(clientPubBuf, 'array'); // gunakan 'array' agar cocok dengan client

        const shared = serverKeyPair.derive(ec.keyFromPublic(clientKey, 'hex').getPublic());
        console.log('sharedKey: ', shared);
        const salt = Buffer.from(crypto.randomBytes(16));
        console.log('salt: ', salt);
        const derivedKey = HKDF(shared, 16, { salt, info: 'ecdh-session', hash: 'SHA-256' });
        console.log('derivedKey: ', derivedKey);
        const sessionKey = derivedKey.toString('hex');

        // Store session key in memory
        sessionStore.set(userId, {
            sessionKey: sessionKey
        });

        console.log('auth store:', sessionStore.get(userId));

        res.json({
            serverPublicKey: serverKeyPair.getPublic('hex'),
            salt: salt.toString('hex')
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }

}

module.exports = { keyExchange, keyExchangeClient };
