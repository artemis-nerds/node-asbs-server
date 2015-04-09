// DMX message packet
exports.name = 'dmxMessage';
exports.type = 0xf754c8fe;
exports.subtype = 0x10;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeString(data.str);
    writer.writeLong(data.on);
};
exports.unpack = function(data) {
    return {
        str: data.readString(),
        on:  data.readLong()
    };
};