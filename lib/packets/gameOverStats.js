// Game over stats packet
// Upon ending a game, tells the main screens the stats (vessels destroyed, etc)
exports.name = 'gameOverStats';
exports.type = 0xf754c8fe;
exports.subtype = 0x15;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeByte(data.column);

    for (var i = 0; i < data.stats.length; i++) {
        var stat = data.stats[i];
        writer.writeByte(0x00);
        writer.writeLong(data.count);
        writer.writeString(data.label);
    }
    writer.writeByte(0xce);
};
exports.unpack = function(data) {
    var stats = [];
    var column = data.readByte();
    var separator = data.readByte();

    while(separator !== 0xce) {
        stats.push({
            count: data.readLong(),
            label: data.readString()
        });
        separator = data.readByte();
    }

    return { column: column, stats: stats };
};