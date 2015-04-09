// Game message packet
exports.name = 'gameMessage';
exports.type = 0xf754c8fe;
exports.subtype = 0x0a;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeString(data.msg);
};
exports.unpack = function(data) {
    return {
        msg: data.readString()
    };
};