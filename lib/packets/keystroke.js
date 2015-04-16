// The player at the console pressed a key
exports.name = 'keystroke';
exports.type = 0x4c821d3c;
exports.subtype = 0x14;
exports.pack = null;
exports.unpack = function(data) {
    return { code: data.readLong() };
};
