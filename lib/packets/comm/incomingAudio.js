// Incoming audio packet
exports.name = 'incomingAudio';
exports.type = 0xae88e058;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);
    writer.writeLong(data.mode);
    if (data.mode === 2) {
        writer.writeString(data.title);
        writer.writeString(data.filename);
    }
};
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong();
    unpacked.mode = data.readLong();

    // 0 = deleted
    // 1 = played
    // 2 = incoming
    if (unpacked.mode === 2) {
        unpacked.title = data.readString();
        unpacked.filename = data.readString();
    }

    return unpacked;
};