// Starts a science scan of the given target
exports.name = 'scienceScan';
exports.type = 0x3c821d3c;
exports.subtype = 0x13;
exports.pack = null;
exports.unpack = function(data) {
    return { target: data.readLong() };
};