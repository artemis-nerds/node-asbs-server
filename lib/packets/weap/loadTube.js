// Load tube packet
exports.name = 'loadTube';
exports.type = 0x69cc01d9;
exports.subtype = 0x02;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.tube);
    writer.writeLong(data.ordnance);
};
exports.unpack = function(data) {
    return {
        tube: data.readLong(),
        ordnance: data.readLong()
    };
};