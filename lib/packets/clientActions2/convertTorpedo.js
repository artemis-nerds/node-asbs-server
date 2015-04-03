// Converts a homing torpedo to energy or vice versa
exports.name = 'convertTorpedo';
exports.type = 0x69cc01d9;
exports.subtype = 0x03;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { direction: data.readFloat() };
};