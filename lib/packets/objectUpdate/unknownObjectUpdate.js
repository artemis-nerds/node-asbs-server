// Provides an update on the status of an unknown object

exports.name = 'upgradesUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x04;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong();

    var bits = data.readBitArray(7);

    if (bits.get(7)) {  unpacked.unknown07 = data.readLong();}
    if (bits.get(6)) {  unpacked.unknown06 = data.readLong();}
    if (bits.get(5)) {  unpacked.unknown05 = data.readLong();}
    if (bits.get(4)) {  unpacked.unknown04 = data.readLong();}
    if (bits.get(3)) {  unpacked.unknown03 = data.readLong();}
    if (bits.get(2)) {  unpacked.unknown02 = data.readLong();}
    if (bits.get(1)) {  unpacked.unknown01 = data.readLong(); }
    if (bits.get(0)) {  unpacked.unknown00 = data.readLong(); }

    if (bits.get(15)) { unpacked.unknown15 = data.readLong();}
    if (bits.get(14)) { unpacked.unknown14 = data.readLong(); }
    if (bits.get(13)) { unpacked.unknown13 = data.readLong(); }
    if (bits.get(12)) { unpacked.unknown12 = data.readLong();}
    if (bits.get(11)) { unpacked.unknown11 = data.readLong();}
    if (bits.get(10)) { unpacked.unknown10 = data.readLong();}
    if (bits.get(9))  { unpacked.unknown09 = data.readLong();}
    if (bits.get(8))  { unpacked.unknown08 = data.readLong();}

    if (bits.get(23)) { unpacked.unknown23 = data.readLong();}
    if (bits.get(22)) { unpacked.unknown22 = data.readLong();}
    if (bits.get(21)) { unpacked.unknown21 = data.readLong();}
    if (bits.get(20)) { unpacked.unknown20 = data.readLong();}
    if (bits.get(19)) { unpacked.unknown19 = data.readLong();}
    if (bits.get(18)) { unpacked.unknown18 = data.readLong();}
    if (bits.get(17)) { unpacked.unknown17 = data.readLong();}
    if (bits.get(16)) { unpacked.unknown16 = data.readLong();}

    if (bits.get(27)) { unpacked.unknown27 = data.readLong(); }
    if (bits.get(26)) { unpacked.unknown26 = data.readLong(); }
    if (bits.get(25)) { unpacked.unknown25 = data.readLong(); }
    if (bits.get(24)) { unpacked.unknown24 = data.readLong(); }

    return unpacked;
};