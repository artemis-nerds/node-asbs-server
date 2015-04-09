// Provides an update on the status of a nebula

exports.name = 'nebulaUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x0a;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong();

    var bits = data.readBitArray(1);
    if (bits.get(7)) unpacked.posX          = data.readFloat();
    if (bits.get(6)) unpacked.posY          = data.readFloat();
    if (bits.get(5)) unpacked.posZ          = data.readFloat();
    if (bits.get(4)) unpacked.colorRed      = data.readFloat();
    if (bits.get(3)) unpacked.colorGreen    = data.readFloat();
    if (bits.get(2)) unpacked.colorBlue     = data.readFloat();

    return unpacked;
};