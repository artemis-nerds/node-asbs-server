// Set ship name, type and drive type
exports.name = 'setShipSettings';
exports.type = 0x4c821d3c;
exports.subtype = 0x16;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        drive: data.readLong(),
        ship: data.readLong(),
        unknown: data.readLong(),
        name: data.readString()
    };
};