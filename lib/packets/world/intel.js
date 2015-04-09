// Intel packet
exports.name = 'intel';
exports.type = 0xee665279;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);
    writer.writeLong(data.unknown);
    writer.writeString(data.msg);
};
exports.unpack = function(data) {
    return {
        id: data.readLong(),
        unknown: data.readByte(),
        msg: data.readString()
    };
};