// Fire tube packet
exports.name = 'fireTube';
exports.type = 0x4c821d3c;
exports.subtype = 0x08;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.tube);
};
exports.unpack = function(data) {
    return { tube: data.readLong() };
};