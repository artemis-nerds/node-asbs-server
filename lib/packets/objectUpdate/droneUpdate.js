// Provides an update on the status of a drone

exports.name = 'droneUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x11;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    var unpacked = {};

    var initialPointer = data.pointer;
    unpacked.id = data.readLong(0);

    var bits = data.readBitArray(2);
    if (bits.get(7)) unpacked.damage =      data.readLong();
    if (bits.get(6)) unpacked.posX =        data.readFloat();
    if (bits.get(5)) unpacked.unknown2 =    data.readFloat();
    if (bits.get(4)) unpacked.posZ =        data.readFloat();
    if (bits.get(3)) unpacked.unknown3 =    data.readFloat();
    if (bits.get(2)) unpacked.posY =        data.readFloat();
    if (bits.get(1)) unpacked.heading =     data.readFloat();
    if (bits.get(0)) unpacked.unknown4 =    data.readLong(); // looks like some kind of flags?

    if (bits.get(15)) unpacked.unknown5 =   data.readFloat();

    return unpacked;
};