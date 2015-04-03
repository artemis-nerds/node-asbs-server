// Provides an update on the status of a flock of space whales

exports.name = 'whaleUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x10;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong(0);

    var bits = data.readBitArray(2);
    if (bits.get(7)) unpacked.shipName  = data.readString();
    if (bits.get(6)) unpacked.unknown1  = data.readLong();
    if (bits.get(5)) unpacked.unknown2  = data.readLong();
    if (bits.get(4)) unpacked.posX      = data.readFloat();
    if (bits.get(3)) unpacked.posY      = data.readFloat();
    if (bits.get(2)) unpacked.posZ      = data.readFloat();
    if (bits.get(1)) unpacked.pitch     = data.readFloat();
    if (bits.get(0)) unpacked.roll      = data.readFloat();

    if (bits.get(15)) unpacked.heading  = data.readFloat();
    if (bits.get(14)) unpacked.unknown3 = data.readLong();
    if (bits.get(13)) unpacked.unknown4 = data.readFloat();
    if (bits.get(12)) unpacked.unknown5 = data.readFloat(); // from 0   to 0.855
    if (bits.get(11)) unpacked.unknown6 = data.readFloat(); // from 0.5 to 1.36

    return unpacked;
};