function checkTimestampDelay(deviceTs, serverTs, threshold = 5) {
    const deviceTime = parseInt(deviceTs, 10);
    const serverTime = parseInt(serverTs, 10);
    const diff = serverTime - deviceTime;

    console.log("Waktu dari perangkat:", new Date(deviceTime * 1000).toISOString());
    console.log("Waktu di server    :", new Date(serverTime * 1000).toISOString());
    console.log("Selisih waktu      :", diff, "detik");

    if (diff > threshold) {
        console.warn(`⚠️  Data terlambat ${diff} detik (lebih dari ${threshold}s)`);
    }

    return diff;
}

module.exports = { checkTimestampDelay };