// Selects a target on the game master's map
exports.name = 'gameMasterSelect';
exports.type = 0x3c821d3c;
exports.subtype = 0x12;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { target: data.readLong() };
};