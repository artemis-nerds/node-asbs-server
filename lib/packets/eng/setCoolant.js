// Sets the amount of coolant to be allocated to a system
exports.name = 'setCoolant';
exports.type = 0x69cc01d9;
exports.subtype = 0x00;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        system: data.readLong(),
        value: data.readLong(),
        unknown1: data.readLong(),
        unknown2: data.readLong()
    };
};