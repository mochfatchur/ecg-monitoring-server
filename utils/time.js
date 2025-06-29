function checkTimestampDelay(deviceTs, serverTs, threshold = 5000) {
    const deviceTime = parseInt(deviceTs, 10);
    const serverTime = parseInt(serverTs, 10);
    const diff = serverTime - deviceTime;

    console.log("Waktu dari perangkat:", new Date(deviceTime).toISOString());
    console.log("Waktu di server    :", new Date(serverTime).toISOString());
    console.log("Selisih waktu      :", diff, "ms");

    if (diff > threshold) {
        console.warn(`⚠️  Data terlambat ${diff} ms (lebih dari ${threshold} ms)`);
    }

    return diff;
}

module.exports = { checkTimestampDelay };