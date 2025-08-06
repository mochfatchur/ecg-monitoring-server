function flipRandomBitBase64(base64Str) {
  const buf = Buffer.from(base64Str, 'base64');
  const i = Math.floor(Math.random() * buf.length);
  buf[i] ^= 0x01; // flip 1 bit pada random byte
  return buf.toString('base64');
}

function tamperOneCharBase64(base64Str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const arr = base64Str.split('');

  // Pilih indeks acak (hindari karakter '=' padding agar tetap valid Base64)
  let i;
  do {
    i = Math.floor(Math.random() * arr.length);
  } while (arr[i] === '=');

  // Pilih karakter baru yang berbeda dari aslinya
  let newChar;
  do {
    newChar = chars[Math.floor(Math.random() * chars.length)];
  } while (newChar === arr[i]);

  // Ganti karakter pada indeks tersebut
  arr[i] = newChar;

  return arr.join('');
}


function runAEADTests(originalPayload, sessionKey, decryptFn) {
  const testCases = [
    { code: 'T-IS2', desc: 'Tidak memodifikasi data', tamper: (p) => p },
    { code: 'T-IS3', desc: 'Memodifikasi ciphertext data EKG yang dikirimkan', tamper: (p) => ({ ...p, msg: tamperOneCharBase64(p.msg) }) }
  ];

  for (const test of testCases) {
    const tamperedPayload = test.tamper(JSON.parse(originalPayload));

    // log
    if (test.code !== 'T-IS2') {
      console.log(`\n=== Payload Setelah Tampering (${test.code}) ===`);
      console.log(JSON.stringify(tamperedPayload, null, 2));
    }

    try {
      const decrypted = decryptFn(JSON.stringify(tamperedPayload), sessionKey);

      // ✅ cek jika decryptFn tidak throw tapi hasilnya null atau undefined
      if (decrypted === null || decrypted === undefined) {
        throw new Error("Hasil dekripsi kosong/null");
      }

      // ✅ evaluasi hasil berdasarkan test case
      if (test.code === 'T-IS3') {
        console.log(`[${test.code}] ${test.desc} -> [FAIL] Ciphertext terubah tetap bisa didekripsi:`, decrypted);
      } else {
        console.log(`[${test.code}] ${test.desc} -> [PASS] Payload valid didekripsi:`, decrypted);
      }

    } catch (err) {
      if (test.code === 'T-IS3') {
        console.log(`[${test.code}] ${test.desc} -> [PASS] Tampering terdeteksi (dekripsi gagal): ${err.message}`);
      } else {
        console.log(`[${test.code}] ${test.desc} -> [FAIL] Payload valid gagal didekripsi: ${err.message}`);
      }
    }
  }
}

module.exports = {
  runAEADTests
};
