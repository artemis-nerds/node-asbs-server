// Sets whether or not this client will serve at a particular bridge console
exports.name = 'setConsole';
exports.type = 0x4c821d3c;
exports.subtype = 0x0e;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        type: data.readLong(),
        selected: data.readLong()
    };
};