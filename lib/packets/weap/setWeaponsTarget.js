// Selects a new target on the weapons console
exports.name = 'setWeaponsTarget';
exports.type = 0x4c821d3c;
exports.subtype = 0x02;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { target: data.readLong() };
};