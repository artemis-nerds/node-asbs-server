// Sets the beam frequency
exports.name = 'beamFrequency';
exports.type = 0x4c821d3c;
exports.subtype = 0x0b;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { frequency: data.readLong() };
};