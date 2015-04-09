// Ship select packet
exports.name = 'shipSelect';
exports.type = 0x4c821d3c;
exports.subtype = 0x0d;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.shipIndex);
};
exports.unpack = function(data) {
    return { shipIndex: data.readLong() };
};