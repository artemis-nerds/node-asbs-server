/**
 * Gets update properties
 *
 * @param {Object} unpacked
 * @param {BufferReader} data
 * @param {*} bits
 */
module.exports = function(unpacked, data, bits) {
    if (bits.get(7)) unpacked.posX =        data.readFloat();
    if (bits.get(6)) unpacked.posY =        data.readFloat();
    if (bits.get(5)) unpacked.posZ =        data.readFloat();
    if (bits.get(4)) unpacked.shipName =    data.readString();
    if (bits.get(3)) unpacked.unknown1 =    data.readFloat();
    if (bits.get(2)) unpacked.unknown2 =    data.readFloat();
    if (bits.get(1)) unpacked.unknown3 =    data.readLong();
    if (bits.get(0)) unpacked.unknown4 =    data.readLong();
};