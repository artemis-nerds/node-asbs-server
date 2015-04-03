// Game start packet
// FIXME: This doesn't seem to be sent on game restart. It is, however, sent whenever the player fires a torp

exports.name = 'gameStart';
exports.type = 0xf754c8fe;
exports.subtype = 0x00;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.unknown1);
    writer.writeLong(data.unknown2);
};
exports.unpack = function(data) {
    // FIXME: This seems to be emitted when an enemy ship is destroyed:
    // Known packet: gameStart { unknown1: 4, unknown2: 1176 }
    // Known packet: destroyObject { type: 4, id: 1176 }

    return {
        unknown1: data.readLong(),
        unknown2: data.readLong()
    };
};