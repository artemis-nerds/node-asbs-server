// Sends a DAMCON team to go to a particular grid location
exports.name = 'sendDamcon';
exports.type = 0x69cc01d9;
exports.subtype = 0x04;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        team: data.readLong(),
        locationX: data.readLong(),
        locationY: data.readLong(),
        locationZ: data.readLong()
    };
};