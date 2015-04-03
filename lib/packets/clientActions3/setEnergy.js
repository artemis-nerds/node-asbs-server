// Sets the amount of energy to be allocated to a system
exports.name = 'setEnergy';
exports.type = 0x0351a5ac;
exports.subtype = 0x04;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        value: data.readFloat(),
        system: data.readLong()
    };
};