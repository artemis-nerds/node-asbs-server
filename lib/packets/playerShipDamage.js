// Player ship damage packet
// Perhaps this is not about the player ship being damaged, but about the
// screen shaking
exports.name = 'playerShipDamage';
exports.type = 0xf754c8fe;
exports.subtype = 0x05;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.unknown1);
    writer.writeFloat(data.unknown2);
};
exports.unpack = function(data) {
    return {
        unknown1: data.readLong(),

        // Seems to be around 1 for shield hits, around 2 for hull hits
        unknown2: data.readFloat()
    };
};