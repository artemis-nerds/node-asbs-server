// Sound effect packet
exports.name = 'soundEffect';
exports.type = 0xf754c8fe;
exports.subtype = 0x03;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeString(data.filename);
};
exports.unpack = function(data) {
    return {
        filename: data.readString()
    };
};