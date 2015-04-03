// Game over reason packet
// When the game ends, tells the main screen consoles why the game has ended.
exports.name = 'gameOverReason';
exports.type = 0xf754c8fe;
exports.subtype = 0x14;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeString(data.title);
    writer.writeString(data.reason);
};
exports.unpack = function(data) {
    return {
        title:  data.readString(),
        reason: data.readString()
    };
};