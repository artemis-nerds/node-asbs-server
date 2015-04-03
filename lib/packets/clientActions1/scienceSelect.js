// Selects a target on the science map
exports.name = 'scienceSelect';
exports.type = 0x4c821d3c;
exports.subtype = 0x10;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { target: data.readLong() };
};