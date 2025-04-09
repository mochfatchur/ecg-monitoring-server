const crypto = require('crypto');

function deriveKey(sharedKey, salt, info, outputLength) {
    // Validate input
    if (!Buffer.isBuffer(sharedKey)) {
        sharedKey = Buffer.from(sharedKey);
    }
    if (!Buffer.isBuffer(salt)) {
        salt = Buffer.from(salt);
    }
    if (!Buffer.isBuffer(info)) {
        info = Buffer.from(info);
    }

    // HKDF with SHA-256
    const prk = crypto.createHmac('sha256', salt).update(sharedKey).digest(); // Step 1: Extract
    let okm = Buffer.alloc(0); // Output Keying Material
    let previous = Buffer.alloc(0);

    for (let i = 0, bytesGenerated = 0; bytesGenerated < outputLength; i++) {
        const hmac = crypto.createHmac('sha256', prk);
        hmac.update(previous); // T(n-1)
        hmac.update(info);     // Info
        hmac.update(Buffer.from([i + 1])); // Counter
        previous = hmac.digest();
        okm = Buffer.concat([okm, previous]);
        bytesGenerated += previous.length;
    }

    return okm.slice(0, outputLength); // Truncate to desired length
}




module.exports = { deriveKey };
