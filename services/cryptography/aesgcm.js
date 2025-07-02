/**
 * Dekripsi AES-GCM
 * @param {string|Buffer} sessionKey - Buffer atau Hex string dari key (16 byte)
 * @param {string} ivHex - IV dalam format HEX (misal hasil dari Buffer.from(base64).toString('hex'))
 * @param {Buffer} associatedData - Buffer dari AAD (Associated Data)
 * @param {string} cipherHex - Ciphertext dalam format HEX
 * @returns {string|null} - Plaintext jika berhasil, atau null jika gagal
 */
function decryptAESGCM(sessionKey, ivHex, associatedData, cipherHex) {
    try {
        // Pastikan key dalam bentuk Buffer
        const keyBuf = Buffer.isBuffer(sessionKey) ? sessionKey : Buffer.from(sessionKey, 'hex');

        // Buffer dari iv dan ciphertext
        const iv = Buffer.from(ivHex, 'hex');
        const cipherBuf = Buffer.from(cipherHex, 'hex');

        // Ambil tag dari akhir ciphertext (16 byte terakhir)
        const tag = cipherBuf.slice(cipherBuf.length - 16);
        const ciphertext = cipherBuf.slice(0, cipherBuf.length - 16);

        // Siapkan cipher
        const decipher = require('crypto').createDecipheriv('aes-128-gcm', keyBuf, iv);
        decipher.setAuthTag(tag);
        decipher.setAAD(associatedData);

        // Dekripsi
        let decrypted = decipher.update(ciphertext, null, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error('Gagal dekripsi:', err.message);
        return null;
    }
}

/**
 * Enkripsi AES-GCM
 * @param {string|Buffer} sessionKey - 128-bit key dalam bentuk Buffer atau hex string
 * @param {string} plaintext - Teks biasa yang akan dienkripsi
 * @param {Buffer} associatedData - Buffer dari AAD (Associated Data)
 * @returns {{ ivHex: string, cipherHex: string }} - IV dan cipher+tag dalam format hex
 */
function encryptAESGCM(sessionKey, plaintext, associatedData) {
    const crypto = require('crypto');

    // Konversi key ke Buffer jika perlu
    const keyBuf = Buffer.isBuffer(sessionKey) ? sessionKey : Buffer.from(sessionKey, 'hex');

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-gcm', keyBuf, iv);

    cipher.setAAD(associatedData);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const ciphertextWithTag = Buffer.concat([encrypted, tag]);

    return {
        ivHex: iv.toString('hex'),
        cipherHex: ciphertextWithTag.toString('hex')
    };
}

module.exports = { encryptAESGCM, decryptAESGCM };